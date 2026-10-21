// Semantic color pairs and boundary tokens: shown in the Color section and editable in the Customize panel.
export const PAIRS: { fill: string; fg: string; label: string; min: number }[] = [
  { fill: "--background", fg: "--foreground", label: "Background", min: 4.5 },
  { fill: "--surface", fg: "--foreground", label: "Surface", min: 4.5 },
  { fill: "--muted", fg: "--muted-foreground", label: "Muted", min: 4.5 },
  { fill: "--primary", fg: "--primary-foreground", label: "Primary", min: 4.5 },
  { fill: "--secondary", fg: "--secondary-foreground", label: "Secondary", min: 4.5 },
  { fill: "--accent", fg: "--accent-foreground", label: "Accent", min: 4.5 },
  { fill: "--destructive", fg: "--destructive-foreground", label: "Destructive", min: 4.5 },
  { fill: "--success", fg: "--success-foreground", label: "Success", min: 4.5 },
  { fill: "--warning", fg: "--warning-foreground", label: "Warning", min: 4.5 },
  { fill: "--info", fg: "--info-foreground", label: "Info", min: 4.5 },
];

export const LINES: { token: string; label: string; min: number }[] = [
  { token: "--border", label: "Border (decorative)", min: 0 },
  { token: "--input", label: "Input boundary", min: 3 },
  { token: "--ring", label: "Focus ring", min: 3 },
];
