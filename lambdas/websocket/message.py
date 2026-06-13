"""
WebSocket sendMessage handler.
Queries GSI to find all connections for the item, broadcasts to all EXCEPT sender.
"""

import json
import logging
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

REGION = "ap-south-1"
TABLE_NAME = "ChatConnections"
GSI_NAME = "itemId-index"
WS_ENDPOINT = "https://kvhtc0th50.execute-api.ap-south-1.amazonaws.com/production"

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)

apigw = boto3.client(
    "apigatewaymanagementapi",
    endpoint_url=WS_ENDPOINT,
    region_name=REGION,
)


def lambda_handler(event, context):
    sender_connection_id = event["requestContext"]["connectionId"]

    # Parse message body
    body = json.loads(event.get("body", "{}"))
    item_id = body.get("itemId", "unknown")
    message_text = body.get("message", "")
    sender = body.get("sender", "anonymous")

    logger.info(f"MESSAGE: from={sender} ({sender_connection_id}), itemId={item_id}, text={message_text}")

    # Query GSI for all connections with this itemId
    response = table.query(
        IndexName=GSI_NAME,
        KeyConditionExpression=Key("itemId").eq(item_id),
    )
    connections = response.get("Items", [])

    logger.info(f"Found {len(connections)} connections for itemId={item_id}: {[c['connectionId'] for c in connections]}")

    # Build payload
    payload = json.dumps({
        "itemId": item_id,
        "message": message_text,
        "sender": sender,
    }).encode("utf-8")

    # Broadcast to all connections EXCEPT the sender
    stale_connections = []
    for conn in connections:
        target_id = conn["connectionId"]

        # Skip the sender — they already show the message optimistically
        if target_id == sender_connection_id:
            logger.info(f"  Skipping sender: {target_id}")
            continue

        logger.info(f"  Posting to: {target_id}")
        try:
            apigw.post_to_connection(
                ConnectionId=target_id,
                Data=payload,
            )
            logger.info(f"  -> Success")
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "GoneException":
                logger.info(f"  -> Gone (stale): {target_id}")
                stale_connections.append(target_id)
            else:
                logger.error(f"  -> Error: {error_code} - {e.response['Error']['Message']}")
        except Exception as e:
            logger.error(f"  -> Unexpected error: {str(e)}")

    # Clean up stale connections
    for stale_id in stale_connections:
        try:
            table.delete_item(Key={"connectionId": stale_id})
            logger.info(f"Deleted stale: {stale_id}")
        except Exception as e:
            logger.error(f"Failed to delete {stale_id}: {str(e)}")

    return {"statusCode": 200, "body": "Sent"}
