export const LAND_USE_COLORS: Record<string, string> = {
  residential: "#14b8a6",
  commercial: "#f59e0b",
  mixed: "#818cf8",
  vacant: "#64748b",
  "open-space": "#22c55e",
};

export const OCCUPANCY_COLORS: Record<string, string> = {
  occupied: "#34d399",
  vacant: "#f87171",
  rented: "#60a5fa",
};

export function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}
