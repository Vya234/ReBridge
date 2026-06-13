# Feature: Trust Layer Database
**Tech Stack:** Amazon DynamoDB, Python (boto3)
**Objective:** Store Product Health Cards for every returned item with zero infrastructure setup time.

**Requirements:**
- Use Amazon DynamoDB (on-demand mode) — no VPC, no subnet config, deploys in seconds.
- Create a ProductHealthCards table with partition key item_id (String).
- Each item record contains: item_id, category, condition_score, grade, assigned_route (Resell / Refurbish / Donate / Recycle), trust_breakdown (JSON), timestamp.
- Provide a db_client.py helper with put_item() and get_item() functions to be imported by Lambda functions.
