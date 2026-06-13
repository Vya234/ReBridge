"""
Lambda: get_wallet
Endpoint: GET /wallet/{user_id}
Returns total green credits for a user.
"""

import json
import boto3
from decimal import Decimal

REGION = "ap-south-1"
TABLE_NAME = "GreenWallet"

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    """Main Lambda entry point."""
    try:
        path_params = event.get("pathParameters") or {}
        user_id = path_params.get("user_id", "")

        if not user_id:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing user_id in path"}),
            }

        response = table.get_item(Key={"user_id": user_id})
        item = response.get("Item")

        if item:
            total_credits = int(item.get("total_credits", 0))
        else:
            total_credits = 0

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "user_id": user_id,
                "total_credits": total_credits,
            }),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
