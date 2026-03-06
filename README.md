# Groww MF FAQ Bot (RAG)

A high-context aware chatbot built with Next.js, LangChain.js, and Google Gemini to answer questions about Groww Mutual Funds.

## 🚀 Features
- **RAG (Retrieval-Augmented Generation)**: Answers questions based on real-time data from 3 Groww MF schemes.
- **Premium UI**: Clean, mobile-responsive chat interface with Groww branding.
- **Context Awareness**: Accurately retrieves details like Expense Ratio, Exit Load, and Risk levels.

## 🛠 Setup

### 1. Prerequisites
- Node.js 18+ installed.
- A **Google Generative AI API Key** (Gemini).

### 2. Configuration
Create a `.env.local` file in the root directory (if not already present) and add your API key:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
```

### 3. Installation
```bash
npm install --legacy-peer-deps
```

### 4. Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure
- `data/raw/`: Contains the scraped text files for the funds.
- `src/app/api/chat/`: The main RAG logic and LLM interaction.
- `src/lib/rag-utils.ts`: Utility for chunking and vector storage (Memory-based).
- `src/app/page.tsx`: The main chat interface.

## 📝 Data Source
Information for the following funds is included:
- Groww Nifty Total Market Index Fund
- Groww ELSS Tax Saver Fund
- Groww Liquid Fund
