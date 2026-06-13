"""
Deploys:
1. GreenWallet DynamoDB table
2. get_wallet Lambda
3. GET /wallet/{user_id} API Gateway route
"""

import boto3
import json
import os
import zipfile
import io
from botocore.exceptions import ClientError

REGION = "ap-south-1"
RUNTIME = "python3.12"
TABLE_NAME = "GreenWallet"
FUNCTION_NAME = "get_wallet"
ROLE_NAME = "ReBridge-Lambda-Role"
API_NAME = "ReBridge-API"
TIMEOUT = 10
MEMORY_SIZE = 128

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAMBDAS_DIR = os.path.join(BASE_DIR, "lambdas")
SHARED_DIR = os.path.join(LAMBDAS_DIR, "shared")

dynamodb_client = boto3.client("dynamodb", region_name=REGION)
lambda_client = boto3.client("lambda", region_name=REGION)
iam_client = boto3.client("iam", region_name=REGION)
apigw = boto3.client("apigatewayv2", region_name=REGION)
sts = boto3.client("sts", region_name=REGION)


def create_wallet_table():
    """Create GreenWallet DynamoDB table."""
    try:
        dynamodb_client.create_table(
            TableName=TABLE_NAME,
            KeySchema=[{"AttributeName": "user_id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "user_id", "AttributeType": "S"}],
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


def package_lambda():
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(os.path.join(LAMBDAS_DIR, FUNCTION_NAME, "handler.py"), "handler.py")
        for f in os.listdir(SHARED_DIR):
            if f.endswith(".py"):
                zf.write(os.path.join(SHARED_DIR, f), f)
    zip_buffer.seek(0)
    return zip_buffer.read()


def deploy_lambda(role_arn):
    zip_bytes = package_lambda()
    try:
        lambda_client.get_function(FunctionName=FUNCTION_NAME)
        lambda_client.update_function_code(FunctionName=FUNCTION_NAME, ZipFile=zip_bytes)
        print(f"Updated Lambda: {FUNCTION_NAME}")
    except lambda_client.exceptions.ResourceNotFoundException:
        lambda_client.create_function(
            FunctionName=FUNCTION_NAME,
            Runtime=RUNTIME,
            Role=role_arn,
            Handler="handler.lambda_handler",
            Code={"ZipFile": zip_bytes},
            Timeout=TIMEOUT,
            MemorySize=MEMORY_SIZE,
        )
        waiter = lambda_client.get_waiter("function_active_v2")
        waiter.wait(FunctionName=FUNCTION_NAME)
        print(f"Created Lambda: {FUNCTION_NAME}")


def get_api_id():
    apis = apigw.get_apis()["Items"]
    for api in apis:
        if api["Name"] == API_NAME:
            return api["ApiId"]
    raise Exception(f"API '{API_NAME}' not found")


def add_route(api_id):
    fn = lambda_client.get_function(FunctionName=FUNCTION_NAME)
    lambda_arn = fn["Configuration"]["FunctionArn"]

    integration = apigw.create_integration(
        ApiId=api_id,
        IntegrationType="AWS_PROXY",
        IntegrationUri=lambda_arn,
        PayloadFormatVersion="2.0",
    )

    apigw.create_route(
        ApiId=api_id,
        RouteKey="GET /wallet/{user_id}",
        Target=f"integrations/{integration['IntegrationId']}",
    )
    print("Created route: GET /wallet/{user_id}")

    account_id = sts.get_caller_identity()["Account"]
    source_arn = f"arn:aws:execute-api:{REGION}:{account_id}:{api_id}/*/*"
    try:
        lambda_client.add_permission(
            FunctionName=FUNCTION_NAME,
            StatementId=f"apigateway-invoke-{FUNCTION_NAME}",
            Action="lambda:InvokeFunction",
            Principal="apigateway.amazonaws.com",
            SourceArn=source_arn,
        )
    except lambda_client.exceptions.ResourceConflictException:
        pass


if __name__ == "__main__":
    print("Deploying Green Wallet system...")
    create_wallet_table()
    role_arn = get_role_arn()
    deploy_lambda(role_arn)
    api_id = get_api_id()
    add_route(api_id)
    print(f"\nDone! GET https://{api_id}.execute-api.{REGION}.amazonaws.com/wallet/{{user_id}}")
