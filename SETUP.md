# Automate AI v4 - Setup Guide

## Overview
AI-powered auto repair management platform with RAG-enhanced diagnostics, customer portal, and shop management dashboard.

## Features Enabled

### 1. RAG-Powered AI Diagnostics
- Uses Google Gemini AI with Retrieval Augmented Generation
- Vector similarity search for accurate repair recommendations
- Knowledge base with 15+ automotive repair scenarios

### 2. Customer Diagnostic Portal
- Photo upload support (multiple images)
- Audio recording upload for engine noises
- AI analysis with cost estimates
- Educational YouTube videos (optional)

### 3. Shop Management Dashboard
- Work order management
- Customer diagnostic requests
- Inventory tracking
- POS system
- Reviews management
- Integration with Mitchell 1, Tekmetric, Shop-Ware

## Database Setup

The database has been initialized with these tables:
- `user_profiles` - User accounts and roles
- `shops` - Auto shop information
- `repair_knowledge` - RAG knowledge base with vector embeddings
- `customer_diagnostic_requests` - Customer submissions with photo/audio
- `work_orders` - Shop work order management
- `inventory_items` - Parts inventory
- `pos_transactions` - Point of sale records
- `reviews` - Customer reviews
- `shop_integrations` - External system connections

## Required Environment Variables

### Already Configured
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase integration
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase integration
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase integration

### You Need to Add
1. **GEMINI_API_KEY** (Required)
   - Get from: https://aistudio.google.com/app/apikey
   - Used for AI diagnostics and RAG embeddings
   - Add via the "Vars" section in v0 sidebar

2. **YOUTUBE_API_KEY** (Optional)
   - Get from: https://console.cloud.google.com/apis/credentials
   - Enable YouTube Data API v3
   - Used for educational video recommendations
   - If not provided, video feature will be gracefully disabled

## Next Steps

### 1. Seed the Knowledge Base
The RAG system needs automotive repair knowledge to work effectively:

```bash
# Set environment variables first
export GEMINI_API_KEY="your_key_here"
export NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Run the seed script
npx tsx scripts/seed_repair_knowledge.ts
```

This populates the `repair_knowledge` table with:
- 15 common automotive repair scenarios
- Vector embeddings for RAG retrieval
- Categories: drivetrain, brakes, electrical, engine, transmission, cooling, etc.

### 2. Create a Shop Account
1. Sign up at `/dashboard` (creates shop owner account)
2. Complete shop profile setup
3. Configure shop integrations if needed

### 3. Test Customer Portal
1. Visit `/customer`
2. Submit a diagnostic request with:
   - Vehicle information
   - Problem description
   - Photos of the issue
   - Audio recording of noises
3. View AI diagnosis and recommendations

### 4. Test Shop Dashboard
1. Log in to `/dashboard`
2. View customer diagnostic requests
3. Create work orders from diagnostics
4. Manage inventory and POS

## File Upload Configuration

Supabase Storage bucket `diagnostic-media` has been created with:
- Public access for reading
- Authenticated upload access
- Folders: `images/` and `audio/`

## RAG System Details

### How It Works
1. Customer describes problem
2. System generates embedding of symptoms using Gemini
3. Vector similarity search finds relevant repair knowledge
4. AI generates diagnosis using both symptoms and retrieved knowledge
5. Returns diagnosis, recommended parts, cost estimate, and confidence level

### Knowledge Categories
- `drivetrain` - CV joints, driveshafts, axles
- `brakes` - Pads, rotors, calipers, brake systems
- `electrical` - Alternators, batteries, starters, sensors
- `engine` - Misfires, timing, compression issues
- `transmission` - Slipping, shifting problems
- `cooling` - Overheating, coolant leaks
- `suspension` - Struts, shocks, control arms
- `emissions` - O2 sensors, catalytic converters
- `steering` - Power steering, rack and pinion
- `hvac` - Air conditioning, heating
- `wheels` - Bearings, TPMS, alignment
- `fuel` - Fuel pumps, injectors, filters

## YouTube Video Feature

When enabled (with YOUTUBE_API_KEY), the system:
1. Searches for relevant educational videos based on diagnosis
2. Ranks videos by authority, relevance, and recency
3. Categorizes into: Symptom Explanation, Repair Walkthrough, Cost Breakdown, Prevention
4. Displays top videos to customers

Trusted channels prioritized:
- ChrisFix
- Scotty Kilmer  
- Engineering Explained
- 1A Auto
- South Main Auto Repair
- And more...

## API Endpoints

### Customer APIs
- `POST /api/customer-diagnostics` - Submit diagnostic request with files
- `GET /api/customer-diagnostics/[id]` - Get request status

### Video API (Optional)
- `POST /api/videos` - Search educational videos
- Returns categorized video recommendations

## Troubleshooting

### AI Diagnosis Not Working
1. Check GEMINI_API_KEY is set correctly
2. Verify knowledge base is seeded
3. Check Supabase connection
4. Look for errors in console logs (search for `[v0]` or `[v0 RAG]`)

### File Uploads Failing
1. Verify Supabase Storage is enabled
2. Check `diagnostic-media` bucket exists
3. Verify bucket policies allow public read and authenticated upload

### YouTube Videos Not Showing
- This is expected if YOUTUBE_API_KEY is not set
- Feature gracefully degrades
- Add API key to enable feature

### Database Errors
1. Ensure all migrations ran successfully
2. Check Row Level Security policies
3. Verify user authentication is working

## Architecture Notes

- **Next.js 16** with App Router
- **React 19** with Server Components
- **Supabase** for database, auth, and storage
- **Google Gemini AI** for diagnostics and embeddings
- **Vector similarity search** using pgvector extension
- **shadcn/ui** for components
- **Tailwind CSS** for styling

## Support

For issues or questions:
1. Check console logs for `[v0]` debug messages
2. Verify environment variables are set
3. Ensure database migrations completed
4. Check Supabase dashboard for data
