# FintechAssist: Technical Architecture & Implementation Phases

This document provides a comprehensive technical breakdown of the **Mutual Fund Facts Assistant**, detailing the implementation from the UI layer to the core RAG logic.

---

## Phase 1: Premium Frontend & UX (The "Interface")
The frontend is designed to be a high-performance, fintech-grade single-page application (SPA) focused on clarity and trust.

*   **Technology Stack**: Next.js 15+ (App Router), Tailwind CSS, Lucide Icons, and Google Inter Typography.
*   **Design System**: Minimalist Groww-inspired aesthetic using a custom color palette (Groww Green `#00d09c`, Soft Gray `#f7f9fb`).
*   **Key UI/UX Features**:
    *   **Unified Shadow System**: Uses custom `modern-shadow` classes for physical depth.
    *   **Smart State Clearing**: To prevent user confusion, the UI immediately clears previous responses when a new suggestion is clicked or when the user starts typing a new query.
    *   **Skeleton Loading**: Custom animated pulse-loaders provide instant feedback during retrieval.
    *   **Interactive Suggestion Chips**: Pill-shaped components with hover-lift effects for common inquiries.
    *   **Responsive Layout**: Optimized for both desktop and mobile, ensuring the input box and results remain centered and legible.

---

## Phase 2: Middle-Layer & Retrieval (The "Knowledge Engine")
Instead of a heavy vector database, the project uses a custom-built, lightweight **Lexical RAG Engine** for maximum precision.

*   **File-Based Knowledge Base**: Facts are stored as structured `.txt` files in `data/raw/`. No external database is used for storing fund records.
*   **RAG Utilities (`rag-utils.ts`)**:
    *   **Chunking Strategy**: Content is split into logical sections (FAQs/Paragraphs) to ensure the LLM receives only specific, high-density facts.
    *   **Synonym & Alias Mapping**: A custom financial dictionary (e.g., `SIP -> Systematic Investment Plan`, `Tax Saver -> ELSS`) allows the system to understand user intent without complex embeddings.
    *   **TF (Term Frequency) Scoring**: Each chunk is scored based on keyword frequency and relevance to the user's expanded query terms.
    *   **In-Memory Caching**: Chunks are cached in memory after the first read to ensure sub-millisecond retrieval speeds.

---

## Phase 3: Backend API & AI Logic (The "Processor")
The backend is integrated directly into Next.js using **Serverless API Routes**, ensuring that all sensitive data and API keys remain hidden from the browser.

*   **Serverless Endpoints**:
    *   `/api/ask`: The main entry point for queries, handling the entire decision tree from classification to generation.
*   **Multi-Step AI Pipeline**:
    1.  **Classification Layer**: Uses **Groq Llama-3.3-70b** to detect if a query is `FACTUAL` (Price, NAV, Lock-in) or `ADVISORY` (Recommendations, Opinions).
    2.  **Constraint Enforcement**: If `ADVISORY`, the system returns a fixed disclaimer and AMFI education links, preventing unauthorized financial advice.
    3.  **Grounded Generation**: For factual queries, the LLM is provided only with the retrieved chunks. Strict system prompts force the model to say "I don't know" if the answer isn't in the provided context.
*   **Security & Environment**:
    *   **Secrets Management**: Uses `.env.local` for secure Groq API key storage.
    *   **Internal Logging**: A local `chat_internal.log` tracks all system decisions, error rates, and document sources for auditing purposes.

---

## Architectural Principles
*   **No DB Overhead**: By avoiding a vector database (Pinecone/Chroma), the system is extremely portable and can be updated by simply adding a text file.
*   **Zero-Hallucination Policy**: By using strict "Grounded RAG," the AI is prohibited from using its general training data to answer specific fund questions.
*   **Citation First**: Every factual answer is automatically mapped to its official document source and verified Groww.in URL.

## Compliance & Safety Constraints
To ensure fintech-grade trust and safety, the following rules are strictly enforced:

*   **Public Sources Only**: All facts are extracted exclusively from official Groww.in product pages. No internal screenshots or third-party blogs are used.
*   **Zero PII Collection**: The system is stateless and does not collect or process sensitive user data such as PAN, Aadhaar, account numbers, or contacts.
*   **No Performance Predictions**: The assistant provides historical inception returns but is prohibited from comparing funds or predicting future performance.
*   **Advisory Refusal**: Any query classified as advisory or recommendation-seeking triggers an immediate refusal with links to official educational resources.

---
*Last Technical Audit: March 2026*
