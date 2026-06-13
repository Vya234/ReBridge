# ReBridge — Pitch Deck

---

## SLIDE 1: Title

# Every Return Finds a New Life

**ReBridge** — AI-Powered Circular Commerce Platform

🏆 Amazon HackOn Season 6 | Theme: Second Life Commerce  
👤 Team **lazyBot** — Kavya Rai & Oindrila Singha

🔗 Live: [https://d12xi8surv8so8.cloudfront.net](https://d12xi8surv8so8.cloudfront.net)

---

## SLIDE 2: The Problem

Three real personas from Amazon's brief:

**Priya** returns ₹500 shoes — they travel 600km to a warehouse. Processing costs more than the item. Written off.

**Rahul** has a perfectly working baby monitor — won't list on OLX because strangers feel unsafe. Sits in a drawer forever.

**Small Seller** processes 200+ returns/month manually — photographs each item, guesses a price, re-lists one by one.

> Amazon loses **$28B/year** to returns.  
> Most items go to **landfill** despite being usable.  
> Customers **don't trust** refurbished products.

---

## SLIDE 3: The Solution

One intelligent loop that closes every gap:

```
Return initiated
  → AI grades condition in 2 seconds
    → Routes to Resell / Refurbish / Donate / Recycle
      → Product Health Card created (trust scores)
        → Listed on certified refurb store (35% cheaper)
          → Buyer negotiates via P2P real-time chat
            → Green Credits earned for sustainable choices
              → Pre-purchase check prevents the next return
```

Every Amazon requirement. One platform. Full circle.

---

## SLIDE 4: 9 Features Built in 48 Hours

| # | Feature | What It Does |
|---|---------|-------------|
| 1 | **AI Grading Engine** | Amazon Nova grades items A/B/C/D in <2 seconds |
| 2 | **Product Health Card** | Trust breakdown: cosmetic, functional, packaging scores |
| 3 | **Shop Certified Refurbished** | Browse AI-graded inventory, save 35% vs new |
| 4 | **Return History Dashboard** | Full audit trail with expandable detail rows |
| 5 | **Check Before You Buy** | Pre-purchase risk assessment prevents returns |
| 6 | **Green Credits Wallet** | Per-user persistent rewards for sustainable routing |
| 7 | **User Identity** | No login needed — name-based tracking via localStorage |
| 8 | **Seller Bulk Upload** | CSV → batch AI grading with live progress |
| 9 | **P2P Real-time Chat** | WebSocket negotiation between buyer and seller |

---

## SLIDE 5: Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Tailwind → **AWS S3 + CloudFront** |
| Backend | **AWS Lambda** (Python 3.12) + **API Gateway** (HTTP + WebSocket) |
| AI | **Amazon Bedrock** — Nova Micro (`apac.amazon.nova-micro-v1:0`) |
| Database | **DynamoDB** — 3 tables (ProductHealthCards, GreenWallet, ChatConnections) |
| Dev | Built with **Kiro** spec-driven IDE in 48 hours |

✅ All AWS-native. Zero third-party AI APIs. Fully serverless.

---

## SLIDE 6: ROI for Amazon

| Metric | Business Impact |
|--------|----------------|
| 20% return cost recovery | **$5.6B saved annually** |
| New refurb GMV stream | Revenue at lower COGS than new inventory |
| P2P commission revenue | New transaction fee stream on resale |
| Green Credits → loyalty | Higher customer LTV through engagement |
| Sustainability story | Brand value with conscious consumers |

> Every feature drives measurable Amazon revenue.  
> ReBridge turns a $28B cost center into a commerce engine.

---

## SLIDE 7: Live Demo

🔗 **[https://d12xi8surv8so8.cloudfront.net](https://d12xi8surv8so8.cloudfront.net)**

| Step | What You'll See |
|------|----------------|
| 1 | **Evaluate a Return** → AI grade in 2 seconds |
| 2 | **Shop Certified Refurbished** → browse AI-graded inventory |
| 3 | **Check Before You Buy** → return risk prevention |
| 4 | **Seller Portal** → bulk CSV upload + batch grading |
| 5 | **P2P Chat** → real-time negotiation on Resell items |

Built in 48 hours. Fully deployed on AWS. Ready to scale.

---

## One Line

**ReBridge gives every returned Amazon product a second life — graded by AI, routed intelligently, resold with trust, and rewarded with Green Credits.**
