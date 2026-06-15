# ReBridge — AI-Powered Circular Commerce Platform

![Live Demo](https://img.shields.io/badge/Live-d12xi8surv8so8.cloudfront.net-E8612A?style=for-the-badge)
![GitHub](https://img.shields.io/badge/GitHub-Vya234%2FReBridge-1C1C1C?style=for-the-badge&logo=github)
![Hackathon](https://img.shields.io/badge/Amazon%20HackOn-Season%206-FF9900?style=for-the-badge&logo=amazonaws)
![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20Bedrock%20%7C%20DynamoDB%20%7C%20WebSocket-232F3E?style=for-the-badge&logo=amazonaws)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)

> **Team lazyBot** — Kavya Rai & Oindrila Singha

🔗 **Live:** [https://d12xi8surv8so8.cloudfront.net](https://d12xi8surv8so8.cloudfront.net)  
📂 **GitHub:** [github.com/Vya234/ReBridge](https://github.com/Vya234/ReBridge)

---

## One Line Pitch

**ReBridge is an AI-powered circular commerce platform that gives every returned Amazon product a second life — graded, priced, routed, and resold in seconds.**

---

## Problem Statement

| Problem | Impact |
|---------|--------|
| Amazon loses **$28B annually** to returns | Massive cost with zero value recovery |
| **17–30%** of e-commerce orders returned | 1 in 5 purchases comes back |
| Most items go to **landfill** | Environmental waste at scale |
| Customers **distrust refurbished** products | Trust gap kills resale |
| Sellers inspect **200+ returns/month** manually | Hours wasted on repetitive grading |
| P2P resale feels **unsafe** | No trust layer, no quality guarantee |

---

## Solution — The Intelligent Bridge

```
Return initiated
  → AI grades in <2 seconds (Nova Micro)
    → Routes: Resell / Refurbish / Donate / Recycle
      → Health Card + Suggested Price generated
        → Listed on certified refurb store with NLP search
          → Buyer negotiates via P2P real-time chat
            → Green Credits earned for sustainability
              → Pre-purchase risk check prevents future returns
```

---

## Features (22)

### Core AI

#### 1. AI Grading & Value Recovery Routing Engine
- Powered by **Amazon Nova Lite** (multimodal) via Bedrock converse() API
- Acts as a **Value Recovery Optimizer** — calculates a dynamic `recovery_score` (0–100) to choose the optimal route based on value retention and market demand
- Grades: A (Excellent), B (Good), C (Fair), D (Poor)
- Routes intelligently: Resell / Refurbish / Donate / Recycle — driven by recovery potential, not rigid rules
- Sub-2-second evaluation with confidence scores
- Custom rules: warranty upgrades recovery score, missing accessories ≥ B, packaging doesn't affect grade
- Calculates sustainability metrics per transaction: kg CO₂ prevented, liters water saved

#### 2. Product Health Card
- Trust breakdown: Appearance, Functional, Packaging scores (0–100%)
- **Optimal Value Recovery** display with recovery_score percentage
- **Sustainability Impact** block: 🌱 kg CO₂ Prevented + 💧 Liters Water Saved
- Confidence score with visual progress bar
- Condition summary (AI-generated one-sentence)
- Route journey tracker (visual pipeline)
- Animated rubber-stamp grade seal

#### 3. ReBridge ID Auto-Generation
- Format: `RB-YYYY-XXXXXX` (e.g. `RB-2026-004521`)
- Auto-generates if item_id left blank
- Prominently displayed on result page with copy button
- Used for re-evaluation and QR deep-linking

#### 4. Smart Condition Dropdowns
- Category-specific condition options:
  - Electronics: Fully functional, Minor scratches, Screen cracked, Battery issues, Water damage
  - Clothing: Good condition, Faded, Missing buttons, Torn, Stains
  - Books: Good condition, Highlighted, Torn pages, Cover damaged
  - Home: Light wear, Missing pieces, Motor broken, Shattered/Destroyed
- "Other" option with custom text input
- Auto-fills image label based on condition

#### 5. Extended Form Fields
- Return Reason: Changed mind / Defective / Wrong item / Not as described / Better price found / Gift return
- Warranty Remaining: No warranty → More than 1 year
- Repair History: Never repaired → Repaired multiple times
- All fed into AI prompt for smarter grading

#### 6. AI Resell Price Suggestion
- User enters original price (₹)
- AI calculates: Grade A=80%, B=60%, C=30%, D=0%
- Suggested price shown on health card and shop listings
- Savings percentage displayed vs new price

#### 7. Re-evaluate Feature
- Toggle: "Re-evaluating a previously graded item?"
- Enter existing ReBridge ID
- Fetches old record, submits new evaluation
- Shows comparison banner: "Grade changed from B → C" or "No change detected"
- Accessible from Product Gallery and My Evaluations via "↻ Re-evaluate" button

### Shopping & Discovery

#### 8. Shop Certified Refurbished
- Browse AI-graded inventory by category
- Only surfaces Resell/Refurbish items
- Product cards: grade stamp, suggested price, trust breakdown mini-bars
- "Chat with Seller" button for Resell items

#### 9. Natural Language Search
- NLP-powered via Amazon Nova
- Examples: "Grade A electronics under ₹20000", "refurbished books", "fully functional laptop"
- Extracts: category, grade, route, max_price, min_functional, min_appearance, keywords
- Search hint chips for quick exploration
- Falls back to keyword matching if AI extraction fails

#### 10. P2P Real-Time Negotiation Chat
- WebSocket API Gateway with 3 Lambda functions
- "Negotiate with Buyer" button on Resell (Grade A) items
- Slide-up chat panel with item summary
- Real-time message broadcast via GSI query
- Optimistic message display (zero latency UX)
- Accessible from Shop page via "Chat with Seller"

### Prevention & Intelligence

#### 11. AI Purchase Advisor
- Upgraded pre-purchase intelligence replacing binary risk warnings with deep compatibility analysis
- Evaluates free-text purchase intent against product category via dedicated Bedrock prompt
- Generates a 0–100 **Compatibility Score** (green ≥80, orange 50–79, red <50)
- Outputs personalized reasoning (2–3 bullet points)
- Strict compatibility checklist with Pass ✅ / Warn ⚠️ / Fail ❌ status per criterion
- Explicitly identifies potential return risks
- Delivers actionable final recommendation (e.g. "Verify software compatibility", "Shop Refurbished instead")
- Premium UI matching the Product Health Card layout — form hides on result, full-screen focus
- "Shop Refurbished Instead" CTA when score is below 50

### Gallery & History

#### 12. Product Gallery
- Public view of ALL evaluated items
- Smart client-side search with structured query parsing
- Supports: "Electronics Grade A", "Refurbish", combined filters
- Search hint chips: Electronics, Grade A, Refurbish, Clothing Grade B, Donate
- Expandable rows with trust breakdown + QR code
- Re-evaluate button in expanded view

#### 13. My Evaluations
- Personalised dashboard filtered by current user_id
- Same table design with expandable rows
- QR code + Re-evaluate in expanded view
- Empty state: "You haven't evaluated any items yet"

### Incentives & Identity

#### 14. Green Credits Wallet
- Per-user persistent credits: Donate=50, Refurbish=30, Resell=20, Recycle=10
- Green pill in navbar: 🌱 {credits} credits
- Celebration animation: "+X Green Credits Earned!" on result page
- Accumulates across sessions via DynamoDB

#### 15. Per-User Identity with Duplicate Detection
- Welcome modal on first visit — no login required
- Enter name/email → normalized as user_id
- Checks GreenWallet for existing account
- "Is this you?" confirmation if account found with credits
- "No, I'm someone else" → appends random 4 digits
- "Switch User" in account dropdown menu

#### 16. QR Code + Share Health Card
- QR on every health card: links to `https://d12xi8surv8so8.cloudfront.net?item={id}`
- Deep-link: scanning QR or visiting URL loads that item's health card directly
- "Share Health Card" button copies URL to clipboard
- QR also shown in Product Gallery and My Evaluations expanded rows

#### 17. Seller Bulk Upload Portal
- CSV drag-and-drop upload
- Format: item_id, category, condition_notes, simulated_image_label
- Preview table before processing
- Batch AI grading (concurrent, batches of 3)
- Live progress bar
- Results table with grade + route as they complete
- Summary: total items, route breakdown, green credits earned
- Download results CSV button

#### 18. Location-Based Seller Discovery
- Sellers optionally provide City (required) and Locality (optional) when submitting a return
- Buyers can filter Shop and Product Gallery by city (case-insensitive partial match)
- Matched products display a 📍 Locality, City tag on their card
- Connects buyers to nearby sellers who can then negotiate via the existing P2P chat
- No geo libraries needed — lightweight text-based matching

#### 19. Real Image Upload + AI Vision Analysis
- Upload product photos directly from the evaluation form (drag-and-drop or click)
- **Accepted formats:** JPG, JPEG, PNG, WebP
- **Max file size:** 5MB — shows error for larger files
- **Auto-compression:** Images resized to max 1920px and compressed to JPEG quality 0.8 (most photos under 1MB)
- Shows "Compressing image..." loading state and "Photo ready (245 KB)" after processing
- Images analyzed by **Amazon Nova Lite** (multimodal vision model) via Bedrock converse() API
- AI uses the photo as primary evidence for appearance scoring
- Photos stored permanently in **S3** (`rebridge-product-images` bucket)
- Image URL saved to DynamoDB and displayed across all pages
- Product photos visible in: Result page, Product Gallery, My Evaluations, Shop cards, QR deep-links

#### 20. Similar Item Price Intelligence
- After grading, scans DynamoDB for items with same category + same grade + suggested_price > 0
- Calculates price range from up to 10 similar items
- Displays: "📊 Similar Grade B Electronics: ₹2,900–₹3,300 (based on 5 items)"
- Helps sellers price competitively based on market data

#### 21. S3 Persistent Image Storage
- Dedicated S3 bucket with public read access for product photos
- Images uploaded as `{item_id}.jpg` — permanent, shareable URLs
- Photos render in Shop cards, Product Gallery expanded rows, and QR-linked health cards
- Supports the full product lifecycle from grading to resale

#### 22. Seller Return Analytics Dashboard
- Intelligence tool integrated into the Seller Portal
- Tracks **top return reasons** with visual percentage breakdown (Changed Mind 42%, Wrong Size 23%, Defective 18%)
- Identifies the **most returned category** with distribution insights
- Provides **actionable AI suggestions** to help sellers prevent future returns (e.g. "Improve sizing charts to reduce apparel returns by 15%")
- Enables data-driven decision making for inventory and listing optimization

---

## Future Development / Roadmap

- **Geo-Intelligent Local Exchange** — Extend location discovery with coordinates, radius-based filtering (5km/10km/25km), haversine distance ranking, AI routing that factors local demand, carbon emission savings estimates, and community pickup hubs
- **Image Upload** — Real visual grading via Amazon Rekognition
- **Seller Analytics Dashboard** — Return patterns, grade distribution, revenue insights
- **Green Credits Redemption** — Redeem credits for discounts or donate to environmental causes
- **Multi-language Support** — Expand trust cards to global marketplaces
- **Enhanced Bulk Upload Vision** — Future iterations of the Seller Bulk Upload Portal will support processing real product images at scale, allowing sellers to provide image URLs directly within the upload CSV or upload a bundled ZIP file of product photos for batch AI vision analysis

---

## Amazon Problem Statement Coverage

| Amazon Requirement | ReBridge Features |
|---|---|
| AI deciding resell/refurbish/donate/recycle | AI Routing Engine + Extended Fields + Warranty Rules |
| Smart quality grading | Product Health Card + Appearance/Functional/Packaging Scores |
| Personalized refurb recommendations | Shop Certified Refurbished + NLP Search + Price Suggestion |
| Sustainable incentives | Green Credits Wallet + Celebration Animations |
| Easy P2P resale | Real-time WebSocket Chat + AI Price Suggestion |
| Predictive return prevention | AI Purchase Advisor | Compatibility scoring + checklist empowers smarter buying |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18.3 + Vite 6 + Tailwind CSS 3.4 | SPA with editorial design system |
| **Hosting** | AWS S3 + CloudFront (HTTPS) | Global CDN with custom domain |
| **Backend** | AWS Lambda (Python 3.12) × 9 functions | Serverless compute |
| **HTTP API** | Amazon API Gateway (HTTP API) | REST endpoints + CORS |
| **WebSocket API** | Amazon API Gateway (WebSocket) | Real-time P2P chat |
| **AI/ML** | Amazon Bedrock — Nova Lite (multimodal vision) + Nova Micro (text) | Grading with image analysis, NLP search, Purchase Advisor |
| **Database** | DynamoDB (3 tables, on-demand) | Zero-config storage |
| **Storage** | Amazon S3 (`rebridge-product-images`) | Persistent product photo storage |
| **QR** | qrcode.react + api.qrserver.com | Scannable health card verification |
| **Dev Tooling** | Kiro IDE (spec-driven) | AI-assisted implementation |

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                  React Frontend (S3 + CloudFront HTTPS)                   │
│  Home • Evaluate • Result • Shop • Gallery • My Evals • Seller • Chat     │
└──────────────────────┬─────────────────────────────────┬──────────────────┘
                       │ HTTPS                           │ WSS
                       ▼                                 ▼
┌──────────────────────────────────────────┐  ┌────────────────────────────┐
│        HTTP API Gateway (REST)           │  │  WebSocket API Gateway     │
│  CORS: * │ Auto-deploy │ ap-south-1      │  │Route: $request.body.action │
└──┬─────┬──────┬──────┬────┬──────┬───────┘  └┬─────┬───────┬─────────────┘
   │     │      │      │    │      │           |     │       │
   ▼     ▼      ▼      ▼    ▼      ▼           ▼     ▼       ▼
┌─────┐┌────┐┌─────┐┌────┐┌────┐┌──────┐   ┌─────┐┌──────┐┌─────┐
│grade││get_││get_ ││get_││get ││natur-│   │ws_  ││ws_   ││ws_  │
│_and_││hlth││items││all_││wall││al_   │   │conn ││disco ││msg  │
│route││card││_cat ││item││et  ││search│   │ect  ││nnect ││     │
└──┬──┘└──┬─┘└──┬──┘└──┬─┘└──┬─┘└──┬───┘   └──┬──┘└──┬───┘└──┬──┘
   │      │     │      │     │     │          │      │       │
   ▼      │     │      │     │     ▼          │      │       │
┌───────┐ │     │      │     │  ┌───────┐     │      │       │
│Bedrock│ │     │      │     │  │Bedrock│     │      │       │
│(Nova) │ │     │      │     │  │(Nova) │     │      │       │
└──┬────┘ │     │      │     │  └──┬────┘     │      │       │
   │      ▼     ▼      ▼     ▼     │          ▼      ▼       ▼
   │  ┌─────────────────────────────────────────────────────────────┐
   └─►│                     Amazon DynamoDB                         │
      │  ┌──────────────────┐ ┌─────────────┐ ┌─────────────────┐   │
      │  │ProductHealthCards│ │GreenWallet  │ │ChatConnections  │   │
      │  │PK: item_id       │ │PK: user_id  │ │PK: connectionId │   │ 
      │  │Fields: grade,    │ │total_credits│ │GSI: itemId-index│   │
      │  │route, price,     │ │             │ │sender, itemId   │   │
      │  │trust, image_url  │ │             │ │                 │   │
      │  └──────────────────┘ └─────────────┘ └─────────────────┘   │
      └─────────────────────────────────────────────────────────────┘

      ┌─────────────────────────────────────────────────────────────┐
      │                     Amazon S3                               │
      │  Bucket: rebridge-product-images                            │
      │  Pattern: {item_id}.jpg │ Public read │ ap-south-1          │
      └─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### HTTP API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/evaluate-return` | AI grading + routing + pricing + wallet update |
| `GET` | `/health-card/{item_id}` | Retrieve stored Product Health Card |
| `GET` | `/items/{category}` | Browse by category (Resell/Refurbish only) |
| `GET` | `/items` | All items sorted by timestamp (newest first) |
| `GET` | `/wallet/{user_id}` | Green Credits balance |
| `POST` | `/search` | Natural language search with AI filter extraction |

### WebSocket API

| Route | Handler | Description |
|-------|---------|-------------|
| `$connect` | `ws_connect` | Save connectionId + itemId via query params |
| `$disconnect` | `ws_disconnect` | Remove connection |
| `sendMessage` | `ws_message` | GSI query → broadcast to all item connections |

### POST /evaluate-return

**Request:**
```json
{
  "item_id": "",
  "category": "Electronics",
  "condition_notes": "Minor scratches",
  "simulated_image_label": "light_scratches",
  "original_price": 2999,
  "return_reason": "Changed mind",
  "warranty_left": "6-12 months",
  "repair_history": "Never repaired",
  "user_id": "kavya"
}
```

**Response:**
```json
{
  "item_id": "RB-2026-004521",
  "user_id": "kavya",
  "category": "Electronics",
  "grade": "A",
  "condition_summary": "Device in excellent condition with minor surface wear",
  "assigned_route": "Resell",
  "confidence_score": 0.92,
  "trust_breakdown": { "appearance": 0.85, "functional": 0.98, "packaging": 0.80 },
  "green_credits": 20,
  "original_price": 2999,
  "suggested_price": 2399,
  "return_reason": "Changed mind",
  "warranty_left": "6-12 months",
  "repair_history": "Never repaired",
  "timestamp": "2026-06-14T10:30:00+00:00"
}
```

### POST /search

**Request:**
```json
{ "query": "Grade A electronics under 5000" }
```

**Response:**
```json
{
  "items": [...],
  "count": 3,
  "filters_applied": { "category": "Electronics", "grade": "A", "max_price": 5000, "keywords": [] }
}
```

---

## Project Structure

```
ReBridge/
├── specs/
│   ├── 1-trust-database.md
│   ├── 2-ai-routing-engine.md
│   └── 3-api-gateway.md
├── infrastructure/
│   ├── create_table.py                  # ProductHealthCards table
│   ├── deploy_items_endpoint.py         # GET /items/{category}
│   ├── deploy_wallet.py                 # GreenWallet + GET /wallet
│   └── deploy_websocket.py             # WebSocket API + Chat Lambdas
├── lambdas/
│   ├── shared/
│   │   └── db_client.py                 # DynamoDB helper (put/get)
│   ├── grade_and_route/
│   │   └── handler.py                   # AI grading + routing + pricing + credits
│   ├── get_health_card/
│   │   └── handler.py                   # Health card retrieval
│   ├── get_items_by_category/
│   │   └── handler.py                   # Category browse
│   ├── get_all_items/
│   │   └── handler.py                   # All items (Gallery)
│   ├── get_wallet/
│   │   └── handler.py                   # Green Credits balance
│   ├── natural_search/
│   │   └── handler.py                   # NLP search via Nova
│   └── websocket/
│       ├── connect.py                   # $connect
│       ├── disconnect.py                # $disconnect
│       └── message.py                   # sendMessage broadcast
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.jsx             # Hero + Check Before You Buy
│   │   │   ├── EvaluatePage.jsx         # Smart form + extended fields
│   │   │   ├── ResultPage.jsx           # Health Card + QR + Price + Chat
│   │   │   ├── ShopPage.jsx             # Refurb store + NLP search + chips
│   │   │   ├── HistoryPage.jsx          # Product Gallery + smart search
│   │   │   ├── MyEvaluations.jsx        # Personal dashboard
│   │   │   ├── SellerPortal.jsx         # Bulk CSV upload
│   │   │   ├── ChatPortal.jsx           # WebSocket chat panel
│   │   │   └── WelcomeModal.jsx         # Identity + duplicate detection
│   │   ├── App.jsx                      # Router + state + account dropdown
│   │   ├── main.jsx
│   │   └── index.css                    # Tailwind + editorial system
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── deploy.py                            # One-click backend deployment
├── sample_bulk_upload.csv               # Sample CSV for testing
├── requirements.txt
├── PITCH.md
└── README.md
```

---

## Setup & Deployment

### Prerequisites
- Python 3.12+, Node.js 18+
- AWS CLI configured (default profile)
- Bedrock model access: Nova Lite + Nova Micro in ap-south-1

### Backend
```bash
pip install -r requirements.txt
python deploy.py                              # Core: DynamoDB + Lambdas + HTTP API
python infrastructure/deploy_items_endpoint.py # GET /items/{category}
python infrastructure/deploy_wallet.py        # GreenWallet + GET /wallet
python infrastructure/deploy_websocket.py     # WebSocket chat system
```

### Frontend
```bash
cd frontend && npm install && npm run build
aws s3 sync dist/ s3://rebridge-app-2026 --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Environment
| Config | Value |
|--------|-------|
| Region | ap-south-1 (Mumbai) |
| Bedrock Model | apac.amazon.nova-micro-v1:0 |
| HTTP API | s3r8aqjg75.execute-api.ap-south-1.amazonaws.com |
| WebSocket | kvhtc0th50.execute-api.ap-south-1.amazonaws.com/production |
| CloudFront | d12xi8surv8so8.cloudfront.net |

---

## ROI for Amazon

| Metric | Impact |
|--------|--------|
| 20% return cost recovery | **$5.6B saved annually** |
| New refurb GMV stream | Revenue at lower COGS |
| P2P commission revenue | New transaction fee stream |
| Green Credits → loyalty | Higher customer LTV |
| Sustainability story | Brand value with conscious consumers |
| Seller efficiency | Bulk processing eliminates manual inspection |

---

## Hackathon Context

| | |
|---|---|
| **Event** | Amazon HackOn Season 6 |
| **Theme** | Second Life Commerce |
| **Team** | lazyBot (Kavya Rai, Oindrila Singha) |
| **Timeline** | 48 hours |
| **Dev** | Kiro spec-driven IDE |
| **Live** | [d12xi8surv8so8.cloudfront.net](https://d12xi8surv8so8.cloudfront.net) |
| **GitHub** | [github.com/Vya234/ReBridge](https://github.com/Vya234/ReBridge) |

---

## License

Built for Amazon HackOn Season 6. All rights reserved.
