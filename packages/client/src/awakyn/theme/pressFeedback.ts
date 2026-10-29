import type { AwakynTheme } from "./tokens";

/**
 * CSS giving every button a visible reaction when pressed, a working look
 * while a form submits, and a clearly disabled look — for Stoat's own buttons
 * too, whose press ripple is too faint in the Awakyn colours.
 */
export function pressFeedbackCss(theme: AwakynTheme): string {
  const { scale, fadedOpacity, durationMs } = theme.press;
  const pressable = 'button, [role="button"], a[href]';
  return `
${pressable} { transition: transform ${durationMs}ms ease, opacity ${durationMs}ms ease; }
button:not(:disabled):active, [role="button"]:not([aria-disabled="true"]):active, a[href]:active {
  transform: scale(${scale}); opacity: ${fadedOpacity + (1 - fadedOpacity) / 2};
}
button:disabled, [role="button"][aria-disabled="true"] { opacity: ${fadedOpacity}; cursor: not-allowed; }
form[aria-busy="true"] button[type="submit"], button[aria-busy="true"] {
  opacity: ${fadedOpacity}; cursor: progress; pointer-events: none;
  animation: awakyn-busy ${durationMs * 8}ms ease-in-out infinite alternate;
}
@keyframes awakyn-busy { to { opacity: 1; } }
`;
}

/** Adds the press-feedback CSS to the page once. */
export function loadPressFeedback(theme: AwakynTheme) {
  const style = document.createElement("style");
  style.dataset.awakyn = "press-feedback";
  style.textContent = pressFeedbackCss(theme);
  document.head.appendChild(style);
}
