# Quick Qualifier Modernization - Business Logic Specification

## 1. Overview
The system consists of a suite of real estate financing calculators, a client management database, and a configuration admin panel. The core value proposition is enabling loan officers to quickly generate loan scenarios ("qualifiers"), compare options side-by-side, and produce marketing materials (flyers/PDFs) co-branded with real estate agents.

## 2. Calculators

### Common Inputs (All Loan Calculators)
- **Sales Price / Property Value**: Base value for calculations.
- **Down Payment**: Entered as $ amount or % of value.
- **Loan Amount**: Calculated as `Price - Down Payment` (Purchase) or user-entered (Refi).
- **Interest Rate**: Annual interest rate (%).
- **Term**: Loan duration in years (default 30).
- **Loan Fee / Points**: Origination charges as % of Loan Amount.
- **Prepaid Items**:
  - **Property Tax**: Annual amount or monthly estimate.
  - **Hazard Insurance**: Annual amount or monthly estimate.
  - **HOA Dues**: Monthly amount.
  - **Flood/Earthquake Ins**: Monthly amount.

### Common Outputs
- **Principal & Interest (P&I)**: Monthly payment based on standard amortization.
- **Total Monthly Payment**: P&I + Taxes + Insurance + HOA + MI.
- **Closing Costs (CC)**: Sum of recurring (prepaids) and non-recurring (title, escrow, lender fees) costs.
- **Total Cash Required**: Down Payment + Closing Costs - Credits - Deposit.

---

### 2.1 Conventional Purchase (`ConvSale`)
**Specific Logic:**
- **Mortgage Insurance (PMI)**:
  - Calculated based on LTV (Loan-to-Value) and Credit Score tier.
  - **Inputs**: Credit Score Tier (e.g., 760+, 740-759), PMI Rate (user-configurable or lookup).
  - **Calculation**: `(Loan Amount * PMI_Rate) / 12`.
  - **Options**: Monthly PMI, Single Premium (Financed or Cash), Split Premium.
- **Credits**: Seller Credit ($ or %) and Lender Credit ($ or %).

### 2.2 FHA Purchase (`FhaSale`)
**Specific Logic:**
- **Max LTV**: Typically 96.5% (3.5% down).
- **Upfront MIP (UFMIP)**:
  - Standard Rate: 1.75% of Base Loan Amount.
  - Added to the Base Loan Amount to get **Total Loan Amount**.
  - `Total Loan = Base Loan * (1 + UFMIP_Rate)`.
- **Annual MIP (Monthly)**:
  - Rate depends on LTV and Term (e.g., 0.85%, 0.55%).
  - Calculation: `(Base Loan * Annual_MIP_Rate) / 12`.
- **FHA 203k**: Rehabilitation loan flag, may adjust fees/rates.

### 2.3 VA Purchase (`VaSale`)
**Specific Logic:**
- **No Down Payment**: 100% financing allowed.
- **VA Funding Fee (VAFF)**:
  - Depends on **Usage** (First-time vs. Subsequent use).
  - Depends on **Veteran Type** (Regular, Reservist/National Guard).
  - Depends on **Down Payment** tier (<5%, 5-10%, 10%+).
  - **Waived** for Disabled Veterans (Checkbox input).
  - Added to Base Loan Amount.
- **Residual Income**: (Optional calculation often required for VA qualification, though not explicitly prominent in the legacy UI, implied by "Income Calc").

### 2.4 Conventional Refinance (`ConvRefi`)
**Specific Logic:**
- **Purpose**: Rate & Term or Cash Out.
- **Net Tangible Benefit**: Compare `Current P&I` vs. `New P&I`.
- **Payoff Calculation**: `Existing Loan Balance` + `Interest Due` (based on payoff days).
- **Cash to/from Borrower**: `New Loan - Payoff - Closing Costs`.

### 2.5 FHA Refinance (`FhaRefi`)
**Specific Logic:**
- **Streamline (IRRRL)**:
  - Reduced documentation, reduced UFMIP (e.g., 0.55%) and Annual MIP (e.g., 0.55%).
  - No appraisal option.
- **MIP Refund**: If refinancing an existing FHA loan within 3 years, a portion of the old UFMIP is credited.

### 2.6 VA Refinance (`VaRefi`)
**Specific Logic:**
- **IRRRL (Streamline)**: Reduced Funding Fee (typically 0.5%).
- **Cash-Out**: Standard Funding Fee logic applies (First vs Subsequent).
- **Calculation**: `New Loan Amount` includes Funding Fee.

### 2.7 Seller Net Sheet (`SellerNet`)
**Specific Logic:**
- **Goal**: Estimate how much cash the seller walks away with.
- **Formula**: `Sales Price - (Payoff of Existing Liens + Pro-rated Interest + Closing Costs + Commissions + Transfer Taxes + Repairs)`.
- **Prorations**: Property taxes and HOA dues prorated based on closing date.

### 2.8 Comparison Tool (`Compare`)
**Specific Logic:**
- Allows side-by-side input of 3 distinct scenarios (e.g., Option 1: Conv 20% down, Option 2: FHA 3.5% down, Option 3: VA 0% down).
- Displays difference rows: "Payment Difference" and "Cash Difference" relative to Option 1.

---

## 3. Setup & Configuration (`Setup.html`)
The Admin panel sets global defaults used across all calculators.

- **Default Rates**: Preset interest rates for 30yr, 15yr, FHA, VA to pre-fill calculators.
- **Closing Costs (Region Specific)**:
  - **Title & Escrow**: Flat fees or formulas based on loan amount/price.
  - **Recording/Notary**: Flat fees.
  - **Transfer Taxes**: City/County specific rates.
- **Prepaid Defaults**: Default number of months to collect for Tax and Insurance reserves.
- **Loan Limits**: Conforming and High-Balance limits (e.g., $766,550).
- **FHA/VA Factors**: Configurable tables for UFMIP and Annual MIP rates to keep up with guideline changes.
- **User Profile**: Loan Officer Name, Company, License #s, Logo, Contact Info (appears on all reports).

## 4. Data Management

### 4.1 Client Database (`Clients.html`)
- **Storage**: Saves client scenarios (Inputs from calculators).
- **Actions**:
  - Save current scenario.
  - Search/Retrieve client.
  - "Jump" to calculator: Loading a client populates the respective calculator.
- **Security**: Basic password protection for the list.

### 4.2 Agent Marketing (`Agents.html`)
- **Co-Branding**: Store profiles for Real Estate Agents (Name, Photo, Logo, Phone).
- **Selection**: User selects an active agent.
- **Output**: PDF reports and Flyers generate with header/footer containing BOTH the Loan Officer's and the selected Agent's info.