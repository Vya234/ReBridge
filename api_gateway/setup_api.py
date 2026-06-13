"""
Creates an HTTP API Gateway with two routes wired to Lambda functions.
- POST /evaluate-return → grade_and_route Lambda
- GET /health-card/{item_id} → get_health_card Lambda
CORS enabled for all origins.
"""

import boto3
import json

REGION = "ap-south-1"
API_NAME = "ReBridge-API"

apigw = boto3.client("apigatewayv2", region_name=REGION)
lambda_client = boto3.client("lambda", region_name=REGION)
sts = boto3.client("sts", region_name=REGION)


def get_account_id():
    return sts.get_caller_identity()["Account"]


def get_lambda_arn(function_name: str) -> str:
    response = lambda_client.get_function(FunctionName=function_name)
    return response["Configuration"]["FunctionArn"]


def create_http_api():
    """Create the HTTP API with CORS enabled."""
    response = apigw.create_api(
        Name=API_NAME,
        ProtocolType="HTTP",
        CorsConfiguration={
            "AllowOrigins": ["*"],
            "AllowMethods": ["GET", "POST", "OPTIONS"],
            "AllowHeaders": ["Content-Type", "Authorization"],
            "MaxAge": 86400,
        },
    )
    api_id = response["ApiId"]
    print(f"Created HTTP API: {api_id}")
    return api_id


def create_integration(api_id: str, lambda_arn: str) -> str:
    """Create a Lambda proxy integration."""
    response = apigw.create_integration(
        ApiId=api_id,
        IntegrationType="AWS_PROXY",
        IntegrationUri=lambda_arn,
        PayloadFormatVersion="2.0",
    )
    return response["IntegrationId"]


def create_route(api_id: str, route_key: str, integration_id: str):
    """Create a route pointing to an integration."""
    apigw.create_route(
        ApiId=api_id,
        RouteKey=route_key,
        Target=f"integrations/{integration_id}",
    )
    print(f"Created route: {route_key}")


def add_lambda_permission(function_name: str, api_id: str):
    """Allow API Gateway to invoke the Lambda function."""
    account_id = get_account_id()
    source_arn = f"arn:aws:execute-api:{REGION}:{account_id}:{api_id}/*/*"

    try:
        lambda_client.add_permission(
            FunctionName=function_name,
            StatementId=f"apigateway-invoke-{function_name}",
            Action="lambda:InvokeFunction",
            Principal="apigateway.amazonaws.com",
            SourceArn=source_arn,
        )
        print(f"Added invoke permission for {function_name}")
    except lambda_client.exceptions.ResourceConflictException:
        print(f"Permission already exists for {function_name}")


def create_stage(api_id: str):
    """Create a $default stage with auto-deploy."""
    apigw.create_stage(
        ApiId=api_id,
        StageName="$default",
        AutoDeploy=True,
    )
    print("Created $default stage with auto-deploy")


def setup():
    """Full API Gateway setup."""
    print("Setting up ReBridge API Gateway...")

    # Create the HTTP API
    api_id = create_http_api()

    # Get Lambda ARNs
    grade_arn = get_lambda_arn("grade_and_route")
    health_card_arn = get_lambda_arn("get_health_card")

    # Create integrations
    grade_integration = create_integration(api_id, grade_arn)
    health_card_integration = create_integration(api_id, health_card_arn)

    # Create routes
    create_route(api_id, "POST /evaluate-return", grade_integration)
    create_route(api_id, "GET /health-card/{item_id}", health_card_integration)

    # Add permissions
    add_lambda_permission("grade_and_route", api_id)
    add_lambda_permission("get_health_card", api_id)

    # Create default stage
    create_stage(api_id)

    # Print the invoke URL
    endpoint = f"https://{api_id}.execute-api.{REGION}.amazonaws.com"
    print(f"\nAPI live at: {endpoint}")
    print(f"  POST {endpoint}/evaluate-return")
    print(f"  GET  {endpoint}/health-card/{{item_id}}")

    return api_id


if __name__ == "__main__":
    setup()
