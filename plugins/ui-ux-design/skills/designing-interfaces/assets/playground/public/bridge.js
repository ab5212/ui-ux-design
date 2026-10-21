/* UI Playground bridge. DEV ONLY. The playground's local proxy adds this script to your app's pages while you preview,
   so you never add it yourself.
   Lets the playground (the page that framed your app) restyle it live (colors, style preset, fonts, light/dark)
   and, in edit mode, select elements so their styles can be edited.
   It accepts messages only from the playground origin that served this file. */
(() => {
  if (window.parent === window) return;
  const origin = new URL(document.currentScript.src).origin;
  const mk = (id) => Object.assign(document.createElement("style"), { id });
  const style = mk("playground-bridge"), edits = mk("playground-edits");
  const fonts = new Map();
  let editMode = false, selected = null;

  // Highlight boxes: pointer-events none so they never catch clicks.
  const box = (color) => {
    const d = document.createElement("div");
    d.setAttribute("data-playground-ui", "");
    d.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;display:none;border:2px solid ${color};border-radius:2px;box-sizing:border-box;font:600 11px/1 system-ui,sans-serif;`;
    const tag = document.createElement("span");
    tag.style.cssText = `position:absolute;left:-2px;top:-20px;background:${color};color:#fff;padding:4px 6px;border-radius:3px;white-space:nowrap;`;
    d.appendChild(tag); document.documentElement.appendChild(d);
    return { d, tag };
  };
  const hover = box("#0d99ff"), pick = box("#7b61ff");
  const place = (b, el, text) => {
    if (!el) { b.d.style.display = "none"; return; }
    const r = el.getBoundingClientRect();
    Object.assign(b.d.style, { display: "block", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    b.tag.textContent = text;
    b.tag.style.top = r.top < 22 ? "auto" : "-20px"; b.tag.style.bottom = r.top < 22 ? "-20px" : "auto";
  };
  const label = (el) => {
    const role = el.getAttribute("role"), tag = el.tagName.toLowerCase();
    const names = { a: "Link", button: "Button", img: "Image", input: "Input", h1: "Heading", h2: "Heading", h3: "Heading", p: "Text", ul: "List", li: "List item", nav: "Navigation", header: "Header", footer: "Footer", table: "Table", section: "Section", article: "Card", svg: "Icon" };
    return (role ? role[0].toUpperCase() + role.slice(1) : names[tag] || "Box") + " · " + tag;
  };
  const isUi = (el) => el.closest("[data-playground-ui]");

  // A selector that matches only this element, and a looser one that matches similar elements.
  const part = (el) => {
    let s = el.tagName.toLowerCase();
    const cls = [...el.classList].slice(0, 3).map((c) => "." + CSS.escape(c)).join("");
    return s + cls;
  };
  const unique = (sel) => { try { return document.querySelectorAll(sel).length === 1; } catch { return false; } };
  const selectorFor = (el) => {
    if (el.id && unique("#" + CSS.escape(el.id))) return "#" + CSS.escape(el.id);
    const parts = [];
    for (let n = el; n && n !== document.body && parts.length < 6; n = n.parentElement) {
      const sibs = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName) : [];
      parts.unshift(part(n) + (sibs.length > 1 ? `:nth-of-type(${sibs.indexOf(n) + 1})` : ""));
      const sel = parts.join(" > ");
      if (unique(sel)) return sel;
    }
    return parts.join(" > ");
  };
  const PROPS = ["color", "background-color", "font-size", "font-weight", "text-align", "padding-top", "border-top-left-radius", "border-top-width", "border-top-color", "box-shadow", "margin-top", "margin-bottom", "opacity"];
  const info = (el) => {
    const cs = getComputedStyle(el);
    const styles = {}; for (const p of PROPS) styles[p] = cs.getPropertyValue(p);
    const sel = selectorFor(el);
    const similar = el.classList.length ? part(el) : null;
    let count = 1; try { count = similar ? document.querySelectorAll(similar).length : 1; } catch {}
    return { selector: sel, similar, similarCount: count, tag: el.tagName.toLowerCase(), label: label(el), text: (el.childElementCount === 0 ? el.textContent : "").trim().slice(0, 60), styles };
  };

  const send = (m) => window.parent.postMessage(m, origin);
  const target = (e) => { const el = e.target; return el instanceof Element && !isUi(el) && el !== document.documentElement && el !== document.body ? el : null; };
  addEventListener("mousemove", (e) => { if (editMode) { const el = target(e); place(hover, el && el !== selected ? el : null, el ? label(el) : ""); } }, true);
  addEventListener("click", (e) => {
    if (!editMode) return;
    e.preventDefault(); e.stopPropagation();
    const el = target(e); if (!el) return;
    selected = el; place(pick, el, label(el)); send({ type: "playground:select", info: info(el) });
  }, true);
  addEventListener("keydown", (e) => { if (editMode && e.key === "Escape") { selected = null; place(pick, null); send({ type: "playground:select", info: null }); } }, true);
  const refresh = () => { if (selected && document.contains(selected)) place(pick, selected, label(selected)); };
  addEventListener("scroll", refresh, true); addEventListener("resize", refresh);

  addEventListener("message", (e) => {
    if (e.origin !== origin || e.source !== window.parent) return;
    const m = e.data;
    if (m && m.type === "playground:select-parent") {
      const up = selected && selected.parentElement;
      if (up && up !== document.body && up !== document.documentElement) { selected = up; place(pick, up, label(up)); send({ type: "playground:select", info: info(up) }); }
      return;
    }
    if (!m || m.type !== "playground:apply") return;
    document.head.appendChild(style); document.head.appendChild(edits); // last in <head>, so they win the cascade
    style.textContent = String(m.css);
    edits.textContent = String(m.editCss || "");
    document.documentElement.classList.toggle("dark", !!m.dark);
    editMode = !!m.edit;
    if (!editMode) { selected = null; place(hover, null); place(pick, null); }
    else requestAnimationFrame(() => { refresh(); if (selected) send({ type: "playground:select", info: info(selected) }); });
    for (const href of m.fonts || []) {
      if (fonts.has(href) || !/^https:\/\/fonts\.googleapis\.com\//.test(href)) continue;
      const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href });
      document.head.appendChild(link);
      fonts.set(href, link);
    }
  });
  send({ type: "playground:ready" });
})();
