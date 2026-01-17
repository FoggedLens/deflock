import { lprBaseTags } from "@/constants";

export function createDeflockProfileUrl(obj: Record<string, string>): string {
  const tags = { ...lprBaseTags, ...obj };
  const payload = btoa(JSON.stringify(tags));
  return `deflockapp://profiles/add?p=${payload}`;
}