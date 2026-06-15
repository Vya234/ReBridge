"""
Lambda: grade_and_route
Endpoint: POST /evaluate-return
Evaluates a returned item using Amazon Nova Lite via Bedrock converse() API.
Supports multimodal input (text + optional image).
"""

import json
import sys
import os
import random
import base64
from datetime import datetime, timezone

import boto3

# Add shared layer to path so db_client can be imported
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "shared"))
import db_client

REGION = "ap-south-1"
MODEL_ID = "apac.amazon.nova-lite-v1:0"
WALLET_TABLE = "GreenWallet"
IMAGE_BUCKET = "rebridge-product-images"
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
s3_client = boto3.client("s3", region_name=REGION)


def build_prompt(category: str, condition_notes: str, simulated_image_label: str, return_reason: str = "", warranty_left: str = "", repair_history: str = "", product_title: str = "") -> str:
    extra_context = ""
    if product_title:
        extra_context += f"\n- Product Title: {product_title}"
    if return_reason:
        extra_context += f"\n- Return Reason: {return_reason}"
    if warranty_left:
        extra_context += f"\n- Warranty Remaining: {warranty_left}"
    if repair_history:
        extra_context += f"\n- Repair History: {repair_history}"

    return f"""You are a Value Recovery Optimizer for a returned product lifecycle system.
Given the item details below (and the uploaded product photo if provided), assess the item's condition and determine the OPTIMAL route that maximizes value recovery and sustainability.

Item Details:
- Category: {category}
- Condition Notes: {condition_notes}
- Image Label: {simulated_image_label}{extra_context}

If a product photo is provided, use it to assess visible cosmetic damage, wear, scratches, cracks, stains, and overall appearance. The photo is the primary evidence for appearance scoring.

Respond with ONLY valid JSON — no markdown, no explanation:
{{
  "grade": "A|B|C|D",
  "condition_summary": "one sentence summary",
  "route_decision": "Resell|Refurbish|Donate|Recycle",
  "recovery_score": 0-100,
  "confidence_score": 0.0-1.0,
  "trust_breakdown": {{
    "appearance": 0.0-1.0,
    "functional": 0.0-1.0,
    "packaging": 0.0-1.0
  }}
}}

Value Recovery Optimization Rules:
- recovery_score represents the percentage of original value that can be retained through the chosen route
- Choose route based on MAXIMUM value recovery potential:
  - Resell: Item retains >70% value. Like new or minor cosmetic wear, fully functional.
  - Refurbish: Item retains 40-70% value. Needs minor repair/cleaning but core functionality is intact.
  - Donate: Item retains <40% value but is still usable. Visible damage, functional issues.
  - Recycle: Item is non-functional, safety hazard, or destroyed. Material recovery only.

Grading criteria:
- Grade A: Like new, no visible damage, all accessories present. recovery_score 80-100.
- Grade B: Minor cosmetic wear, fully functional. Missing accessories acceptable. recovery_score 60-79.
- Grade C: Visible damage, may have functional issues. recovery_score 30-59.
- Grade D: Severe damage, non-functional, or safety concerns. recovery_score 0-29.

Important rules:
- Missing accessories alone should NOT drop below Grade B.
- Packaging score should NOT affect the grade — only appearance and functional scores matter.
- If warranty_remaining is '6-12 months' or 'More than 1 year', upgrade recovery_score by 10 points (max 100) unless destroyed.
- If a photo is provided, weight appearance score heavily based on what you see.
- Factor in market demand for the category when determining recovery_score.
"""


def invoke_nova(prompt: str, image_bytes: bytes = None) -> dict:
    """Call Amazon Nova Lite via Bedrock converse() API. Supports text + optional image."""
    import logging
    import re
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Build content blocks
    content = []

    # Always include text prompt
    content.append({"text": prompt})

    # Optionally include image (image_bytes here is already decoded bytes)
    if image_bytes:
        content.append({
            "image": {
                "format": "jpeg",
                "source": {
                    "bytes": image_bytes,
                }
            }
        })

    logger.info(f"Calling converse() with {len(content)} content blocks, image={'yes' if image_bytes else 'no'}")

    response = bedrock.converse(
        modelId=MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": content,
            }
        ],
    )

    # Parse response from converse() format
    logger.info(f"converse() response keys: {list(response.keys())}")
    logger.info(f"output keys: {list(response.get('output', {}).keys())}")

    assistant_text = response["output"]["message"]["content"][0]["text"]
    logger.info(f"Raw assistant text: {assistant_text[:500]}")

    # Clean up — remove markdown code blocks if present
    cleaned = assistant_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    logger.info(f"Cleaned text for JSON parse: {cleaned[:500]}")

    # Parse the JSON from Nova's response
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed: {e}. Raw text was: {assistant_text}")
        raise


