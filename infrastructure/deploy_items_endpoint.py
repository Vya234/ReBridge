"""
Deploys the get_items_by_category Lambda and adds GET /items/{category} route
to the existing ReBridge API Gateway.
"""

import boto3
import json
import os
import zipfile
import io
import time

REGION = "ap-south-1"
RUNTIME = "python3.12"
FUNCTION_NAME = "get_items_by_category"
ROLE_NAME = "ReBridge-Lambda-Role"
API_NAME = "ReBridge-API"
TIMEOUT = 30
MEMORY_SIZE = 256

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAMBDAS_DIR = os.path.join(BASE_DIR, "lambdas")
SHARED_DIR = os.path.join(LAMBDAS_DIR, "shared")

lambda_client = boto3.client("lambda", region_name=REGION)
iam_client = boto3.client("iam", region_name=REGION)
apigw = boto3.client("apigatewayv2", region_name=REGION)
sts = boto3.client("sts", region_name=REGION)


def get_role_arn():
    response = iam_client.get_role(RoleName=ROLE_NAME)
    return response["Role"]["Arn"]


def package_lambda():
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        handler_path = os.path.join(LAMBDAS_DIR, FUNCTION_NAME, "handler.py")
        zf.write(handler_path, "handler.py")
        for filename in os.listdir(SHARED_DIR):
            if filename.endswith(".py"):
                zf.write(os.path.join(SHARED_DIR, filename), filename)
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
    # Get Lambda ARN
    fn = lambda_client.get_function(FunctionName=FUNCTION_NAME)
    lambda_arn = fn["Configuration"]["FunctionArn"]

    # Create integration
    integration = apigw.create_integration(
        ApiId=api_id,
        IntegrationType="AWS_PROXY",
        IntegrationUri=lambda_arn,
        PayloadFormatVersion="2.0",
    )
    integration_id = integration["IntegrationId"]

    # Create route
    apigw.create_route(
        ApiId=api_id,
        RouteKey="GET /items/{category}",
        Target=f"integrations/{integration_id}",
    )
    print("Created route: GET /items/{category}")

    # Add permission
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
        print(f"Added invoke permission for {FUNCTION_NAME}")
    except lambda_client.exceptions.ResourceConflictException:
        print("Permission already exists")


if __name__ == "__main__":
    print("Deploying get_items_by_category endpoint...")
    role_arn = get_role_arn()
    deploy_lambda(role_arn)
    api_id = get_api_id()
    add_route(api_id)
    print(f"\nDone! GET https://{api_id}.execute-api.{REGION}.amazonaws.com/items/{{category}}")
