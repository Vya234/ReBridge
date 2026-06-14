"""
Lambda: natural_search
Endpoint: POST /search
Accepts a natural language query, extracts filters via Nova, then queries DynamoDB.
"""

import json
import re
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
    prompt = f"""Extract search filters from this user query: '{query}'.

Return ONLY valid JSON — no markdown, no explanation, no code blocks:
{{
  "category": "Electronics" or "Clothing" or "Books" or "Home" or null,
  "max_price": integer or null,
  "min_confidence": float 0.0-1.0 or null,
  "min_functional": float 0.0-1.0 or null,
  "min_appearance": float 0.0-1.0 or null,
  "grade": "A" or "B" or "C" or "D" or null,
  "route": "Resell" or "Refurbish" or "Donate" or "Recycle" or null,
  "keywords": ["array", "of", "keywords", "to", "match", "in", "condition"]
}}

Rules:
- If user says "good condition" or "fully functional", put those as keywords
- If user mentions a grade (A, B, C, D), set grade field
- If user mentions "resell" or "refurbished"/"refurbish", set route to Resell or Refurbish
- If user mentions a price with currency symbol or "under X", set max_price
- If user mentions "high functionality" or "functional", set min_functional to 0.8
- If user mentions "good appearance", set min_appearance to 0.7
- Extract product type words as keywords (laptop, phone, jacket, etc.)
- category should match exactly: Electronics, Clothing, Books, or Home
"""

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps({
            "messages": [{"role": "user", "content": [{"text": prompt}]}]
        }),
    )

    response_body = json.loads(response["body"].read())
    text = response_body["output"]["message"]["content"][0]["text"]

    # Clean up response — remove markdown code blocks if present
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

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
        if not query or not query.strip():
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing query field"}),
            }

        # Clean query — trim, collapse multiple spaces
        query = " ".join(query.strip().split())

        # Extract filters from natural language
        try:
            filters = extract_filters(query)
        except Exception:
            # If Nova fails to parse, return empty with error hint
            filters = {"category": None, "keywords": query.lower().split()}

        # Scan DynamoDB
        response = table.scan()
        items = response.get("Items", [])
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))

        # Apply filters
        results = []
        for item in items:
            # Route filter — default to Resell/Refurbish if no specific route requested
            item_route = item.get("assigned_route", "")
            if filters.get("route"):
                if item_route != filters["route"]:
                    continue
            else:
                if item_route not in ("Resell", "Refurbish"):
                    continue

            # Category filter
            if filters.get("category"):
                if item.get("category", "").lower() != filters["category"].lower():
                    continue

            # Grade filter
            if filters.get("grade"):
                if item.get("grade", "") != filters["grade"].upper():
                    continue

            # Max price filter
            if filters.get("max_price") is not None:
                suggested = float(item.get("suggested_price", 0) or 0)
                if suggested > 0 and suggested > float(filters["max_price"]):
                    continue

            # Min confidence filter
            if filters.get("min_confidence") is not None:
                confidence = float(item.get("confidence_score", 0) or 0)
                if confidence < float(filters["min_confidence"]):
                    continue

            # Trust breakdown filters
            trust = item.get("trust_breakdown", {})

            if filters.get("min_functional") is not None:
                functional = float(trust.get("functional", 0) or 0)
                if functional < float(filters["min_functional"]):
                    continue

            if filters.get("min_appearance") is not None:
                appearance = float(trust.get("appearance", 0) or trust.get("cosmetic", 0) or 0)
                if appearance < float(filters["min_appearance"]):
                    continue

            # Keyword matching against condition_summary
            keywords = filters.get("keywords", [])
            if keywords:
                summary = (item.get("condition_summary", "") or "").lower()
                category_lower = (item.get("category", "") or "").lower()
                item_id_lower = (item.get("item_id", "") or "").lower()
                search_text = f"{summary} {category_lower} {item_id_lower}"

                # At least one keyword must match
                keyword_match = any(kw.lower() in search_text for kw in keywords if kw)
                if not keyword_match:
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
