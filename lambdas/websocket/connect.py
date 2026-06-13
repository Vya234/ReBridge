"""
WebSocket $connect handler.
Saves connectionId, itemId, and sender to ChatConnections table.
"""

import json
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

REGION = "ap-south-1"
TABLE_NAME = "ChatConnections"

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    connection_id = event["requestContext"]["connectionId"]

    query = event.get("queryStringParameters") or {}
    item_id = query.get("itemId", "unknown")
    sender = query.get("sender", "anonymous")

    logger.info(f"CONNECT: connectionId={connection_id}, itemId={item_id}, sender={sender}")

    table.put_item(Item={
        "connectionId": connection_id,
        "itemId": item_id,
        "sender": sender,
    })

    return {"statusCode": 200, "body": "Connected"}
