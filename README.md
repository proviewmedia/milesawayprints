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

First-time setup: paste the contents of `supabase-schema.sql` and run it.
This creates all tables, seed data, and security policies.

**If you already ran the base schema**, run the shop migration next:
`supabase-migration-001-shop.sql` — adds slug/description/tags to
gallery_items and seeds 4 starter collections.

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
- Storefront (`/shop`) — browse all designs with filters, search, sort, collections, Quick Shop modal
- Design detail pages (`/shop/[slug]`) — buy ready-made, with related designs
- Custom create flow (`/prints/[type]`) — live preview that updates as customer types
- Cart with localStorage persistence + slide-over drawer
- Checkout stub + order confirmation + customer order page with status timeline
- Admin dashboard with order list, status filters, and fulfillment workflow
- Gift flow with personal messages
- SEO optimized with dynamic metadata per print type and per design

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Homepage — hero, featured designs, how it works, gifts, reviews |
| `/shop` | Browse all designs: filter, search, sort, collections |
| `/shop/[slug]` | Individual design detail — buy ready-made |
| `/prints/[type]` | Custom create flow for a print category |
| `/checkout` | Checkout form (Stripe integration pending) |
| `/checkout/success` | Order confirmation |
| `/order/[token]` | Customer order status + proof review |
| `/admin` | Admin dashboard (auth not yet wired) |
| `/api/checkout` | POST — creates order (stub until Stripe keys added) |

## Printful

Currently on **manual fulfillment workflow**. See `docs/PRINTFUL.md` for the
current workflow and future API-integration plan.
