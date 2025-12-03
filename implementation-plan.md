# Implementation Plan: Quick Qualifier Modernization

## 1. Architecture Overview

The system replaces the legacy ASP.NET/HTML/JS stack with a modern **Next.js** application for the frontend and business logic, while leveraging **GoHighLevel (GHL)** as the backend for data persistence (CRM, Configuration, Partners).

```mermaid
graph TD
    User[Loan Officer] --> NextJS[Next.js App]
    
    subgraph "Next.js (Coolify/Docker)"
        UI[React UI Components]
        CalcEngine[Calculator Logic (API Routes)]
        PDFGen[PDF Generator Service]
    end
    
    subgraph "GoHighLevel (GHL)"
        Contacts[Contacts API]
        CustomFields[Custom Fields]
        CustomValues[Custom Values (Global Config)]
        Media[Media Library (Images)]
    end
    
    NextJS -->|Fetch Rates/Config| CustomValues
    NextJS -->|Save/Load Clients| Contacts
    NextJS -->|Get Agent Info| Contacts
    
    UI -->|Inputs| CalcEngine
    CalcEngine -->|Results| UI
    UI -->|Generate Report| PDFGen
```

## 2. Tech Stack

-   **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS.
-   **Backend Logic**: Next.js API Routes (Serverless Functions) - *Chosen for future API extensibility*.
-   **Database/CRM**: GoHighLevel (via API) - **No mock data, always live API**.
-   **PDF Generation**: `@react-pdf/renderer`.
-   **State Management**: Zustand (for calculator state).
-   **Form Handling**: React Hook Form + Zod resolver (validation with shared schemas).
-   **i18n**: `next-intl` for internationalization (English + Spanish initially).
-   **Testing**: Vitest for unit tests on calculation engines.
-   **Package Manager**: pnpm.

## 3. Data Mapping Strategy (GoHighLevel)

### A. Client Database (`Clients.html`) → GHL Contacts
Each "Saved Client" maps to a **Contact** in GHL.
-   **Unique Identifier**: Email or Phone.
-   **Custom Fields**: Create a Folder "Mortgage Calculator Data".
    -   `Loan Amount` (Monetary)
    -   `Sales Price` (Monetary)
    -   `Interest Rate` (Numerical)
    -   `Loan Program` (Dropdown: Conv, FHA, VA, USDA)
    -   `Credit Score Tier` (Dropdown)
    -   `Calculator State JSON` (Large Text Area) - Stores the full UI state for perfect reloading.

### B. Setup & Configuration (`Setup.html`) → GHL Custom Values
Use **Custom Values** for global defaults managed by the Loan Officer.
-   `DEFAULT_RATE_CONV_30`
-   `DEFAULT_RATE_FHA_30`
-   `DEFAULT_ADMIN_FEE`
-   `DEFAULT_TAX_RATE` (Annual %)

### C. Agent Marketing (`Agents.html`) → GHL Contacts (Tagged)
-   **Identifier**: Tag contacts with `#partner-agent`.
-   **Assets**: Store Headshot URL and Logo URL in Custom Fields (hosted in GHL Media Library).

## 4. Implementation Phases

### Phase 1: Calculator Engine & Core UI (Next.js)
*Focus: Porting the business logic and creating the visual interface.*

1.  **Project Setup**: Initialize Next.js with TypeScript, Tailwind, and configure:
    -   `next-intl` for i18n (English + Spanish).
    -   Vitest for unit testing.
    -   React Hook Form + Zod resolver.
2.  **Logic Porting**: Refactor legacy JS (`JScript.js`) into pure TypeScript modules.
    -   `/lib/calculations/conventional.ts` (Purchase + Refinance)
    -   `/lib/calculations/fha.ts` (Purchase + Refinance)
    -   `/lib/calculations/va.ts` (Purchase + Refinance)
    -   `/lib/calculations/seller-net.ts`
    -   `/lib/calculations/comparison.ts`
3.  **Schemas & Sanitization**:
    -   `/lib/schemas.ts` - Zod schemas for all inputs (single source of truth for types).
    -   `/lib/sanitize.ts` - Utilities to clean GHL Custom Values (parse "$1,000" → 1000, "6.5%" → 6.5, trim whitespace, handle nulls).
