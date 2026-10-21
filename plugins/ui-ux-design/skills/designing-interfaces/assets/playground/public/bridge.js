/* UI Playground bridge. DEV ONLY. The playground's local proxy adds this script to your app's pages while you preview,
   so you never add it yourself.
   Lets the playground restyle the page live (colors, style preset, fonts, light/dark) and, in edit mode, select, move,
   insert, delete, group, resize and re-text elements. Structural changes are kept as an operation list the playground saves.
   It accepts messages only from the playground origin that served this file. */
(() => {
  if (window.parent === window) return;
  const origin = new URL(document.currentScript.src).origin;
  const send = (m) => window.parent.postMessage(m, origin);
  const ID = "data-pg", UI = "data-playground-ui";
  const mk = (id) => Object.assign(document.createElement("style"), { id });
  const style = mk("playground-bridge"), edits = mk("playground-edits"), lib = mk("playground-lib");
  lib.textContent = ".pg-kebab>summary{list-style:none}.pg-kebab>summary::-webkit-details-marker{display:none}.pg-kebab li:hover{background:var(--muted,#f3f4f6)}";
  const fonts = new Map();
  let editMode = false, selected = null, multi = [], editing = null;
  const done = [], undone = [];

  // ---- helpers ------------------------------------------------------------------------------------------------
  let seq = 0;
  const idOf = (el) => { let v = el.getAttribute(ID); if (!v) { v = String(++seq); el.setAttribute(ID, v); } return Number(v); };
  const byId = (id) => document.querySelector(`[${ID}="${id}"]`);
  const $ = (s) => { try { return document.querySelector(s); } catch { return null; } };
  const isUi = (el) => !!el.closest(`[${UI}]`);
  const kids = (p) => [...p.children].filter((c) => !c.hasAttribute(UI));
  const indexIn = (el) => kids(el.parentElement).indexOf(el);
  const unique = (sel) => { try { return document.querySelectorAll(sel).length === 1; } catch { return false; } };
  const part = (el) => el.tagName.toLowerCase() + [...el.classList].slice(0, 3).map((c) => "." + CSS.escape(c)).join("");
  const selectorFor = (el) => {
    if (el === document.body) return "body";
    if (el.id && unique("#" + CSS.escape(el.id))) return "#" + CSS.escape(el.id);
    const parts = [];
    for (let n = el; n && n !== document.body && parts.length < 7; n = n.parentElement) {
      const sibs = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName && !c.hasAttribute(UI)) : [];
      parts.unshift(part(n) + (sibs.length > 1 ? `:nth-of-type(${sibs.indexOf(n) + 1})` : ""));
      const sel = parts.join(" > ");
      if (unique(sel)) return sel;
    }
    return parts.join(" > ");
  };
  const clean = (el) => { const c = el.cloneNode(true); [c, ...c.querySelectorAll("*")].forEach((n) => { n.removeAttribute(ID); n.removeAttribute("contenteditable"); n.removeAttribute("open"); }); return c; };
  const ownTextNode = (el) => [...el.childNodes].find((n) => n.nodeType === 3 && n.data.trim());
  const ownText = (el) => (ownTextNode(el)?.data ?? "").trim();
  const refOf = (el) => ({ selector: selectorFor(el), tag: el.tagName.toLowerCase(), classes: [...el.classList].slice(0, 6), text: ownText(el).slice(0, 60), html: clean(el).outerHTML.slice(0, 300) });
  const NAMES = { a: "Link", button: "Button", img: "Image", input: "Input", textarea: "Input", select: "Select", h1: "Heading", h2: "Heading", h3: "Heading", h4: "Heading", p: "Text", span: "Text", ul: "List", ol: "List", li: "List item", nav: "Navigation", header: "Header", footer: "Footer", table: "Table", section: "Section", article: "Card", svg: "Icon", label: "Label", form: "Form", main: "Main", aside: "Sidebar", details: "Menu", summary: "Button" };
  const isIcon = (el) => /material-symbols|material-icons/.test(el.className || "");
  const label = (el) => {
    if (el.matches?.(".pg-kebab")) return "Kebab menu";
    if (el.hasAttribute("data-pg-group")) return "Group";
    if (isIcon(el)) return "Icon";
    const role = el.getAttribute("role"), tag = el.tagName.toLowerCase();
    return (role ? role[0].toUpperCase() + role.slice(1) : NAMES[tag] || "Box") + " · " + tag;
  };
  const isContainer = (el) => el.childElementCount > 0 || (!ownText(el) && !["IMG", "INPUT", "BR", "HR", "SVG", "path"].includes(el.tagName) && !isIcon(el));

  // ---- fonts for inserted icons --------------------------------------------------------------------------------
  const ensureIconFont = () => {
    const href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=block";
    if (fonts.has(href)) return;
    const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href });
    document.head.appendChild(link); fonts.set(href, link);
  };

  // ---- operations: one function performs a spec (live or replayed) and returns its undo --------------------------
  const placeAt = (el, parent, index) => { parent.insertBefore(el, kids(parent).filter((c) => c !== el)[index] || null); };
  const fromHtml = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const setText = (el, text) => {
    const n = ownTextNode(el) || el.appendChild(document.createTextNode(""));
    const was = n.data; n.data = text; return () => { n.data = was; };
  };
  const liHtml = (it) => `<li role="menuitem" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;cursor:pointer;white-space:nowrap">${it.icon ? `<span class="material-symbols-rounded" aria-hidden="true" style="font-size:18px">${it.icon}</span>` : ""}${it.label.replace(/[<>&]/g, "")}</li>`;

  function perform(s) {
    switch (s.op) {
      case "move": {
        const el = $(s.target), p = $(s.parent);
        if (!el || !p || el.contains(p)) return null;
        const op = el.parentElement, oi = indexIn(el);
        placeAt(el, p, s.index);
        return () => placeAt(el, op, oi);
      }
      case "insert": {
        const p = $(s.parent), el = p && fromHtml(s.html);
        if (!el) return null;
        ensureIconFont(); placeAt(el, p, s.index);
        s._el = el;
        return () => el.remove();
      }
      case "delete": {
        const el = $(s.target); if (!el) return null;
        const p = el.parentElement, i = indexIn(el);
        el.remove(); return () => placeAt(el, p, i);
      }
      case "duplicate": {
        const el = $(s.target); if (!el) return null;
        const c = clean(el); placeAt(c, el.parentElement, indexIn(el) + 1); s._el = c;
        return () => c.remove();
      }
      case "group": {
        const els = s.targets.map($).filter(Boolean).sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)); if (!els.length) return null;
        const p = els[0].parentElement, same = els.filter((e) => e.parentElement === p);
        const prev = same.map((e) => ({ e, i: indexIn(e) })), at = Math.min(...prev.map((x) => x.i));
        const g = document.createElement("div"); g.setAttribute("data-pg-group", "");
        g.style.cssText = `display:flex;flex-direction:${s.layout};gap:8px`;
        placeAt(g, p, at); same.forEach((e) => g.appendChild(e)); s._el = g;
        return () => { g.remove(); prev.forEach(({ e, i }) => placeAt(e, p, i)); };
      }
      case "ungroup": {
        const g = $(s.target); if (!g || !g.parentElement) return null;
        const p = g.parentElement, i = indexIn(g), cs = kids(g);
        cs.forEach((c, j) => placeAt(c, p, i + j)); g.remove();
        return () => { placeAt(g, p, i); cs.forEach((c) => g.appendChild(c)); };
      }
      case "text": { const el = $(s.target); return el ? setText(el, s.to) : null; }
      case "menu-items": {
        const ul = $(s.target)?.querySelector("ul"); if (!ul) return null;
        const was = ul.innerHTML; ul.innerHTML = s.items.map(liHtml).join(""); return () => { ul.innerHTML = was; };
      }
    }
    return null;
  }

  const report = () => send({ type: "playground:ops", ops: done.map((d) => { const { _el, ...rest } = d.spec; return rest; }), canUndo: done.length > 0, canRedo: undone.length > 0 });
  function commit(spec) {
    const undo = perform(spec);
    if (!undo) return null;
    done.push({ spec, undo }); undone.length = 0; afterChange(spec._el);
    return spec._el;
  }
  function afterChange(pick) {
    if (pick) choose(pick);
    else if (selected && !document.contains(selected)) choose(null);
    refresh(); report(); scheduleTree(); if (selected) sendInfo();
  }
  const undo = () => { const d = done.pop(); if (!d) return; d.undo(); undone.push(d.spec); afterChange(null); };
  const redo = () => {
    const s = undone.pop(); if (!s) return;
    const u = perform(s); if (u) done.push({ spec: s, undo: u });
    afterChange(s._el);
  };
  const undoAll = () => { while (done.length) done.pop().undo(); undone.length = 0; afterChange(null); };
  const replay = (ops) => { undoAll(); ops.forEach((s) => { const u = perform(s); if (u) done.push({ spec: s, undo: u }); }); afterChange(null); };

  // ---- spec builders (live commands) ----------------------------------------------------------------------------
  const nameOf = (el) => ownText(el).slice(0, 24) || label(el);
  const sel1 = (el) => ({ target: selectorFor(el), ref: refOf(el) });
  function moveBy(el, d) {
    const p = el.parentElement, i = indexIn(el), n = kids(p).length, j = Math.max(0, Math.min(n - 1, i + d));
    if (j === i) return;
    commit({ op: "move", ...sel1(el), parent: selectorFor(p), index: j, summary: `Move "${nameOf(el)}" ${d < 0 ? "up" : "down"} to position ${j + 1} in ${selectorFor(p)}` });
  }
  function moveTo(el, parent, index) {
    if (!parent || el === parent || el.contains(parent)) return;
    commit({ op: "move", ...sel1(el), parent: selectorFor(parent), index, summary: `Move "${nameOf(el)}" into ${selectorFor(parent)} at position ${index + 1}` });
  }
  function del(el) { if (el && el !== document.body) commit({ op: "delete", ...sel1(el), summary: `Delete "${nameOf(el)}" (${selectorFor(el)})` }); }
  function dup(el) { if (el && el !== document.body) commit({ op: "duplicate", ...sel1(el), summary: `Duplicate "${nameOf(el)}"` }); }
  function group(els, layout) {
    const list = els.length ? els : selected ? [selected] : [];
    if (!list.length) return;
    commit({ op: "group", targets: list.map(selectorFor), refs: list.map(refOf), layout: layout || "column", summary: `Group ${list.length} element${list.length > 1 ? "s" : ""} into a ${layout === "row" ? "row" : "column"}` });
  }
  function ungroup(el) { if (el && el.childElementCount && el.parentElement && el !== document.body) commit({ op: "ungroup", ...sel1(el), summary: `Ungroup "${nameOf(el)}" (move its children out, remove the wrapper)` }); }
  function insert(html, kind, where) {
    let parent, index;
    const s = selected;
    if (s && where !== "after" && isContainer(s) && !["BUTTON", "A", "SUMMARY"].includes(s.tagName)) { parent = s; index = kids(s).length; }
    else if (s && s !== document.body && s.parentElement) { parent = s.parentElement; index = indexIn(s) + 1; }
    else { parent = document.body; index = kids(document.body).length; }
    commit({ op: "insert", parent: selectorFor(parent), parentRef: refOf(parent), index, html, kind, summary: `Insert ${kind} into ${selectorFor(parent)} at position ${index + 1}` });
  }
  function retext(el, to) { const from = ownText(el); if (to !== from) commit({ op: "text", ...sel1(el), from, to, summary: `Change text "${from.slice(0, 40)}" to "${to.slice(0, 40)}"` }); }
  function items(el, list) { commit({ op: "menu-items", ...sel1(el), items: list, summary: `Set kebab menu items: ${list.map((i) => i.label).join(", ")}` }); }

  // ---- overlays ----------------------------------------------------------------------------------------------------
  const box = (color, dashed) => {
    const d = document.createElement("div");
    d.setAttribute(UI, "");
    d.style.cssText = `position:fixed;z-index:2147483647;pointer-events:none;display:none;border:2px ${dashed ? "dashed" : "solid"} ${color};border-radius:2px;box-sizing:border-box;font:600 11px/1 system-ui,sans-serif;`;
    const tag = document.createElement("span");
    tag.style.cssText = `position:absolute;left:-2px;top:-20px;background:${color};color:#fff;padding:4px 6px;border-radius:3px;white-space:nowrap;`;
    d.appendChild(tag); document.documentElement.appendChild(d);
    return { d, tag };
  };
  const hover = box("#0d99ff"), pick = box("#7b61ff"), extras = [];
  const line = Object.assign(document.createElement("div"), {});
  line.setAttribute(UI, ""); line.style.cssText = "position:fixed;z-index:2147483647;pointer-events:none;display:none;background:#7b61ff;border-radius:2px";
  document.documentElement.appendChild(line);
  const place = (b, el, text) => {
    if (!el || !document.contains(el)) { b.d.style.display = "none"; return; }
    const r = el.getBoundingClientRect();
    Object.assign(b.d.style, { display: "block", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    b.tag.textContent = text; b.tag.style.top = r.top < 22 ? "auto" : "-20px"; b.tag.style.bottom = r.top < 22 ? "-20px" : "auto";
  };
  // 8 resize handles
  const HANDLES = [["nw", 0, 0], ["n", 0.5, 0], ["ne", 1, 0], ["e", 1, 0.5], ["se", 1, 1], ["s", 0.5, 1], ["sw", 0, 1], ["w", 0, 0.5]];
  const handles = HANDLES.map(([dir, fx, fy]) => {
    const h = document.createElement("div"); h.setAttribute(UI, "");
    h.style.cssText = `position:fixed;z-index:2147483647;display:none;width:10px;height:10px;box-sizing:border-box;background:#fff;border:2px solid #7b61ff;border-radius:2px;cursor:${dir}-resize;touch-action:none`;
    h.addEventListener("pointerdown", (e) => startResize(e, dir));
    document.documentElement.appendChild(h); return { h, dir, fx, fy };
  });
  function refresh() {
    place(pick, selected, selected ? label(selected) : "");
    extras.forEach((b) => (b.d.style.display = "none"));
    multi.filter((m) => m !== selected).forEach((m, i) => { extras[i] = extras[i] || box("#7b61ff", true); place(extras[i], m, ""); });
    const show = editMode && selected && document.contains(selected) && selected !== document.body;
    const r = show && selected.getBoundingClientRect();
    handles.forEach(({ h, fx, fy }) => {
      h.style.display = show ? "block" : "none";
      if (show) { h.style.left = r.left + r.width * fx - 5 + "px"; h.style.top = r.top + r.height * fy - 5 + "px"; }
    });
  }

  // ---- selection info ------------------------------------------------------------------------------------------------
  const PROPS = ["color", "background-color", "font-size", "font-weight", "text-align", "padding-top", "border-top-left-radius", "border-top-width", "border-top-color", "box-shadow", "margin-top", "margin-bottom", "opacity", "display", "flex-direction", "gap", "align-items", "justify-content", "flex-wrap", "width", "height"];
  function info(el) {
    const cs = getComputedStyle(el), styles = {};
    for (const p of PROPS) styles[p] = cs.getPropertyValue(p);
    const similar = el.classList.length ? part(el) : null;
    let count = 1; try { count = similar ? document.querySelectorAll(similar).length : 1; } catch {}
    const kebab = el.closest(".pg-kebab");
    const isKebab = el.matches(".pg-kebab");
    return {
      id: idOf(el), selector: selectorFor(el), similar, similarCount: count, tag: el.tagName.toLowerCase(), label: label(el),
      text: ownText(el).slice(0, 60), styles, container: isContainer(el), childCount: el.childElementCount,
      index: el.parentElement ? indexIn(el) : 0, siblings: el.parentElement ? kids(el.parentElement).length : 1,
      icon: isIcon(el), group: el.hasAttribute("data-pg-group"), multi: multi.length,
      selectors: multi.map(selectorFor), multiIds: multi.map(idOf), groupable: multi.every((m) => m.parentElement === multi[0].parentElement),
      kebab: isKebab || !!kebab,
      items: isKebab ? [...el.querySelectorAll("ul > li")].map((li) => ({ label: li.textContent.replace(li.querySelector("span")?.textContent ?? "", "").trim(), icon: li.querySelector("span")?.textContent.trim() ?? "" })) : null,
    };
  }
  const sendInfo = () => send({ type: "playground:select", info: selected ? info(selected) : null });
  function choose(el, add) {
    if (selected && selected.matches?.(".pg-kebab")) selected.open = false;
    if (add && el && el !== selected) multi = multi.includes(el) ? multi.filter((m) => m !== el) : [...multi, el];
    else multi = el ? [el] : [];
    selected = el;
    if (el && el.matches(".pg-kebab")) el.open = true; // show the menu while it is selected
    refresh(); sendInfo();
  }

  // ---- layers tree -----------------------------------------------------------------------------------------------------
  const SKIP = new Set(["SCRIPT", "STYLE", "LINK", "META", "NOSCRIPT", "TEMPLATE", "HEAD", "BR"]);
  function tree() {
    let n = 0;
    const walk = (el, depth) => {
      if (n++ > 600) return null;
      const inSvg = el.tagName.toLowerCase() === "svg";
      return { id: idOf(el), tag: el.tagName.toLowerCase(), name: label(el).split(" · ")[0], text: ownText(el).slice(0, 28), hidden: getComputedStyle(el).display === "none",
        children: depth > 14 || inSvg ? [] : kids(el).filter((c) => !SKIP.has(c.tagName)).map((c) => walk(c, depth + 1)).filter(Boolean) };
    };
    return kids(document.body).filter((c) => !SKIP.has(c.tagName)).map((c) => walk(c, 0)).filter(Boolean);
  }
  let treeTimer = 0;
  const scheduleTree = () => { clearTimeout(treeTimer); treeTimer = setTimeout(() => editMode && send({ type: "playground:tree", nodes: tree() }), 120); };
  new MutationObserver(() => scheduleTree()).observe(document.documentElement, { childList: true, subtree: true });

  // ---- pointer: select, drag to move, resize ---------------------------------------------------------------------------
  const target = (e) => { const el = e.target; return el instanceof Element && !isUi(el) && el !== document.documentElement ? el : null; };
  let drag = null;
  const mainAxisY = (p) => { const cs = getComputedStyle(p); return !(cs.display.includes("flex") && cs.flexDirection.startsWith("row")); };
  function dropAt(x, y, dragged) {
    const prev = dragged.style.pointerEvents; dragged.style.pointerEvents = "none";
    let t = document.elementFromPoint(x, y); dragged.style.pointerEvents = prev;
    if (!t || isUi(t) || dragged.contains(t)) return null;
    let parent, ref;
    if (t === document.documentElement) t = document.body;
    if (t === document.body || (isContainer(t) && !["BUTTON", "A", "SUMMARY"].includes(t.tagName) && (kids(t).length === 0 || t.contains(document.elementFromPoint(x, y))))) parent = t;
    else parent = t.parentElement;
    if (!parent || dragged.contains(parent)) return null;
    const list = kids(parent).filter((c) => c !== dragged), vertical = mainAxisY(parent);
    let index = list.length;
    for (let i = 0; i < list.length; i++) { const r = list[i].getBoundingClientRect(); if ((vertical ? y : x) < (vertical ? r.top + r.height / 2 : r.left + r.width / 2)) { index = i; break; } }
    ref = list[index] || null;
    return { parent, index, ref, last: list[list.length - 1], vertical };
  }
  function showDrop(d) {
    if (!d) { line.style.display = "none"; return; }
    const pr = d.parent.getBoundingClientRect(); let r, before = true;
    if (d.ref) r = d.ref.getBoundingClientRect(); else if (d.last) { r = d.last.getBoundingClientRect(); before = false; } else r = pr;
    const s = line.style; s.display = "block";
    if (d.vertical) { s.left = r.left + "px"; s.width = r.width + "px"; s.height = "3px"; s.top = (before ? r.top : r.bottom) - 1 + "px"; }
    else { s.top = r.top + "px"; s.height = r.height + "px"; s.width = "3px"; s.left = (before ? r.left : r.right) - 1 + "px"; }
    place(hover, d.parent, "Drop inside " + label(d.parent));
  }
  addEventListener("pointerdown", (e) => {
    if (!editMode || editing || e.button !== 0) return;
    const el = target(e); if (!el) return;
    e.preventDefault(); e.stopPropagation();
    const t = el === document.body ? null : el;
    if (!t) { choose(null); return; }
    if (e.shiftKey) { choose(t, true); return; }
    drag = { el: t, x: e.clientX, y: e.clientY, moved: false, wasSelected: t === selected };
  }, true);
  addEventListener("pointermove", (e) => {
    if (!editMode) return;
    if (drag && !drag.resize) {
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5) { drag.moved = true; if (!drag.wasSelected) choose(drag.el); }
      if (drag.moved) { drag.drop = dropAt(e.clientX, e.clientY, drag.el); showDrop(drag.drop); }
      return;
    }
    if (!drag) { const el = target(e); place(hover, el && el !== selected && el !== document.body ? el : null, el ? label(el) : ""); }
  }, true);
  addEventListener("pointerup", () => {
    if (!drag || drag.resize) return;
    const d = drag; drag = null; line.style.display = "none"; place(hover, null);
    if (d.moved && d.drop) moveTo(d.el, d.drop.parent, d.drop.index);
    else if (!d.moved) choose(d.el);
  }, true);
  addEventListener("click", (e) => { if (editMode && !editing) { e.preventDefault(); e.stopPropagation(); } }, true);
  addEventListener("dblclick", (e) => {
    if (!editMode) return;
    const el = target(e); if (!el || el.childElementCount || !el.textContent.trim()) return;
    e.preventDefault(); e.stopPropagation();
    editing = { el, from: el.textContent };
    el.contentEditable = "true"; el.focus();
    getSelection().selectAllChildren(el);
    const finish = (cancel) => {
      el.removeEventListener("blur", onBlur); el.removeEventListener("keydown", onKey);
      el.removeAttribute("contenteditable");
      const to = el.textContent; editing = null;
      if (cancel) { el.textContent = editing?.from ?? to; return; }
      el.textContent = editing ? "" : ""; // reset below via text op
      el.textContent = to;
      const from = e._from ?? ""; void from;
    };
    const original = el.textContent;
    const onBlur = () => { const to = el.textContent; el.removeAttribute("contenteditable"); el.removeEventListener("blur", onBlur); el.removeEventListener("keydown", onKey); editing = null; el.textContent = original; retext(el, to); };
    const onKey = (k) => { if (k.key === "Enter") { k.preventDefault(); el.blur(); } if (k.key === "Escape") { k.preventDefault(); el.textContent = original; el.blur(); } };
    void finish;
    el.addEventListener("blur", onBlur); el.addEventListener("keydown", onKey);
  }, true);

  function startResize(e, dir) {
    if (!selected) return;
    e.preventDefault(); e.stopPropagation();
    const el = selected, r = el.getBoundingClientRect(), sx = e.clientX, sy = e.clientY, prev = { w: el.style.getPropertyValue("width"), h: el.style.getPropertyValue("height") };
    drag = { resize: true };
    const move = (m) => {
      let w = r.width, h = r.height;
      if (dir.includes("e")) w = r.width + (m.clientX - sx); if (dir.includes("w")) w = r.width - (m.clientX - sx);
      if (dir.includes("s")) h = r.height + (m.clientY - sy); if (dir.includes("n")) h = r.height - (m.clientY - sy);
      if (dir.length === 1 ? "ew".includes(dir) : true) el.style.setProperty("width", Math.max(8, Math.round(w)) + "px", "important");
      if (dir.length === 1 ? "ns".includes(dir) : true) el.style.setProperty("height", Math.max(8, Math.round(h)) + "px", "important");
      refresh();
    };
    const up = () => {
      removeEventListener("pointermove", move, true); removeEventListener("pointerup", up, true);
      const props = {}, w = el.style.getPropertyValue("width"), h = el.style.getPropertyValue("height");
      if (w !== prev.w) props.width = w; if (h !== prev.h) props.height = h;
      el.style.setProperty("width", prev.w); el.style.setProperty("height", prev.h);
      if (!prev.w) el.style.removeProperty("width"); if (!prev.h) el.style.removeProperty("height");
      drag = null;
      if (Object.keys(props).length) send({ type: "playground:style", selector: selectorFor(el), props });
    };
    addEventListener("pointermove", move, true); addEventListener("pointerup", up, true);
  }

  addEventListener("keydown", (e) => {
    if (!editMode || editing) return;
    const mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
    if (e.key === "Escape") { choose(null); return; }
    if (!selected && !(mod && k === "z")) return;
    let handled = true;
    if (e.key === "Delete" || e.key === "Backspace") [...(multi.length ? multi : [selected])].forEach(del);
    else if (mod && k === "d") [...(multi.length ? multi : [selected])].forEach(dup);
    else if (mod && k === "g") (e.shiftKey ? ungroup(selected) : group(multi, "column"));
    else if (mod && k === "z") (e.shiftKey ? redo() : undo());
    else if (mod && k === "y") redo();
    else if (e.altKey && e.key === "ArrowUp") moveBy(selected, -1);
    else if (e.altKey && e.key === "ArrowDown") moveBy(selected, 1);
    else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  addEventListener("scroll", refresh, true); addEventListener("resize", refresh);

  // ---- messages from the playground -------------------------------------------------------------------------------------
  addEventListener("message", (e) => {
    if (e.origin !== origin || e.source !== window.parent) return;
    const m = e.data;
    if (!m) return;
    if (m.type === "playground:select-parent") {
      const up = selected && selected.parentElement;
      if (up && up !== document.documentElement) choose(up);
      return;
    }
    if (m.type === "playground:do") {
      const c = m.cmd, el = m.id != null ? byId(m.id) : selected;
      if (c === "select") choose(el, !!m.add);
      else if (c === "tree") send({ type: "playground:tree", nodes: tree() });
      else if (c === "up") el && moveBy(el, -1);
      else if (c === "down") el && moveBy(el, 1);
      else if (c === "duplicate") (multi.length > 1 ? [...multi] : [el]).forEach(dup);
      else if (c === "delete") (multi.length > 1 && multi.includes(el) ? [...multi] : [el]).forEach(del);
      else if (c === "group") group(multi.length ? multi : el ? [el] : [], m.layout);
      else if (c === "ungroup") ungroup(el);
      else if (c === "insert") insert(m.html, m.kind, m.where);
      else if (c === "text") el && retext(el, m.text);
      else if (c === "items") el && items(el.closest(".pg-kebab") || el, m.items);
      else if (c === "move") { const t = byId(m.targetId); if (el && t) { const p = m.pos === "inside" ? t : t.parentElement; moveTo(el, p, m.pos === "inside" ? kids(t).filter((x) => x !== el).length : kids(p).filter((x) => x !== el).indexOf(t) + (m.pos === "after" ? 1 : 0)); } }
      else if (c === "hide" && el) send({ type: "playground:style", selector: selectorFor(el), props: { display: getComputedStyle(el).display === "none" ? null : "none" } });
      else if (c === "undo") undo();
      else if (c === "redo") redo();
      else if (c === "undo-all") undoAll();
      else if (c === "replay") replay(m.ops || []);
      return;
    }
    if (m.type !== "playground:apply") return;
    document.head.appendChild(style); document.head.appendChild(edits); document.head.appendChild(lib); // last in <head>, so they win the cascade
    style.textContent = String(m.css);
    edits.textContent = String(m.editCss || "");
    document.documentElement.classList.toggle("dark", !!m.dark);
    const was = editMode; editMode = !!m.edit;
    if (!editMode) { choose(null); place(hover, null); line.style.display = "none"; }
    else { if (!was) scheduleTree(); requestAnimationFrame(() => { refresh(); if (selected) sendInfo(); }); }
    for (const href of m.fonts || []) {
      if (fonts.has(href) || !/^https:\/\/fonts\.googleapis\.com\//.test(href)) continue;
      const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href });
      document.head.appendChild(link); fonts.set(href, link);
    }
  });
  send({ type: "playground:ready" });
})();
