# ReBridge — AI-Powered Circular Commerce Platform

![Live Demo](https://img.shields.io/badge/Live%20Demo-d12xi8surv8so8.cloudfront.net-E8612A?style=for-the-badge)
![GitHub](https://img.shields.io/badge/GitHub-Vya234%2FReBridge-1C1C1C?style=for-the-badge&logo=github)
![Hackathon](https://img.shields.io/badge/Amazon%20HackOn-Season%206-FF9900?style=for-the-badge&logo=amazonaws)
![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20Bedrock%20%7C%20DynamoDB-232F3E?style=for-the-badge&logo=amazonaws)

> **Team lazyBot** — Kavya Rai, Oindrila Singha

🔗 **Live Demo:** [https://d12xi8surv8so8.cloudfront.net](https://d12xi8surv8so8.cloudfront.net)  
📂 **GitHub:** [github.com/Vya234/ReBridge](https://github.com/Vya234/ReBridge)

---

## One Line Pitch

**ReBridge is an AI-powered circular commerce platform that gives every returned Amazon product a second life — graded, routed, and resold in seconds.**

---

## Problem Statement

The e-commerce returns ecosystem is fundamentally broken:

| Problem | Impact |
|---------|--------|
| Amazon loses **$28B annually** to returns processing | Massive operational cost with no value recovery |
| **17–30%** of all e-commerce orders are returned | Every 1 in 5 purchases comes back |
| Most returned items go to **landfill** despite being usable | Environmental waste at industrial scale |
| Customers **distrust refurbished products** | Trust gap kills resale before it starts |
| Small sellers manually inspect **200+ returns/month** | Hours wasted on repetitive grading |
| P2P resale on classifieds **feels unsafe** | No trust layer, no quality guarantee |

The industry needs an intelligent bridge between returns, quality assurance, and resale — one that builds trust, rewards sustainability, and closes the loop.

---

## Solution — The Intelligent Bridge

ReBridge creates a complete product lifecycle loop:

```
Customer returns item
    → AI grades condition in <2 seconds (Nova Micro)
        → Smart routing: Resell / Refurbish / Donate / Recycle
            → Product Health Card with trust breakdown
                → Certified item listed on refurb marketplace
                    → Next buyer saves 35% + earns Green Credits
                        → Pre-purchase risk check prevents future returns
                            → P2P negotiation via real-time chat
```

One platform. Full circle. Every item finds its highest-value second life.

---

## Features

### 1. AI Grading & Routing Engine
- Powered by **Amazon Nova Micro** via Amazon Bedrock (`apac.amazon.nova-micro-v1:0`)
- Evaluates items across cosmetic, functional, and packaging dimensions
- Assigns grades: **A** (Excellent), **B** (Good), **C** (Fair), **D** (Poor)
- Routes automatically: A → Resell, B → Refurbish, C → Donate, D → Recycle
- Sub-2-second evaluation with confidence scores
- Custom grading criteria: missing accessories alone never drops below B, packaging doesn't affect grade

### 2. Product Health Card
- Visual certificate for every evaluated item
- **Trust Breakdown**: Three independent scores (Cosmetic, Functional, Packaging)
- **Confidence Score**: AI's self-assessed certainty (0–100%)
- **Condition Summary**: One-sentence human-readable assessment
- **Route Journey Tracker**: Visual pipeline showing item's destination
- **Grade Stamp**: Animated rubber-stamp quality seal with color coding

### 3. Shop Certified Refurbished
- Browse AI-graded inventory by category (Electronics, Clothing, Books, Home)
- Only surfaces items routed to Resell or Refurbish
- Product cards: grade badge, trust breakdown mini-bars, condition summary
- **"Save 35% vs new"** discount badge on every listing
- "Chat with Seller" button for direct P2P negotiation on Resell items

### 4. Return History Dashboard
- Full audit trail of all previously evaluated items
- Table view: Item ID, Category, Grade, Route, Confidence, Timestamp
- Color-coded grade badges and route pills
- **Expandable rows** — click to reveal trust breakdown and condition summary
- Real-time data from DynamoDB

### 5. Return Prevention (Check Before You Buy)
- Pre-purchase risk assessment on the homepage
- Customer enters product category and usage description
- AI evaluates and returns a risk grade
- **Grade C/D**: Warning with link to Shop Refurbished
- **Grade A/B**: Green confirmation
- Nudges smarter purchasing decisions before checkout

### 6. Green Credits Wallet
- Per-user persistent credit system
- Credits earned based on sustainability impact: Donate=50, Refurbish=30, Resell=20, Recycle=10
- Wallet balance displayed in navbar as green pill (🌱)
- Celebration animation on credit earn (+50 Green Credits Earned!)
- Credits accumulate across sessions via DynamoDB

### 7. Per-User Identity
- No login required — friendly welcome modal on first visit
- Enter name or email → persisted in localStorage
- User ID used for wallet tracking and chat identity
- "Switch User" option in navbar to change identity
- Each browser/device gets independent persistent wallet

### 8. Seller Bulk Upload Portal
- CSV drag-and-drop upload interface
- Format: item_id, category, condition_notes, simulated_image_label
- Preview table before processing
- Batch AI grading — processes all items concurrently (batches of 3)
- Live progress bar during processing
- Results table with grade and route as items complete
- Summary: total items, route breakdown, total green credits earned
- Download results as CSV

### 9. P2P Real-Time Negotiation Chat
- WebSocket-powered real-time messaging
- "Negotiate with Buyer" button appears on Resell (Grade A) items
- Chat panel slides up from bottom with item summary
- Messages broadcast to all connected users for same item
- Optimistic message display (zero perceived latency)
- Connection status indicator
- Accessible from Shop page via "Chat with Seller" button

---

## Amazon Problem Statement Coverage

| Amazon Requirement | ReBridge Feature | How It Works |
|---|---|---|
| AI deciding resell/refurbish/donate/recycle | **AI Routing Engine** | Nova Micro grades items A–D with automatic route assignment |
| Smart quality grading | **Product Health Card** | Trust breakdown across cosmetic, functional, packaging |
| Personalized refurb recommendations | **Shop Certified Refurbished** | Browse AI-graded inventory by category with trust scores |
| Sustainable incentives | **Green Credits Wallet** | Per-user credits earned for sustainable routing choices |
| Easy P2P resale | **Real-time Chat** | WebSocket negotiation between buyer and seller on Resell items |
| Predictive return prevention | **Check Before You Buy** | Pre-purchase risk assessment nudges toward refurbished |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18.3 + Vite 6 + Tailwind CSS 3.4 | SPA with editorial design system |
| **Hosting** | AWS S3 + CloudFront | Static site with global CDN |
| **Backend** | AWS Lambda (Python 3.12) | Serverless compute for all endpoints |
| **HTTP API** | Amazon API Gateway (HTTP API) | REST endpoints with CORS |
| **WebSocket API** | Amazon API Gateway (WebSocket) | Real-time P2P chat |
| **AI/ML** | Amazon Bedrock — Nova Micro (`apac.amazon.nova-micro-v1:0`) | Product grading and routing |
| **Database** | Amazon DynamoDB (3 tables, on-demand) | Zero-config persistent storage |
| **Infrastructure** | IAM roles, CORS, ap-south-1 | Production-ready AWS setup |
| **Dev Tooling** | Kiro IDE (spec-driven development) | AI-assisted implementation |
| **CLI** | AWS CLI + boto3 | Infrastructure deployment |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    React Frontend (S3 + CloudFront)                        │
│  Home • Evaluate • Health Card • Shop • History • Seller Portal • Chat    │
└────────────────────────┬────────────────────────────┬────────────────────┘
                         │ HTTPS                      │ WSS
                         ▼                            ▼
┌────────────────────────────────────┐  ┌──────────────────────────────────┐
│     HTTP API Gateway (REST)         │  │   WebSocket API Gateway (Chat)    │
│   CORS: * │ Auto-deploy │ Mumbai    │  │   Route: $request.body.action     │
└──┬─────────────┬──────────────┬────┘  └──┬────────────┬────────────┬────┘
   │             │              │           │            │            │
   ▼             ▼              ▼           ▼            ▼            ▼
┌────────┐ ┌──────────┐ ┌───────────┐ ┌────────┐ ┌──────────┐ ┌────────┐
│grade_  │ │get_health│ │get_items_ │ │ws_     │ │ws_       │ │ws_     │
│and_    │ │_card     │ │by_category│ │connect │ │disconnect│ │message │
│route   │ │          │ │           │ │        │ │          │ │        │
└───┬────┘ └────┬─────┘ └─────┬─────┘ └───┬────┘ └────┬─────┘ └───┬────┘
    │           │              │            │           │           │
    ▼           │              │            │           │           │
┌────────┐     │              │            │           │           │
│Amazon  │     │              │            │           │           │
│Bedrock │     │              │            │           │           │
│(Nova)  │     │              │            │           │           │
└───┬────┘     │              │            │           │           │
    │          ▼              ▼            ▼           ▼           ▼
    │   ┌─────────────────────────────────────────────────────────────┐
    └──►│                    Amazon DynamoDB                            │
        │  ┌─────────────────┐ ┌────────────┐ ┌──────────────────┐   │
        │  │ProductHealthCards│ │GreenWallet │ │ChatConnections   │   │
        │  │PK: item_id      │ │PK: user_id │ │PK: connectionId  │   │
        │  │                 │ │             │ │GSI: itemId-index  │   │
        │  └─────────────────┘ └────────────┘ └──────────────────┘   │
        └─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### HTTP API (REST)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/evaluate-return` | AI grading + routing + DynamoDB write + wallet update |
| `GET` | `/health-card/{item_id}` | Retrieve stored Product Health Card |
| `GET` | `/items/{category}` | Browse items by category (Resell/Refurbish only) |
| `GET` | `/wallet/{user_id}` | Get Green Credits balance |

### WebSocket API (Chat)

| Route | Handler | Description |
|-------|---------|-------------|
| `$connect` | `ws_connect` | Save connectionId + itemId to DynamoDB |
| `$disconnect` | `ws_disconnect` | Remove connection |
| `sendMessage` | `ws_message` | Query GSI, broadcast to all item connections |

### POST /evaluate-return

**Request:**
```json
{
  "item_id": "ITEM-001",
  "category": "Electronics",
  "condition_notes": "Minor scratches on back, fully functional",
  "simulated_image_label": "scratched_phone_back",
  "user_id": "kavya"
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
  "trust_breakdown": {
    "cosmetic": 0.65,
    "functional": 0.95,
    "packaging": 0.78
  },
  "green_credits": 30,
  "timestamp": "2026-06-13T10:30:00+00:00"
}
```

### WebSocket sendMessage

**Client sends:**
```json
{
  "action": "sendMessage",
  "itemId": "test-009",
  "message": "Is the screen scratch-free?",
  "sender": "buyer_kavya"
}
```

**Server broadcasts to other connections:**
```json
{
  "itemId": "test-009",
  "message": "Is the screen scratch-free?",
  "sender": "buyer_kavya"
}
```

---

## Project Structure

```
ReBridge/
├── specs/
│   ├── 1-trust-database.md              # DynamoDB architecture spec
│   ├── 2-ai-routing-engine.md           # AI grading engine spec
│   └── 3-api-gateway.md                 # API design spec
├── infrastructure/
│   ├── create_table.py                  # ProductHealthCards table
│   ├── deploy_items_endpoint.py         # Category browse endpoint
│   ├── deploy_wallet.py                 # GreenWallet table + endpoint
│   └── deploy_websocket.py             # WebSocket API + Chat Lambdas + ChatConnections
├── lambdas/
│   ├── shared/
│   │   └── db_client.py                 # Shared DynamoDB helper (put/get)
│   ├── grade_and_route/
│   │   └── handler.py                   # AI grading + routing + green credits
│   ├── get_health_card/
│   │   └── handler.py                   # Health card retrieval
│   ├── get_items_by_category/
│   │   └── handler.py                   # Category browse (Resell/Refurbish filter)
│   ├── get_wallet/
│   │   └── handler.py                   # Green Credits balance
│   └── websocket/
│       ├── connect.py                   # $connect — save connection
│       ├── disconnect.py                # $disconnect — remove connection
│       └── message.py                   # sendMessage — GSI query + broadcast
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.jsx             # Hero + Return Prevention
│   │   │   ├── EvaluatePage.jsx         # Product Passport form
│   │   │   ├── ResultPage.jsx           # Health Card certificate + Chat
│   │   │   ├── ShopPage.jsx             # Refurb marketplace + Chat with Seller
│   │   │   ├── HistoryPage.jsx          # Evaluation history table
│   │   │   ├── SellerPortal.jsx         # Bulk CSV upload + batch processing
│   │   │   ├── ChatPortal.jsx           # WebSocket P2P negotiation
│   │   │   └── WelcomeModal.jsx         # User identity onboarding
│   │   ├── App.jsx                      # Router + API layer + state
│   │   ├── main.jsx                     # Entry point
│   │   └── index.css                    # Tailwind + editorial design system
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── deploy.py                            # One-click full backend deployment
├── sample_bulk_upload.csv               # Sample CSV for seller portal testing
├── requirements.txt                     # Python dependencies (boto3)
├── PITCH.md                             # Pitch deck for judges
└── README.md                            # This file
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

# Deploy core backend: DynamoDB + Lambdas + HTTP API Gateway
python deploy.py

# Deploy additional endpoints
python infrastructure/deploy_items_endpoint.py
python infrastructure/deploy_wallet.py

# Deploy WebSocket chat system
python infrastructure/deploy_websocket.py
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

# Deploy to S3 + invalidate CloudFront
aws s3 sync dist/ s3://rebridge-app-2026 --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Environment

| Config | Value |
|--------|-------|
| Region | ap-south-1 (Mumbai) |
| AWS Profile | default |
| DynamoDB Tables | ProductHealthCards, GreenWallet, ChatConnections |
| Bedrock Model | apac.amazon.nova-micro-v1:0 |
| HTTP API | s3r8aqjg75.execute-api.ap-south-1.amazonaws.com |
| WebSocket API | kvhtc0th50.execute-api.ap-south-1.amazonaws.com/production |
| CloudFront | d12xi8surv8so8.cloudfront.net |

---

## ROI for Amazon

| Metric | Impact |
|--------|--------|
| **20% return cost recovery** | $5.6B saved annually |
| **New refurb GMV stream** | Revenue at lower COGS than new inventory |
| **Customer LTV increase** | Trust transparency drives repeat purchases |
| **Sustainability brand value** | Measurable ESG impact with conscious consumers |
| **Seller efficiency** | Bulk processing eliminates manual inspection |
| **Reduced landfill volume** | Circular routing keeps products in use |

> ReBridge turns a $28B cost center into a sustainable commerce engine.

---

## Hackathon Context

| | |
|---|---|
| **Event** | Amazon HackOn Season 6 |
| **Theme** | Second Life Commerce |
| **Team** | lazyBot (Kavya Rai, Oindrila Singha) |
| **Timeline** | Built in 48 hours |
| **Dev Approach** | Spec-driven development using Kiro IDE |
| **Live URL** | [https://d12xi8surv8so8.cloudfront.net](https://d12xi8surv8so8.cloudfront.net) |
| **GitHub** | [github.com/Vya234/ReBridge](https://github.com/Vya234/ReBridge) |

### Why This Wins "Second Life Commerce"

ReBridge doesn't just process returns — it creates a **circular commerce ecosystem**:

1. **Grades** products transparently with AI trust scores
2. **Routes** them to the optimal second-life destination
3. **Resurfaces** certified items as affordable refurbished alternatives
4. **Rewards** sustainable choices with Green Credits
5. **Connects** buyers and sellers in real-time for P2P resale
6. **Prevents** unnecessary returns through pre-purchase intelligence
7. **Empowers** sellers with bulk AI grading at scale

Every item finds its highest-value second life. Every participant is rewarded. Every decision is transparent.

---

## License

Built for Amazon HackOn Season 6. All rights reserved.
