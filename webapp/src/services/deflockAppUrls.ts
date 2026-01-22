import { lprBaseTags } from "@/constants";

interface DeflockProfileTags {
  name: string;
  tags: Record<string, string>;
  requiresDirection: boolean;
  submittable: boolean;
  fov: number;
}

export function createDeflockProfileUrl(name: string, obj: Record<string, string>): string {
  const tags = { ...lprBaseTags, ...obj };
  const profile: DeflockProfileTags = {
    name,
    tags,
    requiresDirection: true,
    submittable: true,
    fov: 90.0,
  };
  const payload = btoa(JSON.stringify(profile));
  return `deflockapp://profiles/add?p=${payload}`;
}