"""
Lambda: grade_and_route
Endpoint: POST /evaluate-return
Evaluates a returned item using Amazon Nova Micro via Bedrock and writes
the result to DynamoDB.
"""

import json
import sys
import os
from datetime import datetime, timezone

import boto3

# Add shared layer to path so db_client can be imported
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "shared"))
import db_client

REGION = "ap-south-1"
MODEL_ID = "apac.amazon.nova-micro-v1:0"
WALLET_TABLE = "GreenWallet"
DEFAULT_USER = "default_user"

GREEN_CREDITS = {
    "Donate": 50,
    "Refurbish": 30,
    "Resell": 20,
    "Recycle": 10,
}

bedrock = boto3.client("bedrock-runtime", region_name=REGION)
dynamodb = boto3.resource("dynamodb", region_name=REGION)
wallet_table = dynamodb.Table(WALLET_TABLE)


def build_prompt(category: str, condition_notes: str, simulated_image_label: str, return_reason: str = "", warranty_left: str = "", repair_history: str = "") -> str:
    extra_context = ""
    if return_reason:
        extra_context += f"\n- Return Reason: {return_reason}"
    if warranty_left:
        extra_context += f"\n- Warranty Remaining: {warranty_left}"
    if repair_history:
        extra_context += f"\n- Repair History: {repair_history}"

    return f"""You are a product grading AI for a returns routing system.
Given the item details below, evaluate the item and respond with ONLY valid JSON — no markdown, no explanation.

Item Details:
- Category: {category}
- Condition Notes: {condition_notes}
- Simulated Image Label: {simulated_image_label}{extra_context}

Respond with exactly this JSON structure:
{{
  "grade": "A|B|C|D",
  "condition_summary": "one sentence summary",
  "route_decision": "Resell|Refurbish|Donate|Recycle",
  "confidence_score": 0.0-1.0,
  "trust_breakdown": {{
    "cosmetic": 0.0-1.0,
    "functional": 0.0-1.0,
    "packaging": 0.0-1.0
  }}
}}

Routing rules:
- Grade A → Resell
- Grade B → Refurbish
- Grade C → Donate
- Grade D → Recycle

Grading criteria:
- Grade A: Like new, no visible damage, all accessories present.
- Grade B: Minor cosmetic wear only (scratches, scuffs), fully functional. Missing accessories alone is acceptable for Grade B.
- Grade C: Visible damage, may have functional issues, significantly incomplete.
- Grade D: Severe damage, non-functional, or safety concerns.

Important rules:
- Missing accessories alone should NOT drop an item below Grade B.
- Packaging score should NOT affect the grade — only cosmetic and functional scores determine the grade and routing.
- If warranty_remaining is '6-12 months' or 'More than 1 year', upgrade the grade by one level (e.g. D→C, C→B) unless the item is completely destroyed or a safety hazard.
"""


def invoke_nova(prompt: str) -> dict:
    """Call Amazon Nova Micro via Bedrock and return parsed JSON."""
    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps({
            "messages": [
                {
                    "role": "user",
                    "content": [{"text": prompt}]
                }
            ]
        }),
    )

    response_body = json.loads(response["body"].read())
    assistant_text = response_body["output"]["message"]["content"][0]["text"]

    # Parse the JSON from Nova's response
    return json.loads(assistant_text)


def lambda_handler(event, context):
    """Main Lambda entry point."""
    try:
        # Parse request body
        if isinstance(event.get("body"), str):
            body = json.loads(event["body"])
        else:
            body = event.get("body") or event

        item_id = body["item_id"]
        category = body["category"]
        condition_notes = body["condition_notes"]
        simulated_image_label = body["simulated_image_label"]
        user_id = body.get("user_id", DEFAULT_USER)
        original_price = body.get("original_price", 0)
        return_reason = body.get("return_reason", "")
        warranty_left = body.get("warranty_left", "")
        repair_history = body.get("repair_history", "")

        # Call Nova for grading
        prompt = build_prompt(category, condition_notes, simulated_image_label, return_reason, warranty_left, repair_history)
        ai_result = invoke_nova(prompt)

        # Calculate green credits
        route = ai_result["route_decision"]
        credits_earned = GREEN_CREDITS.get(route, 0)

        # Calculate suggested resell price based on grade
        grade = ai_result["grade"]
        price_multiplier = {"A": 0.80, "B": 0.60, "C": 0.30, "D": 0.0}
        suggested_price = int(original_price * price_multiplier.get(grade, 0))

        # Build full record
        record = {
            "item_id": item_id,
            "category": category,
            "condition_score": ai_result.get("confidence_score", 0.0),
            "grade": grade,
            "condition_summary": ai_result["condition_summary"],
            "assigned_route": route,
            "confidence_score": ai_result["confidence_score"],
            "trust_breakdown": ai_result["trust_breakdown"],
            "green_credits": credits_earned,
            "original_price": original_price,
            "suggested_price": suggested_price,
            "return_reason": return_reason,
            "warranty_left": warranty_left,
            "repair_history": repair_history,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        # Write to DynamoDB
        db_client.put_item(record)

        # Update Green Wallet
        try:
            wallet_table.update_item(
                Key={"user_id": user_id},
                UpdateExpression="SET total_credits = if_not_exists(total_credits, :zero) + :credits",
                ExpressionAttributeValues={
                    ":credits": credits_earned,
                    ":zero": 0,
                },
            )
        except Exception:
            pass  # Non-critical — don't fail the request if wallet update fails

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(record),
        }

    except KeyError as e:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": f"Missing required field: {str(e)}"}),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
