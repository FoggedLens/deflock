interface DeflockProfileTags {
  name: string;
  tags: Record<string, string>;
  requiresDirection: boolean;
  submittable: boolean;
  fov: number | null;
}

export function createDeflockProfileUrl(name: string, osmTags: Record<string, string>): string {
  const profile: DeflockProfileTags = {
    name,
    tags: osmTags,
    requiresDirection: true,
    submittable: true,
    fov: null,
  };
  const payload = btoa(JSON.stringify(profile));
  return `deflockapp://profiles/add?p=${payload}`;
}