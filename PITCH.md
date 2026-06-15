# ReBridge — Pitch Deck

---

## SLIDE 1: Title

# Every Return Finds a New Life

**ReBridge** — AI-Powered Circular Commerce Platform

🏆 Amazon HackOn Season 6 | Second Life Commerce
👤 Team **lazyBot** — Kavya Rai & Oindrila Singha

🔗 [https://d12xi8surv8so8.cloudfront.net](https://d12xi8surv8so8.cloudfront.net)

---

## SLIDE 2: The Problem

**Priya** returns ₹500 shoes — 600km warehouse trip costs more than the item. Written off.

**Rahul** has a perfect baby monitor — won't list on OLX because strangers feel unsafe. Sits in a drawer.

**Small Seller** processes 200+ returns/month — photographs each one, guesses a price, re-lists manually.

> Amazon loses **$28B/year** to returns.
> Most go to **landfill** despite being usable.
> Customers don't trust refurbished. P2P feels unsafe.

---

## SLIDE 3: The Solution

One intelligent loop that closes every gap:

```
Return → AI computes Value Recovery Score → Optimal Routing
  → Health Card + Hard Carbon/Water Metrics Generated
    → Listed on certified store with NLP search
      → Buyer negotiates via Amazon-Mediated real-time chat
        → AI Purchase Advisor empowers smart buying & prevents future returns
```

Every Amazon requirement. One platform. 21 features. Full circle.

---

## SLIDE 4: 21 Features Built in 48 Hours

| # | Feature | What It Does |
|---|---------|-------------|
| 1 | **Value Recovery Optimizer** | AI calculates a 0-100 score to route items for maximum asset value |
| 2 | **Health & Impact Card** | Trust scores + real-time Sustainability Impact (kg CO₂ & Water saved) |
| 3 | **ReBridge ID** | Auto-generates RB-2026-XXXXXX for every item |
| 4 | **Smart Dropdowns** | Category-specific conditions + "Other" option |
| 5 | **Extended Fields** | Return reason, warranty, repair history → AI prompt |
| 6 | **AI Price Suggestion** | Grade-based pricing: A=80%, B=60%, C=30% |
| 7 | **Re-evaluate** | Re-submit existing ID, shows grade change comparison |
| 8 | **Shop Certified** | Browse refurb inventory with suggested prices |
| 9 | **NLP Search** | "Grade A electronics under ₹20000" via Nova |
| 10 | **Amazon-Mediated Chat** | WebSocket negotiation layer between buyer & seller |
| 11 | **AI Purchase Advisor** | Compatibility scoring, checklist, risks — empowers smarter buying |
| 12 | **Product Gallery** | Public catalog with smart search + QR codes |
| 13 | **My Evaluations** | Personal dashboard per user |
| 14 | **Green Credits** | Per-user rewards (Donate=50, Refurbish=30...) |
| 15 | **Smart Identity** | No login needed + duplicate name detection |
| 16 | **QR + Share** | Scannable QR deep-links to any health card |
| 17 | **Analytics & Bulk Portal** | CSV batch grading + Seller Analytics Dashboard to prevent returns |
| 18 | **Location Discovery** | City/Locality filter connects buyers to nearby sellers |
| 19 | **Image Upload + AI Vision** | Real photo upload with auto-compression + Nova Lite multimodal vision analysis |
| 20 | **Price Intelligence** | Market price range from similar graded items |
| 21 | **S3 Image Storage** | Persistent photos visible across all pages |

---

## SLIDE 5: Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + Tailwind → **S3 + CloudFront** (HTTPS) |
| Backend | **AWS Lambda** × 10 functions (Python 3.12) |
| API | **API Gateway** — HTTP + WebSocket |
| AI | **Amazon Bedrock** — Nova Lite (vision) + Nova Micro (text) |
| Database | **DynamoDB** — 3 tables + GSI |
| Storage | **Amazon S3** — product image persistence |
| Real-time | WebSocket API Gateway + Lambda broadcast |
| Dev | Built with **Kiro** spec-driven IDE |

✅ 100% AWS-native. Zero third-party APIs. Fully serverless. Multimodal vision. Scales to millions.

---

## SLIDE 6: ROI for Amazon

| Metric | Business Impact |
|--------|----------------|
| 20% return cost recovery | **$5.6B saved annually** |
| Refurb GMV stream | New revenue at lower COGS |
| P2P commission | Fee on every negotiated resale |
| Green Credits → loyalty | Higher LTV through engagement |
| Sustainability | ESG brand value with conscious consumers |
| Seller efficiency | 200 returns/month → 1 CSV upload |
| Return Prevention | Seller Analytics Dashboard fixes root causes at the source |
| Measurable Sustainability | Hard carbon & water metrics for corporate ESG reporting |

> Every feature drives measurable Amazon revenue.

---

## SLIDE 7: Live Demo

🔗 **[https://d12xi8surv8so8.cloudfront.net](https://d12xi8surv8so8.cloudfront.net)**

| Step | Demo Flow |
|------|-----------|
| 1 | **Evaluate** — submit item, see Value Recovery Score + Optimal Routing in 2 seconds |
| 2 | **Health Card** — trust scores, Carbon Savings metrics, QR code, share link |
| 3 | **Shop** — NLP search: "Grade A electronics under ₹5000" |
| 4 | **Chat** — real-time buyer-seller negotiation |
| 5 | **Seller Portal** — CSV batch grading + actionable Return Analytics Dashboard |
| 6 | **Green Credits** — watch wallet grow with each evaluation |
| 7 | **AI Purchase Advisor** — compatibility check before buying |

**Built in 48 hours. 21 features. 10 Lambda functions. 3 DynamoDB tables. S3 image storage. Fully deployed on AWS. Ready to scale.**

**Next:** Geo-Intelligent Local Exchange — radius filtering, haversine ranking, carbon savings, community pickup hubs. Enterprise Bulk Image Upload — processing real product images at scale via CSV URL ingestion or ZIP file uploads.

---

## One Line

**ReBridge gives every returned Amazon product a second life — optimized for value recovery, priced intelligently, traded with trust, and backed by measurable carbon savings.**
