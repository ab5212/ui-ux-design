import { useEffect, useState } from "react";

// Element edits made in the "Your app" view: { selector: { cssProperty: value } }. Saved as playground-overrides.css.
export type Edits = Record<string, Record<string, string>>;
export interface Selection {
  id: number; selector: string; similar: string | null; similarCount: number; tag: string; label: string; text: string; styles: Record<string, string>;
  container: boolean; childCount: number; index: number; siblings: number; icon: boolean; group: boolean; multi: number; kebab: boolean;
  items: { label: string; icon: string }[] | null;
}
export interface TreeNode { id: number; tag: string; name: string; text: string; hidden: boolean; children: TreeNode[] }
export interface OpsState { ops: Record<string, unknown>[]; canUndo: boolean; canRedo: boolean }

/** Send a command to the framed app (select, move, insert, delete, group, undo...). AppPreview forwards it. */
export const cmd = (detail: Record<string, unknown>) => dispatchEvent(new CustomEvent("playground:do", { detail }));
export const OPS_KEY = "playground-ops";

const KEY = "playground-edits";
export const EDIT_PROPS = ["color", "background-color", "font-size", "font-weight", "text-align", "padding", "border-radius", "border-width", "border-style", "border-color", "box-shadow", "margin-top", "margin-bottom", "opacity", "width", "height", "display", "flex-direction", "gap", "align-items", "justify-content", "flex-wrap"];

/** !important so an edit beats the app's own CSS whatever its specificity. */
export function editsCss(edits: Edits) {
  return Object.entries(edits)
    .filter(([, props]) => Object.keys(props).length)
    .map(([sel, props]) => `${sel} {\n${Object.entries(props).map(([k, v]) => `  ${k}: ${v} !important;`).join("\n")}\n}`)
    .join("\n");
}

export function useEdits() {
  const [edits, setEdits] = useState<Edits>(() => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(edits)); }, [edits]);
  const set = (selector: string, prop: string, value: string | null) =>
    setEdits((all) => {
      const props = { ...all[selector] };
      if (value === null) delete props[prop]; else props[prop] = value;
      const next = { ...all, [selector]: props };
      if (!Object.keys(props).length) delete next[selector];
      return next;
    });
  const clear = (selector?: string) => setEdits((all) => {
    if (!selector) return {};
    const { [selector]: _drop, ...rest } = all; return rest;
  });
  return { edits, set, clear };
}

export function useOpsState() {
  const [state, setState] = useState<OpsState>(() => { try { return { ops: JSON.parse(localStorage.getItem(OPS_KEY) || "[]"), canUndo: false, canRedo: false }; } catch { return { ops: [], canUndo: false, canRedo: false }; } });
  const update = (s: OpsState) => { localStorage.setItem(OPS_KEY, JSON.stringify(s.ops)); setState(s); };
  return [state, update] as const;
}
