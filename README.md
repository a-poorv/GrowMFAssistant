# 🚀 Groww MF Assistant (RAG Chatbot)

A premium, fintech-grade **Factual Data Assistant** built with Next.js 15+, Tailwind CSS, and the **Groq Llama-3.3-70b** model for precise mutual fund retrieval (RAG).

> [!IMPORTANT]
> **Factual Only Policy**: This assistant is grounded to official documentation and is prohibited from giving investment advice or personalized recommendations.

---

## 🏗️ Project Setup

### 1. Prerequisites
- **Node.js**: 20.x or higher
- **Groq API Key**: [Get one for free at Groq Console](https://console.groq.com/keys)
- **Vercel CLI**: (Optional, for deployment)

### 2. Installation
```bash
git clone https://github.com/a-poorv/GrowMFAssistant.git
cd GrowMFAssistant
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
```

### 4. Running Locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000).

---

## 🎯 Bot Capabilities & Scope

### 🏢 Asset Management Company (AMC)
- **Primary Focus**: [Groww Mutual Fund](https://growwmf.in/)

### 📝 Supported Schemes (Scoped)
The assistant is currently grounded in the documentation for the following funds:
- **Groww Liquid Fund** (Debt)
- **Groww Nifty Total Market Index Fund** (Equity - Index)
- **Groww ELSS Tax Saver Fund** (Equity - ELSS)
- **Groww Large Cap Fund** (Equity - Large Cap)

### 🔍 Fact Retrieval Features
- **NAV Details**: Historical and latest Net Asset Value (static/scraped).
- **Expense Ratios**: Direct Growth plan costs.
- **Lock-in Periods**: Specifics like the 3-year ELSS requirement.
- **Exit Loads**: Tiered structures based on holding duration.
- **Top Holdings**: Major companies/assets within the schemes.

---

## 🚫 Known Limitations & Constraints

1. **No Predictive Data**: It cannot forecast future returns or rank funds.
2. **Advisory Refusal**: Any query asking for "advice," "recommendations," or "comparisons" will trigger an automatic disclaimer.
3. **Data Freshness**: The assistant relies on periodic text-based scraping. For live transaction data, please use [Groww.in](https://groww.in/).
4. **Offline Mode**: The RAG engine (TF-IDF based) caches data locally and does not require an external vector database.

---

## 📄 Documentation Links
- [Factual Knowledge Sources](./SOURCES.md)
- [Sample Q&A Examples](./SAMPLE_QUERIES.md)
- [Technical Architecture](./ARCHITECTURE.md)

---

## ⚖️ Disclaimer
This is for educational and informational purposes only. Mutual Fund investments are subject to market risks, read all scheme-related documents carefully.
