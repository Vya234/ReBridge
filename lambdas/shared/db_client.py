"""
Shared DynamoDB helper for Lambda functions.
Provides put_item() and get_item() for the ProductHealthCards table.
"""

import boto3
from decimal import Decimal
import json

REGION = "ap-south-1"
TABLE_NAME = "ProductHealthCards"

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)


def _convert_floats(obj):
    """Convert floats to Decimal for DynamoDB compatibility."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: _convert_floats(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_convert_floats(i) for i in obj]
    return obj


def _convert_decimals(obj):
    """Convert Decimals back to floats for JSON serialization."""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: _convert_decimals(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_convert_decimals(i) for i in obj]
    return obj


def put_item(record: dict) -> dict:
    """Write a full health card record to DynamoDB."""
    safe_record = _convert_floats(record)
    table.put_item(Item=safe_record)
    return record


def get_item(item_id: str) -> dict | None:
    """Retrieve a health card by item_id. Returns None if not found."""
    response = table.get_item(Key={"item_id": item_id})
    item = response.get("Item")
    if item:
        return _convert_decimals(item)
    return None
