# ReBridge — AI-Powered Returns Routing System

An AWS-native backend that uses AI (Amazon Bedrock / Claude Sonnet) to grade returned items and route them to the optimal destination: Resell, Refurbish, Donate, or Recycle.

## Architecture

```
React Frontend
      │
      ▼
API Gateway (HTTP API)
      │
      ├── POST /evaluate-return → grade_and_route Lambda → Bedrock (Claude) → DynamoDB
      │
      └── GET /health-card/{item_id} → get_health_card Lambda → DynamoDB
```

## Prerequisites

- Python 3.12+
- AWS CLI configured with `default` profile
- Region: `ap-south-1` (Mumbai)
- Amazon Bedrock access enabled for Claude Sonnet in ap-south-1

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Deploy everything (DynamoDB + Lambdas + API Gateway)
python deploy.py
```

## Project Structure

```
ReBridge/
├── infrastructure/
│   └── create_table.py          # DynamoDB table setup
├── lambdas/
│   ├── shared/
│   │   └── db_client.py         # Shared DynamoDB helper
│   ├── grade_and_route/
│   │   └── handler.py           # AI grading Lambda
│   └── get_health_card/
│       └── handler.py           # Health card retrieval Lambda
├── api_gateway/
│   └── setup_api.py             # HTTP API configuration
├── deploy.py                    # One-click deployment
├── requirements.txt
└── README.md
```

## API Endpoints

### POST /evaluate-return

Request body:
```json
{
  "item_id": "ITEM-001",
  "category": "Electronics",
  "condition_notes": "Minor scratches on back panel, fully functional",
  "simulated_image_label": "good_condition_phone"
}
```

Response:
```json
{
  "item_id": "ITEM-001",
  "category": "Electronics",
  "condition_score": 0.85,
  "grade": "A",
  "condition_summary": "Device is fully functional with minor cosmetic wear",
  "assigned_route": "Resell",
  "confidence_score": 0.85,
  "trust_breakdown": {
    "cosmetic": 0.75,
    "functional": 0.95,
    "packaging": 0.80
  },
  "timestamp": "2024-01-15T10:30:00+00:00"
}
```

### GET /health-card/{item_id}

Returns the stored Product Health Card for the given item.

## Deployment Details

The `deploy.py` script handles:
1. Creates `ProductHealthCards` DynamoDB table (on-demand billing)
2. Creates IAM role with DynamoDB + Bedrock + CloudWatch permissions
3. Packages and deploys both Lambda functions
4. Creates HTTP API Gateway with CORS and auto-deploy stage
5. Prints the live API endpoint URL
