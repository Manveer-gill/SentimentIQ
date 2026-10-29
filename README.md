# Customer Review Sentiment Analyzer (MERN Stack)

A fast, lightweight, and modern MERN stack web application that automatically analyzes customer review sentiments (Product reviews, Support feedback, App Store ratings, etc.) using in-memory **AFINN lexicon** scoring in Node.js.

---

## 🌟 Key Features

- **Instant AFINN Sentiment Scoring**: Powered by the lightweight `sentiment` npm package (AFINN-165). Synchronous, zero ML dependencies, zero external APIs, runs fully offline.
- **Granular Classification & Badging**: Automatically classifies reviews into **Positive**, **Negative**, or **Neutral** with numeric scores and qualitative summary labels (*"Strongly Positive"*, *"Mildly Negative"*, etc.).
- **Dual Ingestion**:
  - **Single Review Input**: Instant review submission with character counter and instant feedback.
  - **Bulk CSV Ingestion**: Drag-and-drop CSV batch upload capable of processing hundreds of reviews in seconds.
- **Mood Intelligence Dashboard**:
  - Total review metrics, positive/negative/neutral percentages, and average mood score.
  - Proportional sentiment distribution bar with visual breakdowns.
  - Paginated review list with at-a-glance color-coded badges and score meters (green, red, gray).
  - Search by keyword and filter by sentiment category.
  - Sort by **"Most Negative First ⚠️"** to immediately surface critical issues, or **"Most Positive First ⭐"**.
  - One-click sample dataset loader and downloadable CSV template.
- **Modern UI**: Dark glassmorphic design system built with vanilla CSS, modern typography (Outfit & Inter), and micro-animations.

---

## 📂 Project Architecture

```
Minor Project/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   └── reviewController.js   # CRUD, bulk CSV, stats aggregation, seeding
│   ├── models/
│   │   └── Review.js             # Mongoose schema
│   ├── routes/
│   │   └── reviewRoutes.js       # Express route definitions + Multer
│   ├── services/
│   │   └── sentimentService.js   # Isolated AFINN lexicon scoring engine
│   ├── .env                      # Environment variables (PORT, MONGO_URI)
│   ├── package.json
│   └── server.js                 # Express server entry point
├── client/
│   ├── public/
│   │   └── sample_reviews.csv    # Ready-to-use sample dataset
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Header with actions & demo loader
│   │   │   ├── StatsCards.jsx    # Metric cards with glow accents
│   │   │   ├── SentimentBar.jsx  # Proportional mood breakdown
│   │   │   ├── ReviewForm.jsx    # Single + Bulk CSV upload tabs
│   │   │   ├── FilterBar.jsx     # Search, sentiment pills, sorting
│   │   │   ├── ReviewList.jsx    # Reviews container & empty states
│   │   │   ├── ReviewCard.jsx    # Review item with score badges & keywords
│   │   │   ├── SentimentBadge.jsx # Color-coded status badge
│   │   │   └── Pagination.jsx    # Page navigation
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── App.jsx               # Application root
│   │   ├── index.css             # Design tokens & styles
│   │   └── main.jsx              # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd server
npm install
# Set your MONGO_URI in server/.env (Default: mongodb://127.0.0.1:27017/customer_sentiment_db)
npm run dev
```
The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

---

## 🧠 Sentiment Analysis Logic

The scoring engine is isolated in [`sentimentService.js`](file:///server/services/sentimentService.js).

It evaluates text tokens against the AFINN-165 wordlist:
- **Score > 0** ➔ **Positive**
  - Score $\ge 4$: `Strongly Positive`
  - Score $\ge 1$: `Positive`
- **Score < 0** ➔ **Negative**
  - Score between $-1$ and $-3$: `Mildly Negative`
  - Score $\le -4$: `Strongly Negative`
- **Score = 0** ➔ **Neutral**

---

## 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/reviews` | Analyze and save single review (`{ text }`) |
| `POST` | `/api/reviews/bulk` | Ingest CSV file or batch JSON array |
| `GET` | `/api/reviews` | Get paginated reviews (`page`, `limit`, `sentiment`, `search`, `sort`) |
| `GET` | `/api/stats` | Get aggregate sentiment stats & breakdown |
| `DELETE` | `/api/reviews/:id` | Delete a single review |
| `DELETE` | `/api/reviews` | Clear all reviews |
| `POST` | `/api/reviews/seed` | Seed realistic customer review data |
