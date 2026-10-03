import { mr } from "./mr";
import { hi } from "./hi";
import { en } from "./en";

export type Locale = "mr" | "hi" | "en";

export const dictionaries: Record<Locale, Record<string, string>> = {
  mr,
  hi,
  en,
};

export const localeLanguages: Record<Locale, { label: string; bcp47: string; code: Locale }> = {
  mr: { label: "मराठी", bcp47: "mr-IN", code: "mr" },
  hi: { label: "हिंदी", bcp47: "hi-IN", code: "hi" },
  en: { label: "English", bcp47: "en-IN", code: "en" },
};
