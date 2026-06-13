"""
Deploys the P2P Chat WebSocket system:
1. ChatConnections DynamoDB table
2. Three Lambda functions (connect, disconnect, message)
3. WebSocket API Gateway with routes
"""

import boto3
import json
import os
import zipfile
import io
import time
from botocore.exceptions import ClientError

REGION = "ap-south-1"
RUNTIME = "python3.12"
ROLE_NAME = "ReBridge-Lambda-Role"
TABLE_NAME = "ChatConnections"
WS_API_NAME = "ReBridge-Chat-WS"
TIMEOUT = 10
MEMORY_SIZE = 128

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WS_DIR = os.path.join(BASE_DIR, "lambdas", "websocket")

dynamodb_client = boto3.client("dynamodb", region_name=REGION)
lambda_client = boto3.client("lambda", region_name=REGION)
iam_client = boto3.client("iam", region_name=REGION)
apigw = boto3.client("apigatewayv2", region_name=REGION)
sts = boto3.client("sts", region_name=REGION)


def create_chat_table():
    """Create ChatConnections DynamoDB table."""
    try:
        dynamodb_client.create_table(
            TableName=TABLE_NAME,
            KeySchema=[{"AttributeName": "connectionId", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "connectionId", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        print(f"Creating table '{TABLE_NAME}'...")
        waiter = dynamodb_client.get_waiter("table_exists")
        waiter.wait(TableName=TABLE_NAME)
        print(f"Table '{TABLE_NAME}' is ACTIVE.")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print(f"Table '{TABLE_NAME}' already exists.")
        else:
            raise


def get_role_arn():
    return iam_client.get_role(RoleName=ROLE_NAME)["Role"]["Arn"]


def package_lambda(filename):
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        filepath = os.path.join(WS_DIR, filename)
        zf.write(filepath, filename)
    zip_buffer.seek(0)
    return zip_buffer.read()


def deploy_lambda(function_name, filename, role_arn):
    zip_bytes = package_lambda(filename)
    try:
        lambda_client.get_function(FunctionName=function_name)
        lambda_client.update_function_code(FunctionName=function_name, ZipFile=zip_bytes)
        print(f"Updated Lambda: {function_name}")
    except lambda_client.exceptions.ResourceNotFoundException:
        lambda_client.create_function(
            FunctionName=function_name,
            Runtime=RUNTIME,
            Role=role_arn,
            Handler=f"{filename.replace('.py', '')}.lambda_handler",
            Code={"ZipFile": zip_bytes},
            Timeout=TIMEOUT,
            MemorySize=MEMORY_SIZE,
        )
        waiter = lambda_client.get_waiter("function_active_v2")
        waiter.wait(FunctionName=function_name)
        print(f"Created Lambda: {function_name}")


def get_lambda_arn(function_name):
    fn = lambda_client.get_function(FunctionName=function_name)
    return fn["Configuration"]["FunctionArn"]


def create_websocket_api():
    """Create WebSocket API with routes."""
    # Check if it already exists
    apis = apigw.get_apis()["Items"]
    for api in apis:
        if api["Name"] == WS_API_NAME and api.get("ProtocolType") == "WEBSOCKET":
            print(f"WebSocket API '{WS_API_NAME}' already exists: {api['ApiId']}")
            return api["ApiId"]

    response = apigw.create_api(
        Name=WS_API_NAME,
        ProtocolType="WEBSOCKET",
        RouteSelectionExpression="$request.body.action",
    )
    api_id = response["ApiId"]
    print(f"Created WebSocket API: {api_id}")
    return api_id


def create_ws_integration(api_id, lambda_arn):
    response = apigw.create_integration(
        ApiId=api_id,
        IntegrationType="AWS_PROXY",
        IntegrationUri=lambda_arn,
    )
    return response["IntegrationId"]


def create_ws_route(api_id, route_key, integration_id):
    apigw.create_route(
        ApiId=api_id,
        RouteKey=route_key,
        Target=f"integrations/{integration_id}",
    )
    print(f"  Route: {route_key}")


def add_ws_permission(function_name, api_id):
    account_id = sts.get_caller_identity()["Account"]
    source_arn = f"arn:aws:execute-api:{REGION}:{account_id}:{api_id}/*"
    try:
        lambda_client.add_permission(
            FunctionName=function_name,
            StatementId=f"ws-invoke-{function_name}",
            Action="lambda:InvokeFunction",
            Principal="apigateway.amazonaws.com",
            SourceArn=source_arn,
        )
    except lambda_client.exceptions.ResourceConflictException:
        pass


def deploy_stage(api_id):
    try:
        apigw.create_stage(
            ApiId=api_id,
            StageName="production",
            AutoDeploy=True,
        )
        print("Created 'production' stage with auto-deploy")
    except ClientError as e:
        if "ConflictException" in str(type(e)):
            print("Stage 'production' already exists")
        else:
            # Try to create deployment instead
            try:
                apigw.create_deployment(ApiId=api_id, StageName="production")
                print("Deployed to 'production' stage")
            except Exception:
                print("Stage may already exist, continuing...")


if __name__ == "__main__":
    print("=" * 50)
    print("  Deploying ReBridge P2P Chat (WebSocket)")
    print("=" * 50)

    # 1. DynamoDB
    print("\n[1/4] DynamoDB table...")
    create_chat_table()

    # 2. Lambdas
    print("\n[2/4] Lambda functions...")
    role_arn = get_role_arn()

    lambdas = {
        "ws_connect": "connect.py",
        "ws_disconnect": "disconnect.py",
        "ws_message": "message.py",
    }
    for name, filename in lambdas.items():
        deploy_lambda(name, filename, role_arn)

    # 3. WebSocket API
    print("\n[3/4] WebSocket API Gateway...")
    api_id = create_websocket_api()

    # Create integrations and routes
    routes = {
        "$connect": "ws_connect",
        "$disconnect": "ws_disconnect",
        "sendMessage": "ws_message",
    }
    for route_key, fn_name in routes.items():
        arn = get_lambda_arn(fn_name)
        integration_id = create_ws_integration(api_id, arn)
        create_ws_route(api_id, route_key, integration_id)
        add_ws_permission(fn_name, api_id)

    # 4. Deploy stage
    print("\n[4/4] Deploying stage...")
    deploy_stage(api_id)

    ws_url = f"wss://{api_id}.execute-api.{REGION}.amazonaws.com/production"
    print(f"\n{'=' * 50}")
    print(f"  WebSocket URL: {ws_url}")
    print(f"{'=' * 50}")
