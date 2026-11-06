# Wave 3 visual comparison corrections

The November 6, 2026 comparison used Immerse main `acbac906` and wave-3
`10f5b9d`, the same HeavyDB instance, synthetic sales data, Chromium, and a
1440×1000 dark desktop viewport. Its 13 medium/large findings are addressed on
wave-3. The original findings and screenshots remain unchanged as historical
evidence; the comparison artifact's `fixed/` directory records the corrections.

| Finding                     | Correction                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| L01 Join builder            | A portaled consumer class sizes the editor at 1140px, capped by the viewport, and restores its two-column title/content layout.    |
| L02 Custom SQL              | Restores the 60vw × 70vh workspace; the SQL input grows beside the browser, above the footer.                                      |
| L03 SQL/column browsers     | Current RMWC containers receive dark backgrounds, full width, and deliberate icon/type column widths.                              |
| L04 Import Settings         | Hoists form styles out of the former portal ancestor; restores compact width, dark inputs, labels, spacing, and action gaps.       |
| L05 Format presets          | Covers the upgraded list classes, compact rows, dark menu surface, readable labels, and theme-primary selected state.              |
| L06 Dashboard filter picker | Restores the opaque compact list surface and readable options using the same list correction.                                      |
| M01 Sliders                 | Owned slider layout hooks restore inline numeric inputs; legacy range sliders retain their distinct rail/thumb appearance.         |
| M02 Switches/checkboxes     | Restores regular/compact switch density, visible disabled states, checkbox marks, and the larger pill/check/cross toggle variant.  |
| M03 Action menus            | Restores 14px text, 32px rows, smaller icons, and right-aligned chart-menu placement.                                              |
| M04 Input affordances       | Icons overlay their reserved padding; search/clear/caret controls and empty select placeholders are visible again.                 |
| M05 Dashboard Import        | Restores 560px dialog width, centered drop instructions, quiet Close/Cancel controls, and avoids a second scrim inside AppOverlay. |
| M06 Save icons              | SVG button icons have explicit dimensions and inherit semantic foreground color.                                                   |
| M07 Select chrome           | Restores the table-border selector's height, padding, clear affordance, and compact indicator treatment.                           |

The warning header/icon remain warning yellow and its action remains primary.
The previously requested import-field spacing, user/About popover fixes, notebook
column browser, and HeavyIQ selector outlines are retained. No dependency or
lockfile changes are needed.

## Verification

- Owned UI unit checks and package declarations.
- Existing UI browser checks for keyboard, focus, portal cleanup, pointer sliders,
  themes, form values, and retained chart-engine composition.
- Real-backend visual regression checks in `browser-visual-regressions.spec.ts`
  cover both join columns, the usable SQL workspace/footer, readable and selectable
  preset/filter menus, and SQL column visibility/search.
- The existing synthetic dashboard load/crossfilter, dashboard manager, and SQL
  result browser checks remain in `browser-baseline.spec.ts`.
- The comparison harness recaptures all 43 states; the correction gallery records
  the same limits as the original review. Raster rendering and production
  dashboards/plugins are outside this synthetic dark-desktop review.

The real-backend checks require the development server and the
`modernization_wave0_sales` fixture. Run with the installed Playwright browser:

```sh
pnpm exec playwright test --config test-config/modernization/playwright.config.ts
```
