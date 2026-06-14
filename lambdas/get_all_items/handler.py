"""
Lambda: get_all_items
Endpoint: GET /items
Scans the entire ProductHealthCards table, returns all records sorted by timestamp (newest first).
"""

import json
import boto3
from decimal import Decimal

REGION = "ap-south-1"
TABLE_NAME = "ProductHealthCards"

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)


def convert_decimals(obj):
    """Convert Decimals to floats for JSON serialization."""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    return obj


def lambda_handler(event, context):
    """Main Lambda entry point."""
    try:
        # Scan entire table
        items = []
        response = table.scan()
        items.extend(response.get("Items", []))

        # Handle pagination
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))

        # Convert Decimals
        items = [convert_decimals(item) for item in items]

        # Sort by timestamp (newest first)
        items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"items": items, "count": len(items)}),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
