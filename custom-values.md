# GoHighLevel Custom Values Configuration

This document lists the Custom Values required in GoHighLevel to configure the Quick Qualifier calculators. Create these in **Settings -> Custom Values**.

#### 1. Default Interest Rates
*Used to pre-fill the "Interest Rate" field when a user opens a calculator.*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_rate_conv_30` | Conventional 30-Year Fixed Rate |
| `calc_rate_conv_15` | Conventional 15-Year Fixed Rate |
| `calc_rate_fha_30` | FHA 30-Year Fixed Rate |
| `calc_rate_va_30` | VA 30-Year Fixed Rate |
| `calc_rate_jumbo` | Jumbo Loan Rate |

#### 2. Default Lender Fees & Points
*Standard "Section A" fees that populate the Closing Costs breakdown.*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_fee_origination_pts` | Default Origination Points (Percentage) |
| `calc_fee_admin` | Admin Fee |
| `calc_fee_processing` | Processing Fee |
| `calc_fee_underwriting` | Underwriting Fee |
| `calc_fee_appraisal` | Appraisal Fee Estimate |
| `calc_fee_credit_report` | Credit Report Fee |
| `calc_fee_flood_cert` | Flood Certification Fee |
| `calc_fee_tax_service` | Tax Service Fee |

#### 3. Title & Escrow Estimates
*Non-recurring closing costs (Section C/H).*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_fee_doc_prep` | Document Preparation Fee |
| `calc_fee_settlement` | Escrow / Settlement Fee Estimate |
| `calc_fee_notary` | Notary Fee |
| `calc_fee_recording` | Government Recording Charges |
| `calc_fee_courier` | Courier / Messenger Fee |

#### 4. Prepaids & Reserves
*Defaults for calculating the "Cash to Close".*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_reserves_tax_mo` | Months of Property Tax to collect upfront |
| `calc_reserves_ins_mo` | Months of Hazard Insurance to collect upfront |
| `calc_days_interest` | Default days of prepaid interest to calculate |
| `calc_tax_rate_annual` | Annual Property Tax Rate (% of Purchase Price) |

#### 5. Loan Limits
*Thresholds that trigger warnings or logic changes.*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_limit_conforming` | Standard Conforming Loan Limit |
| `calc_fha_limit` | FHA Loan Limit (Primary County) |

#### 6. App Configuration
*Global settings for reports and footers.*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_company_name` | Company Name |
| `calc_nmls_id` | Company NMLS ID |
| `calc_lo_name` | Default Loan Officer Name |
| `calc_lo_email` | Default Loan Officer Email |
| `calc_lo_phone` | Default Loan Officer Phone Number |
| `calc_lo_address` | Company Physical Address |

