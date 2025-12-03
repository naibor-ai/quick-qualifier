# Product Requirements Document (PRD): Quick Qualifier Modernization

## 1. Overview
Modernize the legacy "Quick Qualifier" mortgage calculator application. The new system will be a Next.js web application that serves as the frontend calculator engine, while GoHighLevel (GHL) acts as the backend for configuration, client data storage, and partner agent management.

## 2. Technical Stack
-   **Framework**: Next.js 14+ (App Router).
-   **Language**: TypeScript.
-   **Styling**: Tailwind CSS.
-   **Package Manager**: pnpm.
-   **State Management**: Zustand.
-   **Validation**: Zod (Shared schemas in `/lib/schemas.ts`).
-   **Backend Logic**: Next.js API Routes (for external API extensibility).
-   **PDF Generation**: `@react-pdf/renderer`.
-   **Database/CRM**: GoHighLevel API (Location API Key).
-   **Deployment**: Coolify (Dockerized).

## 3. Functional Requirements

### 3.1. Calculator Engines
Port legacy logic (`JScript.js`) to TypeScript for the following loan types:

#### Purchase Calculators
1.  **Conventional Purchase**
    -   Inputs: Purchase Price, Down Payment (Amt/% of Price), Interest Rate, Term (Years).
    -   Outputs: P&I, PMI (based on LTV), Tax, Insurance, HOA -> Total Monthly Payment.
2.  **FHA Purchase**
    -   Specifics: UFMIP (Upfront Mortgage Insurance Premium) calculation + Monthly MIP.
3.  **VA Purchase**
    -   Specifics: VA Funding Fee (added to loan amount), no monthly PMI.

#### Refinance Calculators
4.  **Conventional Refinance**
    -   Purpose: Rate & Term or Cash Out.
    -   Net Tangible Benefit comparison (Current P&I vs. New P&I).
5.  **FHA Refinance**
    -   Streamline (IRRRL) with reduced UFMIP/MIP rates.
    -   MIP Refund calculation for existing FHA loans.
6.  **VA Refinance**
    -   IRRRL (Streamline) with reduced Funding Fee.
    -   Cash-Out with standard Funding Fee logic.

#### Other Tools
7.  **Seller Net Sheet**
    -   Estimate seller proceeds after payoffs, commissions, and closing costs.
8.  **Comparison View**
    -   Compare up to 3 scenarios side-by-side with difference calculations.

### 3.2. Data Persistence (GHL Integration)
-   **Global Config**:
    -   Fetch default interest rates and fees from GHL Custom Values on app load (via `/api/config`).
    -   *Source*: `custom-values.md` lists all required keys (e.g., `calc_rate_conv_30`, `calc_fee_admin`).
    -   **Input Sanitization**: All values from GHL Custom Values must be sanitized and validated using Zod schemas before use. Handle malformed inputs gracefully (trim whitespace, parse currency symbols, convert string numbers).
-   **Save Client**:
    -   Upsert GHL Contact based on Email/Phone (via `/api/clients/save`).
    -   Save current calculator state (full JSON) into a custom field `Calculator State JSON`.
    -   Update specific custom fields for searchability (`Loan Amount`, `Sales Price`, etc.).
-   **Load Client**:
    -   Search GHL Contact by Email/Name (via `/api/clients/load`).
    -   Retrieve and parse `Calculator State JSON` to restore UI state.

### 3.3. Partner Agent Marketing
-   **Agent Selector**:
    -   Fetch GHL Contacts tagged with `#partner-agent`.
    -   Display Agent Name, Headshot, and Logo.
-   **Co-Branding**:
    -   Selected agent's info appears on the UI and generated PDFs.

### 3.4. Output Generation
-   **PDF Reports**:
    -   "Flyer" layout: High-level marketing summary.
    -   "Detailed Report": Full granular breakdown including:
        -   Section A (Lender Fees): Origination, Admin, Processing, Underwriting, Appraisal, Credit Report, Flood Cert, Tax Service.
        -   Section B (Third-Party Fees): Title, Escrow, Notary, Recording, Courier.
        -   Section C (Prepaids): Prepaid Interest, Tax Reserves, Insurance Reserves.
        -   Section D (Credits): Seller Credit, Lender Credit.
    -   Include Loan Officer info (from Env/Config) and Co-Branded Agent info.

### 3.5. Internationalization (i18n)
-   **Supported Languages**: English (default), Spanish (initial), with architecture to add more.
-   **Language Switcher**: UI toggle in the header/settings to switch languages.
-   **Scope**: All UI labels, form fields, error messages, PDF report text.
-   **Implementation**: Use `next-intl` for Next.js App Router integration.
-   **Currency/Number Formatting**: Locale-aware formatting for all monetary values.

## 4. Data Models & Schemas

### 4.1. GHL Custom Values Map
| Key | Type | Description |
| :--- | :--- | :--- |
| `calc_rate_conv_30` | Number | Default Interest Rate |
| `calc_fee_admin` | Number | Admin Fee |
| `calc_tax_rate_annual` | Number | Property Tax Rate (%) |
*(See `custom-values.md` for full list)*

### 4.2. GHL Contact Custom Fields
-   `Loan Amount` (Monetary)
-   `Sales Price` (Monetary)
-   `Interest Rate` (Numerical)
-   `Loan Program` (Dropdown)
-   `Credit Score Tier` (Dropdown)
-   `Calculator State JSON` (Large Text)

## 5. Environment & Auth
-   **Authentication**:
    -   App access: Public (or embedded).
    -   Admin/LO functions: Authenticated via GHL interface (the app itself is the tool used inside GHL).
    -   API Auth: Location API Key stored in `.env`.
-   **Env Variables**:
    -   `GHL_API_KEY`: Location-level API Key.
    -   `GHL_LOCATION_ID`: (If needed for specific endpoints).
    -   `NEXT_PUBLIC_LO_INFO`: (Fallback if not using GHL Custom Values for LO info).

## 6. Development Guidelines
1.  **Zod Schemas**: Define strict schemas in `/lib/schemas.ts` for all calculator inputs. Use these for both form validation, GHL payload construction, and input sanitization. Export TypeScript types derived from schemas (single source of truth).
2.  **Form Handling**: Use React Hook Form with Zod resolver for all calculator forms.
3.  **API Routes**: Isolate GHL API calls in `/app/api`. Do not expose API Keys to the client. Ensure robust error handling and status codes. **No mock data** - always use live GHL API.
4.  **Input Sanitization**: Create sanitization utilities in `/lib/sanitize.ts` to clean GHL Custom Values (handle "$1,000" → 1000, "6.5%" → 6.5, trim whitespace, etc.).
5.  **Components**: Use functional components. Keep calculator logic ("Engines") separate from UI rendering.
6.  **Testing**: Unit tests (Vitest) required for all calculation engines. Test against known loan scenarios.
7.  **i18n**: All user-facing strings must use translation keys. No hardcoded English text in components.
8.  **Docker**: Ensure `Dockerfile` is optimized for Next.js standalone output for Coolify deployment.
9.  **Package Management**: Use `pnpm` for all dependency management.

