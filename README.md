# Automate-AI-v3 🏎️🤖
**The AI-Powered Intelligence Layer for Modern Automotive Shops.**

Automate-AI-v3 bridges the gap between legacy Shop Management Systems (SMS) and cutting-edge AI diagnostics. It empowers service writers and technicians with RAG-based insights and automated customer education.

## ✨ Key Features
* **RAG Diagnostic Engine:** Uses Gemini 1.5 Flash and pgvector to provide verified repair solutions based on internal knowledge bases.
* **SMS Integration:** Seamlessly pushes diagnostic data to Mitchell 1, Tekmetric, and Shop-Ware.
* **Smart Video Education:** Automatically curates and ranks YouTube content from authority channels to explain repairs to customers.
* **Multi-Modal Intake:** Supports text, image, and audio (engine noise) analysis.
* **Usage-Based Billing:** Built-in subscription tracking and diagnostic limits for SaaS monetization.

## 🛠️ Tech Stack
* **Framework:** Next.js 14 (App Router)
* **Database:** Supabase (PostgreSQL + pgvector)
* **AI:** Google Gemini (Pro, Flash, and Text-Embedding-004)
* **Styling:** Tailwind CSS + shadcn/ui
* **APIs:** YouTube Data API v3, Mitchell 1/Tekmetric/Shop-Ware Integrations

## 🚀 Getting Started
1. **Database Setup:** Run the SQL migrations found in `/supabase/migrations` to initialize the schema and vector functions.
2. **Environment Variables:** Define `GEMINI_API_KEY`, `YOUTUBE_API_KEY`, and Supabase credentials in `.env.local`.
3. **Seed Knowledge:** Run the `scripts/seed-db.ts` to populate the RAG knowledge base.
4. **Install & Run:** `npm install && npm run dev`

---
*Built for the future of automotive repair.*
