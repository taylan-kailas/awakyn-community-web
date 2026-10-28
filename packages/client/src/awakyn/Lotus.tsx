import { AWAKYN_THEME } from "./theme/tokens";

// Trimmed bounds of the lotus artwork, so it keeps its shape at any size.
const LOTUS_ASPECT_RATIO = "727 / 614";

/**
 * The Awakyn lotus, painted with the current text colour through a CSS mask:
 * ink in light mode, cream in dark mode, from one transparent image.
 */
export function Lotus(props: { size: number }) {
  const url = `url(${import.meta.env.BASE_URL}${AWAKYN_THEME.logoMaskPath})`;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: `${props.size}px`,
        "aspect-ratio": LOTUS_ASPECT_RATIO,
        background: "currentColor",
        "mask-image": url,
        "-webkit-mask-image": url,
        "mask-repeat": "no-repeat",
        "-webkit-mask-repeat": "no-repeat",
        "mask-position": "center",
        "-webkit-mask-position": "center",
        "mask-size": "contain",
        "-webkit-mask-size": "contain",
      }}
    />
  );
}
