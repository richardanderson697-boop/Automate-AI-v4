# A Full Service Auto - AI Diagnostic Platform v1.0.0

Complete AI-powered auto repair diagnostic platform with RAG enhancement, file uploads, and shop integrations.

## ✅ FEATURES IMPLEMENTED

### AI Diagnostics with RAG
- `lib/rag-service.ts` - Gemini AI with vector embeddings and semantic search
- `scripts/009_create_vector_search_function.sql` - PostgreSQL vector similarity search
- RAG-enhanced diagnosis with repair knowledge base context

### Customer Portal
- `app/customer/request/request-client.tsx` - Diagnostic request form with:
  - Multiple image upload (warning lights, leaks, damaged parts)
  - Audio recording upload (engine noises, squealing sounds)
  - FormData submission to Supabase Storage
- `app/customer/status/[id]/page.tsx` - Real-time diagnostic status tracking
- `components/educational-videos.tsx` - YouTube video integration

### API Routes (10 endpoints)
- `/api/customer-diagnostics` - Submit diagnostic with files, AI analysis, video search
- `/api/diagnostics` - Mechanic diagnostic submission
- `/api/videos` - YouTube educational video search
- `/api/checkout` - POS checkout system
- `/api/inventory` - Parts inventory management
- `/api/integrations/*` - Shop system integrations

### Shop Management
- Dashboard with diagnostics, inventory, POS, work orders, reviews
- Mitchell 1, Tekmetric, Shop-Ware integrations (`lib/integrations/`)
- Multi-tenant with organization-level RLS policies

## ENVIRONMENT VARIABLES NEEDED
- GEMINI_API_KEY - For AI diagnostics
- YOUTUBE_API_KEY - For educational videos
- STRIPE_SECRET_KEY & STRIPE_PUBLISHABLE_KEY - For payments
- Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

## DATABASE SETUP
Run SQL scripts in order:
1. `scripts/001_complete_database_setup.sql`
2. `scripts/007_shop_integrations.sql`
3. `scripts/009_create_vector_search_function.sql`

## DEPLOYMENT
This codebase is ready to deploy to:
- Railway
- Render
- Fly.io
- Fresh Vercel project

Use npm (not pnpm) and Node 20+
