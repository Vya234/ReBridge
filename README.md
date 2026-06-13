# ReBridge — AI-Powered Returns Routing & Sustainable Resale Platform

![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20DynamoDB%20%7C%20Bedrock-FF9900?logo=amazonaws)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)
![Hackathon](https://img.shields.io/badge/Amazon%20HackOn-Season%206-E8612A)

> **Every Return Finds a New Life**

🔗 **Live Demo:** [rebridge-app-2026.s3-website.ap-south-1.amazonaws.com](https://d12xi8surv8so8.cloudfront.net)  
📂 **GitHub:** [github.com/Vya234/ReBridge](https://github.com/Vya234/ReBridge)

---

## Problem Statement

The e-commerce returns ecosystem is broken:

- **$28B+ annual return processing cost** for Amazon alone
- **17–30% of all e-commerce orders** are returned
- Customers distrust refurbished products due to lack of transparency
- Millions of usable products end up in landfills despite being functional
- No intelligent system connects return grading → resale → prevention in one loop

The industry needs a way to grade returns with trust, route them optimally, and close the loop by surfacing certified refurbished alternatives to prevent unnecessary new purchases.

---

## Solution

**ReBridge** creates an intelligent product lifecycle loop powered by AI:

1. **Grade** — AI evaluates returned items on cosmetic, functional, and packaging quality
2. **Route** — Automatically assigns the optimal path: Resell, Refurbish, Donate, or Recycle
3. **Trust** — Generates transparent Product Health Cards with breakdown scores
4. **Resurface** — Certified items appear in a refurbished marketplace with trust scores visible
5. **Prevent** — Pre-purchase risk assessment nudges customers toward refurbished alternatives

This transforms the returns problem from a cost center into a sustainable commerce engine.

---

## Features

### 1. AI Grading & Routing Engine

- Powered by **Amazon Nova Micro** via Amazon Bedrock
- Evaluates items across cosmetic, functional, and packaging dimensions
- Assigns grades: **A** (Excellent), **B** (Good), **C** (Fair), **D** (Poor)
- Routes automatically: A → Resell, B → Refurbish, C → Donate, D → Recycle
- Sub-2-second evaluation latency
- Full JSON response with confidence scores and trust breakdown

### 2. Product Health Card

- Visual certificate for every evaluated item
- **Trust Breakdown**: Three independent scores (Cosmetic, Functional, Packaging)
- **Confidence Score**: AI's self-assessed certainty (0–100%)
- **Condition Summary**: One-sentence human-readable assessment
- **Route Journey Tracker**: Visual pipeline showing where the item lands
- **Grade Stamp**: Animated quality seal with color coding

### 3. Shop Certified Refurbished

- Browse AI-graded inventory by category (Electronics, Clothing, Books, Home)
- Only surfaces items routed to Resell or Refurbish
- Each product card shows grade badge, trust breakdown mini-bars, and condition summary
- **"Save 35% vs new"** discount badge on every listing
- Add to Cart UI for marketplace integration readiness

### 4. Return History Dashboard

- Full audit trail of all previously evaluated items
- Sortable table: Item ID, Category, Grade, Route, Confidence, Timestamp
- Color-coded grade badges and route pills
- **Expandable rows** — click to reveal full trust breakdown and condition summary
- Real-time data from DynamoDB

### 5. Return Prevention

- Pre-purchase risk assessment on the homepage
- Customer enters product category and usage description
- AI evaluates and returns a risk grade
- **Grade C/D**: Red warning — "High Return Risk" with link to Shop Refurbished
- **Grade A/B**: Green confirmation — "Low Return Risk — Great buy!"
- Nudges smarter purchasing decisions before checkout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.3, Vite 6, Tailwind CSS 3.4 |
| **Hosting** | AWS S3 (static website hosting) |
| **Backend** | AWS Lambda (Python 3.12) |
| **API** | Amazon API Gateway (HTTP API) |
| **AI/ML** | Amazon Bedrock — Amazon Nova Micro (`apac.amazon.nova-micro-v1:0`) |
| **Database** | Amazon DynamoDB (on-demand / PAY_PER_REQUEST) |
| **Infrastructure** | IAM roles, CORS configured, ap-south-1 (Mumbai) region |
| **Dev Tooling** | Kiro IDE (spec-driven development), AWS CLI |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (S3)                       │
│   Home • Evaluate • Health Card • Shop • History             │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Amazon API Gateway (HTTP API)                    │
│         CORS: * │ Auto-deploy │ ap-south-1                   │
└────┬──────────────────┬──────────────────┬──────────────────┘
     │                  │                  │
     ▼                  ▼                  ▼
┌──────────┐    ┌──────────────┐    ┌─────────────────┐
│ grade_   │    │ get_health_  │    │ get_items_by_   │
│ and_route│    │ card         │    │ category        │
└────┬─────┘    └──────┬───────┘    └────────┬────────┘
     │                 │                     │
     ▼                 │                     │
┌──────────┐           │                     │
│ Amazon   │           │                     │
│ Bedrock  │           │                     │
│ (Nova)   │           │                     │
└────┬─────┘           │                     │
     │                 ▼                     ▼
     │          ┌─────────────────────────────────┐
     └────────► │    Amazon DynamoDB              │
                │    ProductHealthCards Table      │
                │    PK: item_id (String)          │
                └─────────────────────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/evaluate-return` | Submit item for AI grading and routing |
| `GET` | `/health-card/{item_id}` | Retrieve stored Product Health Card |
| `GET` | `/items/{category}` | Browse items by category (Resell/Refurbish only) |

### POST /evaluate-return

**Request:**
```json
{
  "item_id": "ITEM-001",
  "category": "Electronics",
  "condition_notes": "Minor scratches on back, fully functional",
  "simulated_image_label": "scratched_phone_back"
}
```

**Response:**
```json
{
  "item_id": "ITEM-001",
  "category": "Electronics",
  "grade": "B",
  "condition_summary": "Device functional with minor cosmetic wear",
  "assigned_route": "Refurbish",
  "confidence_score": 0.82,
  "condition_score": 0.82,
  "trust_breakdown": {
    "cosmetic": 0.65,
    "functional": 0.95,
    "packaging": 0.78
  },
  "timestamp": "2026-06-13T10:30:00+00:00"
}
```

### GET /health-card/{item_id}

Returns the stored health card record for a given item.

### GET /items/{category}

Returns all items in a category with route = Resell or Refurbish.

---

## Project Structure

```
ReBridge/
├── specs/
│   ├── 1-trust-database.md              # DynamoDB architecture spec
│   ├── 2-ai-routing-engine.md           # AI grading engine spec
│   └── 3-api-gateway.md                 # API design spec
├── infrastructure/
│   ├── create_table.py                  # DynamoDB table creation
│   └── deploy_items_endpoint.py         # Category endpoint deployment
├── lambdas/
│   ├── shared/
│   │   └── db_client.py                 # Shared DynamoDB helper (put/get)
│   ├── grade_and_route/
│   │   └── handler.py                   # AI grading Lambda (Nova Micro)
│   ├── get_health_card/
│   │   └── handler.py                   # Health card retrieval Lambda
│   └── get_items_by_category/
│       └── handler.py                   # Category browse Lambda
├── api_gateway/
│   └── setup_api.py                     # HTTP API + routes + CORS config
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.jsx             # Hero + Return Prevention
│   │   │   ├── EvaluatePage.jsx         # Product Passport form
│   │   │   ├── ResultPage.jsx           # Health Card certificate
│   │   │   ├── ShopPage.jsx             # Refurb marketplace
│   │   │   └── HistoryPage.jsx          # Evaluation history table
│   │   ├── App.jsx                      # Router + API layer
│   │   ├── main.jsx                     # Entry point
│   │   └── index.css                    # Tailwind + editorial styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── deploy.py                            # One-click full deployment
├── requirements.txt                     # Python dependencies
└── README.md
```

---

## Setup & Deployment

### Prerequisites

- Python 3.12+
- Node.js 18+
- AWS CLI configured (`aws configure` with default profile)
- Amazon Bedrock model access enabled for Nova Micro in ap-south-1

### Backend Deployment

```bash
# Install Python dependencies
pip install -r requirements.txt

# Deploy everything: DynamoDB + Lambdas + API Gateway
python deploy.py

# Or deploy individually:
python infrastructure/create_table.py
python infrastructure/deploy_items_endpoint.py
```

### Frontend Build & Deploy

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://rebridge-app-2026 --delete
```

### Environment

- **Region:** ap-south-1 (Mumbai)
- **AWS Profile:** default
- **DynamoDB Table:** ProductHealthCards
- **Bedrock Model:** apac.amazon.nova-micro-v1:0

---

## Hackathon Context

| | |
|---|---|
| **Event** | Amazon HackOn Season 6 |
| **Theme** | Second Life Commerce |
| **Team** | Kavya Rai |
| **Timeline** | Built in 48 hours |
| **Dev Approach** | Spec-driven development using Kiro IDE |

### Why This Fits "Second Life Commerce"

ReBridge gives returned products a literal second life by:
1. Grading them transparently with AI trust scores
2. Routing them to the optimal next destination
3. Resurfacing certified items as affordable refurbished alternatives
4. Preventing unnecessary returns through pre-purchase risk checks

The platform doesn't just process returns — it creates a circular commerce ecosystem where every item finds its highest-value second life.

---

## License

Built for Amazon HackOn Season 6. All rights reserved.
