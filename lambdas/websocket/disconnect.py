"""
WebSocket $disconnect handler.
Removes connectionId from ChatConnections table.
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

    logger.info(f"DISCONNECT: connectionId={connection_id}")

    table.delete_item(Key={"connectionId": connection_id})

    return {"statusCode": 200, "body": "Disconnected"}