def lambda_handler(event, context):
    """Main Lambda entry point."""
    try:
        # Parse request body
        if isinstance(event.get("body"), str):
            body = json.loads(event["body"])
        else:
            body = event.get("body") or event

        item_id = body.get("item_id", "")
        if not item_id or item_id.strip() == "":
            year = datetime.now(timezone.utc).year
            digits = str(random.randint(0, 999999)).zfill(6)
            item_id = f"RB-{year}-{digits}"

        category = body["category"]
        condition_notes = body["condition_notes"]
        simulated_image_label = body["simulated_image_label"]
        user_id = body.get("user_id", DEFAULT_USER)
        original_price = body.get("original_price", 0)
        return_reason = body.get("return_reason", "")
        warranty_left = body.get("warranty_left", "")
        repair_history = body.get("repair_history", "")
        city = body.get("city", "")
        locality = body.get("locality", "")
        product_title = body.get("product_title", "")

        # Handle optional image upload (base64 string)
        image_bytes = None
        image_b64 = body.get("image_bytes")
        if image_b64 and isinstance(image_b64, str) and len(image_b64) > 100:
            try:
                image_bytes = base64.b64decode(image_b64)
            except Exception:
                image_bytes = None

        # Call Nova for grading (with optional image)
        prompt = build_prompt(category, condition_notes, simulated_image_label, return_reason, warranty_left, repair_history, product_title)
        ai_result = invoke_nova(prompt, image_bytes)

        # Upload image to S3 if present
        image_url = None
        if image_bytes:
            try:
                s3_key = f"{item_id}.jpg"
                s3_client.put_object(
                    Bucket=IMAGE_BUCKET,
                    Key=s3_key,
                    Body=image_bytes,
                    ContentType="image/jpeg",
                )
                image_url = f"https://{IMAGE_BUCKET}.s3.{REGION}.amazonaws.com/{s3_key}"
            except Exception:
                pass  # Non-critical — continue without image URL

        # Calculate green credits
        route = ai_result["route_decision"]
        credits_earned = GREEN_CREDITS.get(route, 0)

        # Calculate sustainability metrics
        SUSTAINABILITY = {
            "Resell": {"carbon_saved_kg": 5.2, "water_saved_liters": 120},
            "Refurbish": {"carbon_saved_kg": 3.8, "water_saved_liters": 80},
            "Donate": {"carbon_saved_kg": 1.5, "water_saved_liters": 10},
            "Recycle": {"carbon_saved_kg": 1.5, "water_saved_liters": 10},
        }
        sustainability = SUSTAINABILITY.get(route, {"carbon_saved_kg": 0, "water_saved_liters": 0})
        carbon_saved_kg = sustainability["carbon_saved_kg"]
        water_saved_liters = sustainability["water_saved_liters"]

        # Get recovery score from AI response
        recovery_score = ai_result.get("recovery_score", 0)

        # Calculate suggested resell price based on grade
        grade = ai_result["grade"]
        price_multiplier = {"A": 0.80, "B": 0.60, "C": 0.30, "D": 0.0}
        suggested_price = int(original_price * price_multiplier.get(grade, 0))

        # Build full record
        record = {
            "item_id": item_id,
            "user_id": user_id,
            "product_title": product_title,
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
            "city": city,
            "locality": locality,
            "has_image": image_bytes is not None,
            "image_url": image_url,
            "recovery_score": recovery_score,
            "carbon_saved_kg": carbon_saved_kg,
            "water_saved_liters": water_saved_liters,
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
            pass  # Non-critical

        # Price intelligence — find similar items
        price_intelligence = None
        try:
            from boto3.dynamodb.conditions import Attr
            health_table = dynamodb.Table("ProductHealthCards")
            scan_resp = health_table.scan(
                FilterExpression=Attr("category").eq(category) & Attr("grade").eq(grade) & Attr("suggested_price").gt(0),
                Limit=50,
            )
            similar = [i for i in scan_resp.get("Items", []) if str(i.get("item_id")) != str(item_id)][:10]
            if similar:
                prices = [int(i["suggested_price"]) for i in similar if i.get("suggested_price")]
                if prices:
                    price_intelligence = {
                        "similar_count": len(prices),
                        "price_min": min(prices),
                        "price_max": max(prices),
                        "message": f"Similar Grade {grade} {category} sold between ₹{min(prices):,}–₹{max(prices):,}",
                    }
        except Exception:
            pass  # Non-critical

        record["price_intelligence"] = price_intelligence

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
