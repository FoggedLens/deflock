interface DeflockProfile {
  name: string;
  tags: Record<string, string>;
  requiresDirection: boolean;
  submittable: boolean;
  fov: number | null;
}

interface DeflockProfileOptions {
  requiresDirection?: boolean;
  fov?: number | null;
}

export function createDeflockProfileUrl(name: string, osmTags: Record<string, string>, options?: DeflockProfileOptions): string {
  const { requiresDirection = true, fov = null } = options || {};

  const profile: DeflockProfile = {
    name,
    tags: osmTags,
    submittable: true,
    requiresDirection,
    fov
  };
  const payload = btoa(JSON.stringify(profile));
  return `deflockapp://profiles/add?p=${payload}`;
}