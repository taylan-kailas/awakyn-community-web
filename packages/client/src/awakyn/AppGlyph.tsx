import { For } from "solid-js";

// Awakyn Community's own icon (two speech bubbles, from the Awakyn icon family
// in awakyn-website-v2 handoff/icons), drawn in the text colour.
const VIEWBOX = "0 0 100 100";
const STROKE_WIDTH = 5.6;
const BUBBLES = [
  "M21.61493336514453,55.426902632476946 A24,24 0 1 1 31.791516560183965,62.552622898861806 L20.45251504915636,67.91670166936885 Z",
  "M70.4983827231877,77.85415979493226 A19,19 0 1 1 78.55484441926059,72.21296458404424 L79.47509225275122,82.100722154917 Z",
];

/**
 * Shown only while the app first connects; everywhere else keeps the lotus.
 * It breathes slowly so the wait still reads as loading.
 */
export function AppGlyph(props: { size: number }) {
  return (
    <>
      <style>{`
        .awakyn-app-glyph { animation: awakyn-glyph-breathe 2.4s ease-in-out infinite; }
        @keyframes awakyn-glyph-breathe { 50% { opacity: .45; } }
        @media (prefers-reduced-motion: reduce) { .awakyn-app-glyph { animation: none; } }
      `}</style>
      <svg
        class="awakyn-app-glyph"
        aria-hidden="true"
        viewBox={VIEWBOX}
        width={props.size}
        height={props.size}
        fill="none"
        stroke="currentColor"
        stroke-width={STROKE_WIDTH}
        stroke-linecap="round"
        stroke-linejoin="round"
        style={{ color: "var(--md-sys-color-on-surface)" }}
      >
        <For each={BUBBLES}>{(d) => <path d={d} />}</For>
      </svg>
    </>
  );
}
