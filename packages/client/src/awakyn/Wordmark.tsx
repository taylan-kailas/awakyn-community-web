import { BRAND } from "./brand";
import { Lotus } from "./Lotus";

// Lotus width as a share of the wordmark's font size, matching the website's mark.
const LOTUS_TO_TEXT = 1.2;

/** Lotus + name, replacing Stoat's wordmark image. Takes Stoat's `class` prop. */
export function Wordmark(props: { class?: string; size?: number }) {
  const size = () => props.size ?? 40;
  return (
    <span
      class={props.class}
      style={{
        display: "inline-flex",
        "align-items": "center",
        "justify-content": "center",
        gap: "0.35em",
        "font-size": `${size()}px`,
        "font-weight": 600,
        color: "var(--md-sys-color-on-surface)",
      }}
    >
      <Lotus size={size() * LOTUS_TO_TEXT} />
      {BRAND.name}
    </span>
  );
}
