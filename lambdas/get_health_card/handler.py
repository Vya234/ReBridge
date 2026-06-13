"""
Lambda: get_health_card
Endpoint: GET /health-card/{item_id}
Retrieves a stored Product Health Card from DynamoDB.
"""

import json
import sys
import os

# Add shared layer to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "shared"))
import db_client


def lambda_handler(event, context):
    """Main Lambda entry point."""
    try:
        # Extract item_id from path parameters
        path_params = event.get("pathParameters") or {}
        item_id = path_params.get("item_id")

        if not item_id:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing item_id in path"}),
            }

        # Fetch from DynamoDB
        record = db_client.get_item(item_id)

        if record is None:
            return {
                "statusCode": 404,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": f"No health card found for item_id: {item_id}"}),
            }

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(record),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
