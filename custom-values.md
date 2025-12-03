# GoHighLevel Custom Values Configuration

This document lists the Custom Values required in GoHighLevel to configure the Quick Qualifier calculators. I created these in **Settings -> Custom Values**.

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
| `calc_limit_high_balance` | High Balance Conforming Loan Limit |
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

---

### New Missing Values (From Legacy Setup)

#### 7. Conventional MI Factors - Standard Balance (≤ $650k)
*Naming Convention:* `calc_mi_std_{type}_{ltv}_{fico}`
*Type:* `mo` (Monthly) or `sg` (Single Premium)
*FICO Tiers:* 760 (760+), 740, 720, 700, 680, 660, 640, 620.

**Monthly Factors (`mo`)**
| LTV | 760+ | 740-759 | 720-739 | 700-719 | 680-699 | 660-679 | 640-659 | 620-639 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **97%** | `calc_mi_std_mo_97_760` | `calc_mi_std_mo_97_740` | `calc_mi_std_mo_97_720` | `calc_mi_std_mo_97_700` | `calc_mi_std_mo_97_680` | `calc_mi_std_mo_97_660` | `calc_mi_std_mo_97_640` | `calc_mi_std_mo_97_620` |
| **95%** | `calc_mi_std_mo_95_760` | `calc_mi_std_mo_95_740` | `calc_mi_std_mo_95_720` | `calc_mi_std_mo_95_700` | `calc_mi_std_mo_95_680` | `calc_mi_std_mo_95_660` | `calc_mi_std_mo_95_640` | `calc_mi_std_mo_95_620` |
| **90%** | `calc_mi_std_mo_90_760` | `calc_mi_std_mo_90_740` | `calc_mi_std_mo_90_720` | `calc_mi_std_mo_90_700` | `calc_mi_std_mo_90_680` | `calc_mi_std_mo_90_660` | `calc_mi_std_mo_90_640` | `calc_mi_std_mo_90_620` |
| **85%** | `calc_mi_std_mo_85_760` | `calc_mi_std_mo_85_740` | `calc_mi_std_mo_85_720` | `calc_mi_std_mo_85_700` | `calc_mi_std_mo_85_680` | `calc_mi_std_mo_85_660` | `calc_mi_std_mo_85_640` | `calc_mi_std_mo_85_620` |

**Single Premium Factors (`sg`)**
| LTV | 760+ | 740-759 | 720-739 | 700-719 | 680-699 | 660-679 | 640-659 | 620-639 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **97%** | `calc_mi_std_sg_97_760` | `calc_mi_std_sg_97_740` | `calc_mi_std_sg_97_720` | `calc_mi_std_sg_97_700` | `calc_mi_std_sg_97_680` | `calc_mi_std_sg_97_660` | `calc_mi_std_sg_97_640` | `calc_mi_std_sg_97_620` |
| **95%** | `calc_mi_std_sg_95_760` | `calc_mi_std_sg_95_740` | `calc_mi_std_sg_95_720` | `calc_mi_std_sg_95_700` | `calc_mi_std_sg_95_680` | `calc_mi_std_sg_95_660` | `calc_mi_std_sg_95_640` | `calc_mi_std_sg_95_620` |
| **90%** | `calc_mi_std_sg_90_760` | `calc_mi_std_sg_90_740` | `calc_mi_std_sg_90_720` | `calc_mi_std_sg_90_700` | `calc_mi_std_sg_90_680` | `calc_mi_std_sg_90_660` | `calc_mi_std_sg_90_640` | `calc_mi_std_sg_90_620` |
| **85%** | `calc_mi_std_sg_85_760` | `calc_mi_std_sg_85_740` | `calc_mi_std_sg_85_720` | `calc_mi_std_sg_85_700` | `calc_mi_std_sg_85_680` | `calc_mi_std_sg_85_660` | `calc_mi_std_sg_85_640` | `calc_mi_std_sg_85_620` |

