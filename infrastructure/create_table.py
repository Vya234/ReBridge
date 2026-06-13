"""
Creates the ProductHealthCards DynamoDB table in ap-south-1.
Idempotent — skips creation if the table already exists.
"""

import boto3
from botocore.exceptions import ClientError

REGION = "ap-south-1"
TABLE_NAME = "ProductHealthCards"


def create_table():
    dynamodb = boto3.client("dynamodb", region_name=REGION)

    try:
        dynamodb.create_table(
            TableName=TABLE_NAME,
            KeySchema=[
                {"AttributeName": "item_id", "KeyType": "HASH"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "item_id", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        print(f"Creating table '{TABLE_NAME}'...")

        waiter = dynamodb.get_waiter("table_exists")
        waiter.wait(TableName=TABLE_NAME)
        print(f"Table '{TABLE_NAME}' is now ACTIVE.")

    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print(f"Table '{TABLE_NAME}' already exists. Skipping.")
        else:
            raise


if __name__ == "__main__":
    create_table()
