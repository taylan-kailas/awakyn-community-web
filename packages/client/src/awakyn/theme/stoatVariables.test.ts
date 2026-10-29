// Run with: node --test src/awakyn/theme/stoatVariables.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { stoatThemeVariables } from "./stoatVariables.ts";
import { AWAKYN_THEME } from "./tokens.ts";

// Every colour role Stoat reads (MaterialColours in components/ui/themes/materialTheme.ts).
const STOAT_COLOUR_ROLES = (
  "primary on-primary primary-container on-primary-container secondary on-secondary " +
  "secondary-container on-secondary-container tertiary on-tertiary tertiary-container " +
  "on-tertiary-container error on-error error-container on-error-container primary-fixed " +
  "primary-fixed-dim on-primary-fixed on-primary-fixed-variant secondary-fixed secondary-fixed-dim " +
  "on-secondary-fixed on-secondary-fixed-variant tertiary-fixed tertiary-fixed-dim on-tertiary-fixed " +
  "on-tertiary-fixed-variant surface-dim surface surface-bright surface-container-lowest " +
  "surface-container-low surface-container surface-container-high surface-container-highest " +
  "on-surface on-surface-variant outline outline-variant inverse-surface inverse-on-surface " +
  "inverse-primary scrim shadow"
).split(" ");

test("dark mode paints Stoat's background with Awakyn espresso", () => {
  const v = stoatThemeVariables(AWAKYN_THEME, true);
  assert.equal(v["--md-sys-color-surface"], "#17130f");
  assert.equal(v["--md-sys-color-on-surface"], "#ece4d3");
});

test("light mode paints Stoat's background with Awakyn paper", () => {
  const v = stoatThemeVariables(AWAKYN_THEME, false);
  assert.equal(v["--md-sys-color-surface"], "#f3eddd");
  assert.equal(v["--md-sys-color-on-surface"], "#2b2823");
});

test("every colour role Stoat uses is covered in both modes", () => {
  for (const dark of [true, false]) {
    const v = stoatThemeVariables(AWAKYN_THEME, dark);
    for (const role of STOAT_COLOUR_ROLES) {
      assert.match(v[`--md-sys-color-${role}`] ?? "", /^#[0-9a-f]{6}$/i, role);
      assert.match(v[`--mdui-color-${role}`] ?? "", /^\d+, \d+, \d+$/, role);
    }
  }
});

test("the interface font is Awakyn's", () => {
  assert.match(stoatThemeVariables(AWAKYN_THEME, true)["--fonts-primary"], /^"Hanken Grotesk"/);
});

test("server icons get the rounded-square shape", () => {
  assert.equal(stoatThemeVariables(AWAKYN_THEME, true)["--awakyn-server-icon-radius"], "16px");
});

test("a different theme object restyles everything (swap test)", () => {
  const other = { ...AWAKYN_THEME, dark: { ...AWAKYN_THEME.dark, bg: "#000000" } };
  assert.equal(stoatThemeVariables(other, true)["--md-sys-color-surface"], "#000000");
});

// WCAG contrast ratio between two #rrggbb colours.
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// A selected item, filled button or warning frame must stand out from the sidebar and frame.
const MIN_SELECTED_CONTRAST = 1.3;
const MIN_TEXT_CONTRAST = 4.5;

test("a selected channel stands out from the sidebar in both modes", () => {
  for (const dark of [true, false]) {
    const v = stoatThemeVariables(AWAKYN_THEME, dark);
    for (const behind of ["surface-container-low", "surface-container-high"]) {
      const ratio = contrast(v["--md-sys-color-primary-container"], v[`--md-sys-color-${behind}`]);
      assert.ok(ratio >= MIN_SELECTED_CONTRAST, `${dark ? "dark" : "light"} vs ${behind}: ${ratio.toFixed(2)}`);
    }
    const tonal = contrast(v["--md-sys-color-secondary-container"], v["--md-sys-color-surface-container-low"]);
    assert.ok(tonal >= MIN_SELECTED_CONTRAST, `${dark ? "dark" : "light"} tonal button: ${tonal.toFixed(2)}`);
  }
});

test("quieter text is still comfortably readable in both modes", () => {
  for (const dark of [true, false]) {
    const v = stoatThemeVariables(AWAKYN_THEME, dark);
    for (const role of ["on-surface-variant", "outline"]) {
      for (const behind of ["surface", "surface-container-low", "surface-container-high"]) {
        const ratio = contrast(v[`--md-sys-color-${role}`], v[`--md-sys-color-${behind}`]);
        assert.ok(ratio >= MIN_TEXT_CONTRAST, `${dark ? "dark" : "light"} ${role} on ${behind}: ${ratio.toFixed(2)}`);
      }
    }
  }
});