#### 8. Conventional MI Factors - High Balance (> $650k)
*Naming Convention:* `calc_mi_hb_{type}_{ltv}_{fico}`

**Monthly Factors (`mo`)**
| LTV | 760+ | 740-759 | 720-739 | 700-719 | 680-699 | 660-679 | 640-659 | 620-639 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **97%** | `calc_mi_hb_mo_97_760` | `calc_mi_hb_mo_97_740` | `calc_mi_hb_mo_97_720` | `calc_mi_hb_mo_97_700` | `calc_mi_hb_mo_97_680` | `calc_mi_hb_mo_97_660` | `calc_mi_hb_mo_97_640` | `calc_mi_hb_mo_97_620` |
| **95%** | `calc_mi_hb_mo_95_760` | `calc_mi_hb_mo_95_740` | `calc_mi_hb_mo_95_720` | `calc_mi_hb_mo_95_700` | `calc_mi_hb_mo_95_680` | `calc_mi_hb_mo_95_660` | `calc_mi_hb_mo_95_640` | `calc_mi_hb_mo_95_620` |
| **90%** | `calc_mi_hb_mo_90_760` | `calc_mi_hb_mo_90_740` | `calc_mi_hb_mo_90_720` | `calc_mi_hb_mo_90_700` | `calc_mi_hb_mo_90_680` | `calc_mi_hb_mo_90_660` | `calc_mi_hb_mo_90_640` | `calc_mi_hb_mo_90_620` |
| **85%** | `calc_mi_hb_mo_85_760` | `calc_mi_hb_mo_85_740` | `calc_mi_hb_mo_85_720` | `calc_mi_hb_mo_85_700` | `calc_mi_hb_mo_85_680` | `calc_mi_hb_mo_85_660` | `calc_mi_hb_mo_85_640` | `calc_mi_hb_mo_85_620` |

**Single Premium Factors (`sg`)**
| LTV | 760+ | 740-759 | 720-739 | 700-719 | 680-699 | 660-679 | 640-659 | 620-639 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **97%** | `calc_mi_hb_sg_97_760` | `calc_mi_hb_sg_97_740` | `calc_mi_hb_sg_97_720` | `calc_mi_hb_sg_97_700` | `calc_mi_hb_sg_97_680` | `calc_mi_hb_sg_97_660` | `calc_mi_hb_sg_97_640` | `calc_mi_hb_sg_97_620` |
| **95%** | `calc_mi_hb_sg_95_760` | `calc_mi_hb_sg_95_740` | `calc_mi_hb_sg_95_720` | `calc_mi_hb_sg_95_700` | `calc_mi_hb_sg_95_680` | `calc_mi_hb_sg_95_660` | `calc_mi_hb_sg_95_640` | `calc_mi_hb_sg_95_620` |
| **90%** | `calc_mi_hb_sg_90_760` | `calc_mi_hb_sg_90_740` | `calc_mi_hb_sg_90_720` | `calc_mi_hb_sg_90_700` | `calc_mi_hb_sg_90_680` | `calc_mi_hb_sg_90_660` | `calc_mi_hb_sg_90_640` | `calc_mi_hb_sg_90_620` |
| **85%** | `calc_mi_hb_sg_85_760` | `calc_mi_hb_sg_85_740` | `calc_mi_hb_sg_85_720` | `calc_mi_hb_sg_85_700` | `calc_mi_hb_sg_85_680` | `calc_mi_hb_sg_85_660` | `calc_mi_hb_sg_85_640` | `calc_mi_hb_sg_85_620` |

