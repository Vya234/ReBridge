"""
Lambda: get_items_by_category
Endpoint: GET /items/{category}
Scans DynamoDB for items matching a category, returns only Resell/Refurbish routes.
"""

import json
import sys
import os

import boto3

# Add shared layer to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "shared"))
import db_client

REGION = "ap-south-1"
TABLE_NAME = "ProductHealthCards"

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    """Main Lambda entry point."""
    try:
        path_params = event.get("pathParameters") or {}
        category = path_params.get("category", "")

        if not category:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing category in path"}),
            }

        # Scan for items matching the category
        # (For a hackathon-scale table, scan is fine)
        response = table.scan(
            FilterExpression="category = :cat AND (assigned_route = :r1 OR assigned_route = :r2)",
            ExpressionAttributeValues={
                ":cat": category,
                ":r1": "Resell",
                ":r2": "Refurbish",
            },
        )

        items = response.get("Items", [])

        # Convert Decimals for JSON serialization
        from decimal import Decimal

        def convert(obj):
            if isinstance(obj, Decimal):
                return float(obj)
            if isinstance(obj, dict):
                return {k: convert(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [convert(i) for i in obj]
            return obj

        clean_items = [convert(item) for item in items]

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"items": clean_items, "count": len(clean_items)}),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
