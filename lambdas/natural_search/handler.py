"""
Lambda: natural_search
Endpoint: POST /search
Accepts a natural language query, extracts filters via Nova, then queries DynamoDB.
"""

import json
import boto3
from decimal import Decimal

REGION = "ap-south-1"
MODEL_ID = "apac.amazon.nova-micro-v1:0"
TABLE_NAME = "ProductHealthCards"

bedrock = boto3.client("bedrock-runtime", region_name=REGION)
dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)


def extract_filters(query: str) -> dict:
    """Use Nova to extract search filters from natural language query."""
    prompt = f"""Extract search filters from this query: '{query}'.
Return ONLY valid JSON — no markdown, no explanation:
{{
  "category": "Electronics|Clothing|Books|Home" or null,
  "max_price": number or null,
  "min_confidence": number 0-1 or null,
  "min_functional": number 0-1 or null,
  "keywords": ["array of condition keywords"]
}}"""

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps({
            "messages": [{"role": "user", "content": [{"text": prompt}]}]
        }),
    )

    response_body = json.loads(response["body"].read())
    text = response_body["output"]["message"]["content"][0]["text"]
    return json.loads(text)


def convert_decimals(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    return obj


def lambda_handler(event, context):
    try:
        if isinstance(event.get("body"), str):
            body = json.loads(event["body"])
        else:
            body = event.get("body") or event

        query = body.get("query", "")
        if not query:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing query field"}),
            }

        # Extract filters from natural language
        filters = extract_filters(query)

        # Scan DynamoDB (hackathon scale — scan is fine)
        response = table.scan()
        items = response.get("Items", [])
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))

        # Apply filters
        results = []
        for item in items:
            # Only Resell or Refurbish
            route = item.get("assigned_route", "")
            if route not in ("Resell", "Refurbish"):
                continue

            # Category filter
            if filters.get("category") and item.get("category") != filters["category"]:
                continue

            # Max price filter
            if filters.get("max_price") is not None:
                suggested = float(item.get("suggested_price", 0) or 0)
                if suggested > 0 and suggested > filters["max_price"]:
                    continue

            # Min confidence filter
            if filters.get("min_confidence") is not None:
                confidence = float(item.get("confidence_score", 0) or 0)
                if confidence < filters["min_confidence"]:
                    continue

            # Min functional filter
            trust = item.get("trust_breakdown", {})
            if filters.get("min_functional") is not None:
                functional = float(trust.get("functional", 0) or 0)
                if functional < filters["min_functional"]:
                    continue

            results.append(convert_decimals(item))

        # Sort by confidence score descending
        results.sort(key=lambda x: x.get("confidence_score", 0), reverse=True)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "items": results,
                "count": len(results),
                "filters_applied": filters,
            }),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
