"""
ReBridge One-Click Deployment
Runs in order:
  1. Creates DynamoDB table
  2. Packages and deploys Lambda functions
  3. Sets up API Gateway
"""

import boto3
import json
import os
import zipfile
import io

REGION = "ap-south-1"
RUNTIME = "python3.12"
ROLE_NAME = "ReBridge-Lambda-Role"
TIMEOUT = 30
MEMORY_SIZE = 256

lambda_client = boto3.client("lambda", region_name=REGION)
iam_client = boto3.client("iam", region_name=REGION)
sts_client = boto3.client("sts", region_name=REGION)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LAMBDAS_DIR = os.path.join(BASE_DIR, "lambdas")
SHARED_DIR = os.path.join(LAMBDAS_DIR, "shared")


LAMBDA_TRUST_POLICY = json.dumps({
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {"Service": "lambda.amazonaws.com"},
            "Action": "sts:AssumeRole",
        }
    ],
})

LAMBDA_POLICY_ARNS = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess",
    "arn:aws:iam::aws:policy/AmazonBedrockFullAccess",
]


def create_lambda_role() -> str:
    """Create or get the Lambda execution role."""
    try:
        response = iam_client.get_role(RoleName=ROLE_NAME)
        role_arn = response["Role"]["Arn"]
        print(f"Using existing role: {ROLE_NAME}")
        return role_arn
    except iam_client.exceptions.NoSuchEntityException:
        pass

    print(f"Creating IAM role: {ROLE_NAME}...")
    response = iam_client.create_role(
        RoleName=ROLE_NAME,
        AssumeRolePolicyDocument=LAMBDA_TRUST_POLICY,
        Description="Execution role for ReBridge Lambda functions",
    )
    role_arn = response["Role"]["Arn"]

    for policy_arn in LAMBDA_POLICY_ARNS:
        iam_client.attach_role_policy(RoleName=ROLE_NAME, PolicyArn=policy_arn)
        print(f"  Attached: {policy_arn.split('/')[-1]}")

    # Wait for role to propagate
    import time
    print("  Waiting for role propagation (10s)...")
    time.sleep(10)

    return role_arn


def package_lambda(function_dir: str) -> bytes:
    """Package a Lambda function + shared code into a zip."""
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add the handler
        handler_path = os.path.join(function_dir, "handler.py")
        zf.write(handler_path, "handler.py")

        # Add shared modules
        for filename in os.listdir(SHARED_DIR):
            if filename.endswith(".py"):
                filepath = os.path.join(SHARED_DIR, filename)
                zf.write(filepath, filename)

    zip_buffer.seek(0)
    return zip_buffer.read()


def deploy_lambda(function_name: str, function_dir: str, role_arn: str):
    """Create or update a Lambda function."""
    zip_bytes = package_lambda(function_dir)

    try:
        lambda_client.get_function(FunctionName=function_name)
        # Update existing
        lambda_client.update_function_code(
            FunctionName=function_name,
            ZipFile=zip_bytes,
        )
        print(f"Updated Lambda: {function_name}")
    except lambda_client.exceptions.ResourceNotFoundException:
        # Create new
        lambda_client.create_function(
            FunctionName=function_name,
            Runtime=RUNTIME,
            Role=role_arn,
            Handler="handler.lambda_handler",
            Code={"ZipFile": zip_bytes},
            Timeout=TIMEOUT,
            MemorySize=MEMORY_SIZE,
            Environment={
                "Variables": {
                    "AWS_REGION_NAME": REGION,
                }
            },
        )
        print(f"Created Lambda: {function_name}")

        # Wait for function to be active
        waiter = lambda_client.get_waiter("function_active_v2")
        waiter.wait(FunctionName=function_name)


def main():
    print("=" * 50)
    print("  ReBridge — Full Deployment")
    print("=" * 50)

    # Step 1: DynamoDB
    print("\n[1/3] Creating DynamoDB table...")
    from infrastructure.create_table import create_table
    create_table()

    # Step 2: Lambda functions
    print("\n[2/3] Deploying Lambda functions...")
    role_arn = create_lambda_role()

    lambdas = {
        "grade_and_route": os.path.join(LAMBDAS_DIR, "grade_and_route"),
        "get_health_card": os.path.join(LAMBDAS_DIR, "get_health_card"),
    }

    for name, path in lambdas.items():
        deploy_lambda(name, path, role_arn)

    # Step 3: API Gateway
    print("\n[3/3] Setting up API Gateway...")
    from api_gateway.setup_api import setup
    api_id = setup()

    print("\n" + "=" * 50)
    print("  Deployment complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
