import json
import gzip
import os

import requests
import boto3

OVERPASS_URL = "http://overpass-api.de/api/interpreter"
OVERPASS_QUERY = '[out:json];node["man_made"="surveillance"]["surveillance:type"="ALPR"];out body;'
USER_AGENT = "DeFlock/1.0"

WHITELISTED_TAGS = [
    "operator",
    "manufacturer",
    "direction",
    "brand",
    "camera:direction",
    "surveillance:brand",
    "surveillance:operator",
    "surveillance:manufacturer",
    "wikimedia_commons",
]

OUTPUT_KEY = "all_alpr.geojson"


def get_all_nodes():
    response = requests.post(
        OVERPASS_URL,
        data={"data": OVERPASS_QUERY},
        headers={"User-Agent": USER_AGENT},
        timeout=120,
    )
    response.raise_for_status()
    return response.json()["elements"]


def build_geojson():
    nodes = get_all_nodes()
    features = []
    for node in nodes:
        properties = {"id": node["id"]}
        properties.update(
            {k: v for k, v in node.get("tags", {}).items() if k in WHITELISTED_TAGS}
        )
        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [node["lon"], node["lat"]],  # GeoJSON = [lon, lat]
                },
                "properties": properties,
            }
        )
    return {"type": "FeatureCollection", "features": features}


def lambda_handler(event, context):
    geojson = build_geojson()
    body = gzip.compress(json.dumps(geojson).encode("utf-8"))

    s3 = boto3.client("s3")
    s3.put_object(
        Bucket=os.getenv("OUTPUT_BUCKET", "cdn.deflock.me"),
        Key=OUTPUT_KEY,
        Body=body,
        ContentType="application/geo+json",
        ContentEncoding="gzip",
    )

    return {
        "statusCode": 200,
        "body": json.dumps({"features": len(geojson["features"])}),
    }


if __name__ == "__main__":
    geojson = build_geojson()
    with open("all_alpr.geojson", "w") as f:
        json.dump(geojson, f)
    print(f"Wrote {len(geojson['features'])} features to all_alpr.geojson")
