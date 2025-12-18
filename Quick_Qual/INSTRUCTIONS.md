# Building `qq_final.html`

Objective: create `qq_final.html` with the modern styling/structure from `qq_top.html` while carrying over every section, input, and interaction present in `QuickQual_Numbers.html`.

## Source references
- Styling/layout/patterns: `Quick_Qual/qq_top.html`
- Full feature set and field list: `Quick_Qual/QuickQual_Numbers.html`

## Implementation checklist
1. **Copy baseline shell**  
   - Start from `qq_top.html` markup (doctype, head with Poppins/font variables, global styles, header, context selector, nav grid, base scripts/form).
   - Keep the ASP.NET WebForms hidden fields, `__doPostBack`, `WebResource.axd` scripts, and `onlyNos` helper to avoid breaking posted form behavior.

2. **Extend panels to include all content**  
   - Port Panels 0–12 from `QuickQual_Numbers.html` into the modern card-based layout. Maintain `id`/`name` attributes, values, radio/checkbox group names, and submit buttons.
   - Preserve existing text, default values, and validation hooks (`onkeypress="return onlyNos(event,this);"` or `noCommas`). If any function isn’t defined in `qq_top`, add minimal placeholders to prevent errors.
   - Keep save/copy buttons as submits; place them in the modern button styles by relying on `input[id^=...]` CSS rules.

3. **Navigation grid**  
   - Ensure the nav grid includes buttons for all sections represented in QuickQual_Numbers (Interest Rates through Qualifying Ratios and the placeholder Panel12 if needed).

4. **Styling alignment**  
   - Use existing `card`, `form-section-title`, `styleRates` table styling from `qq_top`. Adjust column widths minimally to fit long tables (MI grids, fee schedules).
   - Avoid changing text content; only wrap in modern containers and spacing.

5. **Spacing/order**  
   - Follow the original section order (Panel0 → Panel12). Use `panel-container` or additional cards to separate major sections for readability.

6. **Testing/verification**  
   - Open in browser to visually confirm all inputs/radios/checkboxes exist with modern styling and that plus/minus buttons remain present.
   - Check that radios share names as before so posted data matches legacy expectations.

## File placement
Create `qq_final.html` alongside the other Quick_Qual HTML files in `Quick_Qual/`.

## Notes
- Keep ASCII-only edits.
- Do not remove or rename any inputs; preserve form `action="./Setup"` and method/enctype.
