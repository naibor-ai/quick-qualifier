# Quick Qualifier Website - Page Index

This is a local copy of the Quick Qualifier mortgage calculator website for Chris Moreno at Viewpoint Lending.

## Main Pages

### Default.html - Main Menu
The home page with navigation buttons to all calculator tools. Features:
- Conventional, FHA, and VA loan calculator buttons (both purchase and refinance)
- Side-by-side comparison tool
- Homes showcase and buyer's guide
- Bulletin board access
- Dropdown for Flyers (Finance, Property, Theme, Brochure)
- Area selector for different regional settings

### ConvSale.html - Conventional Home Purchase Loan
Calculator for conventional home purchase loans. Inputs:
- Sales price, down payment, interest rate, term
- Loan fees/discount points, seller/lender credits
- Options for ARM, Interest-Only, USDA, DPA, 2nd mortgage
- MI (Mortgage Insurance) options by credit score
- Outputs monthly payment breakdown and cash to close

### FhaSale.html - FHA Home Purchase Loan
Calculator for FHA-insured home purchase loans. Features:
- Lower down payment options (3.5% minimum)
- MIP (Mortgage Insurance Premium) calculations
- Support for multi-unit properties (duplex, triplex, fourplex)
- 203K renovation loan option
- EEM (Energy Efficient Mortgage) support

### VaSale.html - VA Guaranteed Mortgage
Calculator for VA home purchase loans. Features:
- Zero down payment option for eligible veterans
- VA funding fee calculations
- Options for Regular Veteran, Reservist, Disabled Veteran
- No monthly mortgage insurance

### ConvRefi.html - Conventional Refinance
Calculator for conventional refinance loans. Inputs:
- Property value, loan amount, current balance
- Interest rate, term, loan fees
- Options for ARM, Interest-Only, USDA, No Impounds, Zero Cash
- MI options for loans over 80% LTV

### FhaRefi.html - FHA Refinance
Calculator for FHA refinance loans. Types:
- New FHA refinance
- Refinance with existing FHA
- Streamline (no appraisal)
- Streamline with appraisal

### VaRefi.html - VA Refinance
Calculator for VA refinance loans. Types:
- New Cash Out VA Refinance
- VA Rate & Term Refi
- IRRRL (Streamline - No Appraisal)

### Compare.html - Side-by-Side Loan Comparison
Compare up to 3 loan options side-by-side:
- Compare Conventional vs FHA vs VA
- See payment differences and cash to close
- Useful for helping buyers choose loan type

### Homes.html - Lenders Showcase of Homes
Display listing of homes for sale with:
- Price, address, and property details
- PDF flyer generation for each listing

### Guide.html - Home Shopping Guide
Helps buyers determine affordable price range based on:
- Desired monthly payment, OR
- Monthly income and existing debt payments
- Shows results for Conventional, FHA, and VA options

### Bulletin.html - Lenders Bulletin Board
Information bulletin board with:
- Up to 12 bulletin items with PDF attachments
- Contact form for questions/requests

---

## Admin/Management Pages

### Setup.html - Admin Panel
Main administration screen for all settings:
- **Interest Rates** - Default rates for all loan types
- **2nd Details** - Second mortgage settings
- **Title & Escrow Details** - Closing cost splits
- **Prepaid Factors** - Tax/insurance proration settings
- **Loan Ceilings** - Conforming/FHA/VA loan limits
- **Industry Fees** - Standard third-party fees
- **Company Fees** - Lender-specific fees
- **MI Factors** - Mortgage insurance rate tables
- **Special Programs (USDA)** - USDA loan settings
- **FHA Settings** - FHA-specific parameters
- **VA Settings** - VA-specific parameters
- **Prequal Ratios** - DTI ratio limits
- **Personal Information** - Loan officer contact info
- **Custom Disclaimers** - Footer text customization
- **Bulletin Board Editor** - Manage bulletin items

### Agents.html - Agent Marketing
Marketing materials for real estate agents:
- Rate sheets with current interest rates
- APR calculations for different loan types
- Customizable marketing flyers

### Clients.html - Client Database
Client relationship management:
- Store client contact information
- Track client interactions

### Flyers.html - Flyers Management
Create and manage marketing flyers:
- Finance flyers
- Property flyers
- Theme flyers
- Brochure flyers
- Print in English or Spanish

### SellerNet.html - Seller Net Sheet
Calculate seller proceeds from home sale:
- Sales price and existing loan payoff
- Commission and closing costs
- Title/escrow fees
- Prorated taxes and HOA
- Net proceeds to seller

---

## File Structure

```
qq-website-html/
├── INDEX.md          # This file
├── Default.html      # Main menu
├── ConvSale.html     # Conventional purchase
├── FhaSale.html      # FHA purchase
├── VaSale.html       # VA purchase
├── ConvRefi.html     # Conventional refinance
├── FhaRefi.html      # FHA refinance
├── VaRefi.html       # VA refinance
├── Compare.html      # Loan comparison
├── Homes.html        # Home listings
├── Guide.html        # Shopping guide
├── Bulletin.html     # Bulletin board
├── Setup.html        # Admin panel
├── Agents.html       # Agent marketing
├── Clients.html      # Client database
├── Flyers.html       # Flyer management
├── SellerNet.html    # Seller net sheet
├── CS/               # Stylesheets
│   ├── Menu.css
│   ├── ConvSale.css
│   ├── FhaSale.css
│   ├── VaSale.css
│   ├── ConvRefi.css
│   ├── FhaRefi.css
│   ├── VaRefi.css
│   ├── Comp.css
│   ├── Homes.css
│   ├── Guide.css
│   ├── Bulletin.css
│   ├── Setup.css
│   ├── Agents.css
│   ├── Clients.css
│   ├── Flyers.css
│   └── SellerNet.css
└── JS/               # JavaScript
    ├── JScript.js
    ├── onlyNos.js
    ├── noCommas.js
    └── PlaySound.js
```

---

## Technical Notes

- Original site is ASP.NET WebForms application
- Forms use postback (server-side processing) - calculators won't calculate locally
- This local copy is for reference/design only
- For Next.js conversion, calculation logic must be reimplemented in JavaScript
