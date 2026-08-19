import { describe, expect, test } from "bun:test";
import type { BoundingBoxLiteral } from "../../services/apiService";
import type { ALPR } from "../../types";
import {
  cameraAriaLabel,
  clusterAriaLabel,
  filterCamerasInBounds,
  isActivationKey,
  paginateCameras,
} from "../mapAccessibility";

const camera = (id: string, lat: number, lon: number, tags: Record<string, string> = {}): ALPR => ({
  id,
  lat,
  lon,
  tags,
  type: "camera",
});

describe("cameraAriaLabel", () => {
  test("describes a camera with its vendor, operator, and coordinates", () => {
    const alpr = camera("camera-1", 47.6062, -122.3321, {
      manufacturer: "Flock Safety",
      operator: "Seattle Police Department",
    });

    expect(cameraAriaLabel(alpr)).toBe(
      "Camera: Flock Safety; operated by Seattle Police Department; coordinates 47.60620, -122.33210",
    );
  });

  test("uses useful fallbacks when vendor and operator are unknown", () => {
    expect(cameraAriaLabel(camera("camera-2", 0, 0))).toBe(
      "Camera: unknown vendor; operated by unknown operator; coordinates 0.00000, 0.00000",
    );
  });
});

describe("clusterAriaLabel", () => {
  test("uses singular and plural camera wording", () => {
    expect(clusterAriaLabel(1)).toBe("1 camera");
    expect(clusterAriaLabel(7)).toBe("7 cameras");
  });
});

describe("isActivationKey", () => {
  test("accepts Enter and Space while rejecting unrelated keys", () => {
    expect(isActivationKey("Enter")).toBe(true);
    expect(isActivationKey(" ")).toBe(true);
    expect(isActivationKey("Escape")).toBe(false);
    expect(isActivationKey("ArrowDown")).toBe(false);
  });
});

describe("filterCamerasInBounds", () => {
  test("includes cameras on every boundary and excludes cameras outside", () => {
    const bounds: BoundingBoxLiteral = {
      minLat: 10,
      maxLat: 20,
      minLng: 30,
      maxLng: 40,
    };
    const cameras = [
      camera("south-west", 10, 30),
      camera("north-east", 20, 40),
      camera("inside", 15, 35),
      camera("too-far-north", 20.00001, 35),
      camera("too-far-west", 15, 29.99999),
    ];

    expect(filterCamerasInBounds(cameras, bounds).map(({ id }) => id)).toEqual([
      "south-west",
      "north-east",
      "inside",
    ]);
  });
});

describe("paginateCameras", () => {
  test("returns stable one-based pages and empty results when no page exists", () => {
    const cameras = [
      camera("first", 1, 1),
      camera("second", 2, 2),
      camera("third", 3, 3),
      camera("fourth", 4, 4),
      camera("fifth", 5, 5),
    ];

    expect(paginateCameras(cameras, { page: 2, pageSize: 2 }).map(({ id }) => id)).toEqual([
      "third",
      "fourth",
    ]);
    expect(paginateCameras(cameras, { page: 3, pageSize: 2 }).map(({ id }) => id)).toEqual(["fifth"]);
    expect(paginateCameras(cameras, { page: 4, pageSize: 2 })).toEqual([]);
    expect(paginateCameras([], { page: 1, pageSize: 2 })).toEqual([]);
  });
});
