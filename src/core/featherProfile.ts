import type { ExcalidrawSettings } from "./settingsDefaults";
import { DEVICE } from "src/constants/constants";

/**
 * Resolved Feather performance profile. The user-facing setting allows
 * "auto"; the runtime protocol only carries resolved profiles.
 */
export type FeatherProfile = "high" | "balanced" | "eink" | "lowend";

/**
 * Resolves the configured Feather profile, inferring a sensible default from
 * the device when the setting is "auto".
 *
 * @remarks
 * Auto resolution uses the Obsidian Platform API only: mobile devices get
 * `balanced` (or `lowend` when `navigator.deviceMemory` reports 4 GB or less)
 * and desktops get `high`. E-ink devices such as Boox/Onyx cannot be detected
 * through the accepted Obsidian APIs, so `eink` is an explicit user choice;
 * the diagnostics overlay records pointer behavior to guide that choice.
 */
export const resolveFeatherProfile = (
  settings: ExcalidrawSettings,
): FeatherProfile => {
  if (settings.featherProfile !== "auto") {
    return settings.featherProfile;
  }
  if (DEVICE.isMobile) {
    const deviceMemory = (
      window.navigator as Navigator & { deviceMemory?: number }
    ).deviceMemory;
    if (typeof deviceMemory === "number" && deviceMemory <= 4) {
      return "lowend";
    }
    return "balanced";
  }
  return "high";
};

/**
 * Maps a profile to the image decode budget used by the Excalidraw runtime.
 *
 * @remarks
 * The budgets are deliberately conservative on low-memory devices; the runtime
 * evicts off-screen previews first, so visible images are never dropped.
 */
export const getFeatherImageBudgetBytes = (
  profile: FeatherProfile,
): number => {
  switch (profile) {
    case "eink":
      return 96 * 1024 * 1024;
    case "lowend":
      return 64 * 1024 * 1024;
    case "balanced":
      return 160 * 1024 * 1024;
    case "high":
    default:
      return 256 * 1024 * 1024;
  }
};
