# Quick Qualifier

A modern mortgage calculator application built with Next.js, designed to help loan officers quickly qualify clients for various loan programs.

## Features

- **Purchase Calculators**: Conventional, FHA, and VA loan calculations
- **Refinance Calculators**: Rate & Term, Cash-Out, Streamline (IRRRL) options
- **Seller Net Sheet**: Estimate seller proceeds after costs
- **Comparison View**: Compare up to 3 scenarios side-by-side
- **PDF Reports**: Generate marketing flyers and detailed breakdowns
- **Partner Agent Co-Branding**: Include real estate agent info on outputs
- **Internationalization**: English and Spanish support

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Validation**: Zod
- **PDF Generation**: @react-pdf/renderer
- **Backend/CRM**: GoHighLevel API
- **Deployment**: Coolify (Dockerized)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```env
GHL_API_KEY=your_gohighlevel_api_key
GHL_LOCATION_ID=your_location_id
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Testing

```bash
pnpm test
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
├── components/       # React components
├── lib/
│   ├── engines/      # Calculator logic (TypeScript)
│   ├── schemas.ts    # Zod validation schemas
│   └── sanitize.ts   # Input sanitization utilities
└── stores/           # Zustand state stores
```

## Documentation

See [PRD.md](./PRD.md) for full product requirements.
