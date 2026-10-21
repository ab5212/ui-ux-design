/* UI Playground bridge. DEV ONLY: add to your app's <head> while previewing, remove before shipping.
   <script src="http://localhost:5173/bridge.js"></script>
   Lets the playground (the page that framed your app) restyle it live: colors, style preset, fonts, light/dark.
   It accepts messages only from the playground origin that served this file. */
(() => {
  if (window.parent === window) return;
  const origin = new URL(document.currentScript.src).origin;
  const style = document.createElement("style");
  style.id = "playground-bridge";
  const fonts = new Map();
  addEventListener("message", (e) => {
    if (e.origin !== origin || e.source !== window.parent) return;
    const m = e.data;
    if (!m || m.type !== "playground:apply") return;
    document.head.appendChild(style); // last in <head>, so it wins the cascade
    style.textContent = String(m.css);
    document.documentElement.classList.toggle("dark", !!m.dark);
    for (const href of m.fonts || []) {
      if (fonts.has(href) || !/^https:\/\/fonts\.googleapis\.com\//.test(href)) continue;
      const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href });
      document.head.appendChild(link);
      fonts.set(href, link);
    }
  });
  window.parent.postMessage({ type: "playground:ready" }, origin);
})();
