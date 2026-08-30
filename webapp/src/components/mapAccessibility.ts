import type { BoundingBoxLiteral } from "../services/apiService";
import type { ALPR } from "../types";

type CameraTags = ALPR["tags"];

export function getCameraManufacturer(tags: CameraTags): string | undefined {
  return tags.manufacturer ||
    tags["surveillance:manufacturer"] ||
    tags.brand ||
    tags["surveillance:brand"];
}

export function getCameraOperator(tags: CameraTags): string | undefined {
  return tags.operator || tags["surveillance:operator"];
}

export function cameraAriaLabel(camera: ALPR): string {
  const vendor = getCameraManufacturer(camera.tags) || "unknown vendor";
  const operator = getCameraOperator(camera.tags) || "unknown operator";

  return `Camera: ${vendor}; operated by ${operator}; coordinates ${camera.lat.toFixed(5)}, ${camera.lon.toFixed(5)}`;
}

export function clusterAriaLabel(count: number): string {
  return `${count} ${count === 1 ? "camera" : "cameras"}`;
}

export function isActivationKey(key: string): boolean {
  return key === "Enter" || key === " ";
}

export function filterCamerasInBounds(
  cameras: ALPR[],
  bounds: BoundingBoxLiteral,
): ALPR[] {
  return cameras.filter(
    ({ lat, lon }) =>
      lat >= bounds.minLat &&
      lat <= bounds.maxLat &&
      lon >= bounds.minLng &&
      lon <= bounds.maxLng,
  );
}

export function paginateCameras(
  cameras: ALPR[],
  { page, pageSize }: { page: number; pageSize: number },
): ALPR[] {
  const start = (page - 1) * pageSize;
  return cameras.slice(start, start + pageSize);
}
