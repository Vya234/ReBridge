"""
Lambda: purchase_advisor
Endpoint: POST /purchase-advice
AI Purchase Advisor — evaluates purchase compatibility and return risk.
"""

import json
import re
import boto3

REGION = "ap-south-1"
MODEL_ID = "apac.amazon.nova-micro-v1:0"

bedrock = boto3.client("bedrock-runtime", region_name=REGION)


def build_prompt(category: str, description: str) -> str:
    return f"""You are an AI Purchase Advisor. Your job is to assess whether a purchase is likely to result in a return.

CRITICAL RULES:
- Pay extreme attention to conditional statements (e.g., "I might return it if...", "not sure if...")
- Do NOT let premium keywords (expensive, branded, high-end) override stated user concerns
- Be honest about potential issues — do not sugarcoat
- Consider the product category's typical return rate

Product Category: {category}
User's Description / Intended Use: {description}

Respond with ONLY valid JSON — no markdown, no explanation, no code blocks:
{{
  "compatibility_score": 0-100,
  "reasoning": ["reason 1", "reason 2", "reason 3"],
  "checklist": [
    {{"item": "Category return rate", "status": "pass|fail|warn"}},
    {{"item": "Usage clarity", "status": "pass|fail|warn"}},
    {{"item": "Condition expectations", "status": "pass|fail|warn"}},
    {{"item": "Price sensitivity", "status": "pass|fail|warn"}}
  ],
  "potential_risks": ["risk 1", "risk 2"],
  "recommendation": "One actionable sentence of advice"
}}

Scoring guide:
- 80-100: Great match, low return risk
- 50-79: Moderate risk, proceed with caution
- 0-49: High return risk, consider alternatives
"""


def lambda_handler(event, context):
    try:
        if isinstance(event.get("body"), str):
            body = json.loads(event["body"])
        else:
            body = event.get("body") or event

        category = body.get("category", "")
        description = body.get("description", "")

        if not category or not description:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing category or description"}),
            }

        prompt = build_prompt(category, description)

        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps({
                "messages": [{"role": "user", "content": [{"text": prompt}]}]
            }),
        )

        response_body = json.loads(response["body"].read())
        text = response_body["output"]["message"]["content"][0]["text"]

        # Clean up — remove markdown code blocks if present
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)

        result = json.loads(text)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(result),
        }

    except json.JSONDecodeError:
        # Fallback if AI returns malformed JSON
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "compatibility_score": 65,
                "reasoning": ["Unable to fully parse AI response", "Defaulting to moderate assessment"],
                "checklist": [{"item": "AI Analysis", "status": "warn"}],
                "potential_risks": ["Assessment may be incomplete"],
                "recommendation": "Consider checking product reviews and return policy before purchasing.",
            }),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
