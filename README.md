# Miles Away Prints

Custom location art prints platform. Stadiums, airports, marathons, city streets, and golf courses.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Email:** Resend
- **Fulfillment:** Printful API
- **Hosting:** Vercel
- **Styling:** Tailwind CSS + Poppins font

## Project Structure
```
src/
  app/
    page.tsx              # Homepage
    layout.tsx            # Root layout with metadata
    globals.css           # Global styles + Tailwind
    prints/[type]/        # Dynamic product page (golf, stadium, etc.)
    admin/                # Admin dashboard
      orders/             # Order management
      orders/[id]/        # Single order view
    order/[token]/        # Customer order page (proof review)
    api/
      checkout/           # Stripe checkout session
      webhooks/stripe/    # Stripe webhook handler
      orders/             # Order CRUD
      proofs/             # Proof management
  components/
    Navbar.tsx
    Footer.tsx
    prints/               # SVG preview components per print type
    ui/                   # Reusable UI components
  data/
    prints.ts             # Print type configs, pricing, defaults
  lib/
    supabase.ts           # Supabase client
```

## Setup

### 1. Clone and install
```bash
git clone https://github.com/proviewmedia/milesawayprints.git
cd milesawayprints
npm install
```

### 2. Environment variables
Copy `.env.local` and fill in your keys:
- Supabase URL + keys (already configured)
- Stripe keys
- Resend API key
- Printful API key

### 3. Database setup
Go to Supabase Dashboard > SQL Editor > New Query.
Paste the contents of `supabase-schema.sql` and run it.
This creates all tables, seed data, and security policies.

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 5. Deploy to Vercel
Connect GitHub repo to Vercel. Add environment variables in Vercel dashboard.
Point milesawayprints.com DNS to Vercel.

## Database Tables
- **print_types** - The 5 product categories
- **gallery_items** - Existing designs per print type (shown in gallery)
- **orders** - Customer orders with status tracking
- **proofs** - Design proofs uploaded for customer review
- **messages** - Order-level communication thread
- **reviews** - Customer testimonials

## Key Features
- Template-driven product pages (one component, 5 print types)
- Live preview that updates as customer types
- Stripe checkout (digital + physical)
- Instant download for digital prints
- Customer order page with proof review
- Admin dashboard for order management
- Gift flow with personal messages
- SEO optimized with dynamic metadata