#### 9. FHA Defaults
*Defaults for FHA Mortgage Insurance Premiums (MIP) and Limits.*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_fha_min_down_pct` | Minimum Down Payment % (e.g. 3.5) |
| `calc_fha_max_ltv_cashout` | Max LTV for Cash Out Refi (e.g. 80) |
| `calc_fha_ufmip_rate_purchase` | Upfront MIP for Purchase (e.g. 1.75) |
| `calc_fha_ufmip_rate_refi` | Upfront MIP for Standard Refi (e.g. 1.75) |
| `calc_fha_ufmip_rate_streamline` | Upfront MIP for Streamline Refi (e.g. 0.55 or 1.75) |
| `calc_fha_mip_30yr_gt95` | Annual MIP (Monthly) - 30yr, LTV > 95% (e.g. 0.55) |
| `calc_fha_mip_30yr_le95` | Annual MIP (Monthly) - 30yr, LTV ≤ 95% (e.g. 0.50) |
| `calc_fha_mip_15yr_gt90` | Annual MIP (Monthly) - 15yr, LTV > 90% (e.g. 0.40) |
| `calc_fha_mip_15yr_le90` | Annual MIP (Monthly) - 15yr, LTV ≤ 90% (e.g. 0.15) |
| `calc_fha_hb_mip_30yr_gt95` | High Balance MIP - 30yr, LTV > 95% |
| `calc_fha_hb_mip_30yr_le95` | High Balance MIP - 30yr, LTV ≤ 95% |

#### 10. VA Defaults
*Funding Fees and Guarantee Limits.*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_va_max_guarantee` | Maximum VA Guarantee Amount |
| `calc_va_max_ltv_cashout` | Max LTV for VA Cash Out |
| `calc_va_max_ltv_irrrl` | Max LTV for VA IRRRL |
| `calc_va_ff_first_ltv_le90` | FF: First Use, LTV ≤ 90% (e.g. 1.25) |
| `calc_va_ff_first_ltv_90_95` | FF: First Use, LTV 90-95% (e.g. 1.50) |
| `calc_va_ff_first_ltv_gt95` | FF: First Use, LTV > 95% (e.g. 2.15) |
| `calc_va_ff_subseq_ltv_le90` | FF: Subsequent Use, LTV ≤ 90% |
| `calc_va_ff_subseq_ltv_90_95` | FF: Subsequent Use, LTV 90-95% |
| `calc_va_ff_subseq_ltv_gt95` | FF: Subsequent Use, LTV > 95% |
| `calc_va_ff_irrrl` | FF: Streamline Refi (IRRRL) |
| `calc_va_ff_cashout_first` | FF: Cash Out First Use |
| `calc_va_ff_cashout_subseq` | FF: Cash Out Subsequent Use |

#### 11. Qualifying Ratios (DTI)
*Debt-to-Income Ratio Defaults.*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_dti_conv_front` | Conventional Front-End Ratio (e.g. 45) |
| `calc_dti_conv_back` | Conventional Back-End Ratio (e.g. 50) |
| `calc_dti_fha_front` | FHA Front-End Ratio (e.g. 46) |
| `calc_dti_fha_back` | FHA Back-End Ratio (e.g. 56) |
| `calc_dti_va_back` | VA Back-End Ratio (e.g. 55) |

#### 12. Special Programs
*USDA and DPA Settings.*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_usda_rate` | Default USDA Interest Rate |
| `calc_usda_upfront_fee` | USDA Upfront Guarantee Fee (e.g. 1.00) |
| `calc_usda_annual_fee` | USDA Annual Fee (e.g. 0.35) |
| `calc_dpa_amount` | Down Payment Assistance Amount/Percent |

#### 13. Marketing Blurbs
*Text for Flyers and Home Page.*

| Custom Value Name | Description |
| :--- | :--- |
| `calc_blurb_home_1` | Home Page Announcement Line 1 |
| `calc_blurb_home_2` | Home Page Announcement Line 2 |
| `calc_blurb_home_3` | Home Page Announcement Line 3 |
| `calc_blurb_closing_en` | Closing Cost Summary Text (English) |
| `calc_blurb_closing_es` | Closing Cost Summary Text (Spanish) |
| `calc_blurb_flyer_en` | Open House Flyer Text (English) |
| `calc_blurb_flyer_es` | Open House Flyer Text (Spanish) |
