export interface ALPR {
  id: string;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  type: string;
};

export interface LprVendor {
  id: number;
  shortName: string;
  fullName: string;
  identificationHints?: string;
  urls: Array<{ url: string }>;
  logoUrl?: string;
  osmTags: Record<string, string>;
}

export interface OtherSurveillanceDevice {
  id: number;
  capabilities?: string;
  category: string;
  fov?: number;
  name: string;
  osmTags: Record<string, string>;
  requiresDirection: boolean;
  urls: Array<{ url: string }>;
}