4.  **Unit Tests**: Write Vitest tests for each calculation engine against known loan scenarios.
5.  **Component Library**: Build reusable UI components.
    -   `InputGroup` (Label, Input, Helper Text) - with i18n labels.
    -   `ResultCard` (Monthly Payment breakdown).
    -   `ComparisonTable` (Side-by-side view for 3 scenarios).
    -   `LanguageSwitcher` (Toggle between EN/ES).
6.  **Pages**: Implement the calculator pages:
    -   `/calculators/conventional` (Purchase)
    -   `/calculators/conventional-refi`
    -   `/calculators/fha` (Purchase)
    -   `/calculators/fha-refi`
    -   `/calculators/va` (Purchase)
    -   `/calculators/va-refi`
    -   `/calculators/seller-net`
    -   `/calculators/compare`

### Phase 2: GHL Integration (Backend)
*Focus: Connecting the "Save" and "Load" buttons to real data. No mock data - always live GHL API.*

1.  **GHL Client Helper**: Create `/lib/ghl-client.ts` to handle API Key authentication and requests.
2.  **Configuration Sync**:
    -   Build an API route `/api/config` that fetches Custom Values from GHL.
    -   **Sanitize all incoming values** using `/lib/sanitize.ts` before returning to client.
    -   Use this to pre-fill default rates on App Load.
3.  **Client Persistence**:
    -   **Save**: Implement `/api/clients/save`. Upsert GHL Contact with `Calculator State JSON`.
    -   **Load**: Implement `/api/clients/load`. Search GHL by email/name and retrieve the state blob.

### Phase 3: Co-Branding & PDF Generation
*Focus: Marketing outputs.*

1.  **Agent Selector**:
    -   Create a component that fetches GHL contacts with tag `#partner-agent`.
    -   Allow user to select an active agent for the session.
2.  **PDF Templates**:
    -   Use `@react-pdf/renderer` to design the Flyer and Report layouts.
    -   **Detailed Report** includes full granular breakdown:
        -   Section A (Lender Fees): Origination, Admin, Processing, Underwriting, Appraisal, Credit Report, Flood Cert, Tax Service.
        -   Section B (Third-Party): Title, Escrow, Notary, Recording, Courier.
        -   Section C (Prepaids): Interest, Tax Reserves, Insurance Reserves.
        -   Section D (Credits): Seller Credit, Lender Credit.
    -   Dynamically inject Loan Officer info (from env/config) and Partner Agent info.
    -   **i18n Support**: PDF templates must support English and Spanish based on user selection.
3.  **Generate**: Add "Download PDF" and "Email PDF" buttons.

## 5. Project Structure

```
/app
  /[locale]             # i18n route grouping (en, es)
    /layout.tsx         # Locale-aware layout
    /page.tsx           # Home/Dashboard
    /calculators
      /conventional
        /page.tsx       # Conventional Purchase
      /conventional-refi
        /page.tsx
      /fha
        /page.tsx       # FHA Purchase
      /fha-refi
        /page.tsx
      /va
        /page.tsx       # VA Purchase
      /va-refi
        /page.tsx
      /seller-net
        /page.tsx
      /compare
        /page.tsx
  /api
    /config
      route.ts          # GET: Fetch global config (sanitized)
    /clients
      /save
        route.ts        # POST: Save client state
      /load
        route.ts        # GET: Load client state
    /agents
      route.ts          # GET: Fetch partner agents
/components
  /calculators
    ConvPurchaseForm.tsx
    ConvRefiForm.tsx
    FhaPurchaseForm.tsx
    FhaRefiForm.tsx
    VaPurchaseForm.tsx
    VaRefiForm.tsx
    SellerNetForm.tsx
    ComparisonForm.tsx
  /shared
    InputGroup.tsx
    ResultSummary.tsx
    AgentSelector.tsx
    LanguageSwitcher.tsx
/lib
  /calculations         # Pure functions for math
    conventional.ts     # Purchase + Refi
    fha.ts              # Purchase + Refi
    va.ts               # Purchase + Refi
    seller-net.ts
    comparison.ts
    common.ts           # Shared utilities (P&I, LTV, etc.)
  ghl-client.ts         # GHL API Helper
  schemas.ts            # Zod schemas + derived TypeScript types
  sanitize.ts           # Input sanitization utilities
/messages
  en.json               # English translations
  es.json               # Spanish translations
/__tests__
  /calculations         # Unit tests for calculation engines
    conventional.test.ts
    fha.test.ts
    va.test.ts
    seller-net.test.ts
```

