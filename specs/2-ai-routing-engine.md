# Feature: AI Grading & Routing Engine
**Tech Stack:** AWS Lambda (Python 3.12), Amazon Bedrock (Claude Sonnet via boto3)
**Objective:** Evaluate a returned item and produce a grade + route decision in under 2 seconds.

**Requirements:**
- Lambda function grade_and_route accepts: item_id, category, condition_notes, simulated_image_label.
- Construct a Bedrock prompt that forces Claude to return ONLY this JSON: { "grade": "A|B|C|D", "condition_summary": "one sentence", "route_decision": "Resell|Refurbish|Donate|Recycle", "confidence_score": 0.0-1.0, "trust_breakdown": { "cosmetic": score, "functional": score, "packaging": score } }
- Routing thresholds: Grade A = Resell, Grade B = Refurbish, Grade C = Donate, Grade D = Recycle.
- On success, call db_client.put_item() to write the full record to DynamoDB.
- Return the JSON response directly to API Gateway.
