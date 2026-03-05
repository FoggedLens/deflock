# MapLibre Migration -- New Infrastructure Setup

Everything below is new from the migration. Existing webapp/API deployment is unchanged.

---

## Local Dev: Camera Data

The webapp now loads a single GeoJSON file instead of tiled region files. In dev mode, Vite serves it from `webapp/public/`.

Generate it locally:

```bash
cd serverless/alpr_geojson/src
pip install requests
python alpr_geojson.py
mv all_alpr.geojson ../../../webapp/public/all_alpr.geojson
```

If `boto3` import fails (it's only needed for the Lambda S3 upload), install it (`pip install boto3`) or run this standalone version that skips it:

```bash
cd webapp/public
python3 -c "
import json, requests
r = requests.post('https://overpass-api.de/api/interpreter',
    data={'data': '[out:json][timeout:180];node[\"man_made\"=\"surveillance\"][\"surveillance:type\"=\"ALPR\"];out body;'},
    headers={'User-Agent': 'DeFlock/1.0'}, timeout=180)
r.raise_for_status()
nodes = r.json()['elements']
whitelist = ['operator','manufacturer','direction','brand','camera:direction','surveillance:brand','surveillance:operator','surveillance:manufacturer','wikimedia_commons']
features = [{'type':'Feature','geometry':{'type':'Point','coordinates':[n['lon'],n['lat']]},'properties':{'id':n['id'],**{k:v for k,v in n.get('tags',{}).items() if k in whitelist}}} for n in nodes]
with open('all_alpr.geojson','w') as f: json.dump({'type':'FeatureCollection','features':features}, f)
print(f'Wrote {len(features)} features')
"
```

If the main Overpass endpoint 504s, swap the URL for `https://maps.mail.ru/osm/tools/overpass/api/interpreter`.

The store (`webapp/src/stores/geojson.ts`) switches URL automatically:
- **Dev:** `/all_alpr.geojson` (Vite static file)
- **Prod:** `https://cdn.deflock.me/all_alpr.geojson`

---

## Production: `alpr_geojson` Lambda

New Lambda that replaces the tiled data approach. Runs every 60 minutes, queries Overpass for all ALPR cameras, gzip-compresses the result, and uploads to `s3://cdn.deflock.me/all_alpr.geojson`.

### 1. Provision with Terraform

The module is already wired into `terraform/main.tf` (lines 26-32).

```bash
cd terraform
terraform plan
terraform apply
```

This creates:
- ECR repo: `alpr_geojson-lambda`
- Lambda: `alpr_geojson` (ARM64, 512MB, 180s timeout)
- CloudWatch schedule: every 60 minutes
- CloudWatch logs: 14-day retention
- SNS error alarm wired to existing `lambda_alarms_topic`

### 2. Build and push the container

```bash
ECR_URL=$(aws ecr describe-repositories \
  --repository-names alpr_geojson-lambda \
  --query 'repositories[0].repositoryUri' --output text)

aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin "$ECR_URL"

cd serverless/alpr_geojson/src
docker build --platform linux/arm64 -t alpr-geojson .
docker tag alpr-geojson:latest "$ECR_URL:latest"
docker push "$ECR_URL:latest"

aws lambda update-function-code \
  --function-name alpr_geojson \
  --image-uri "$ECR_URL:latest" \
  --region us-east-1
```

### 3. Verify

```bash
aws lambda invoke --function-name alpr_geojson /tmp/response.json
cat /tmp/response.json
# {"statusCode": 200, "body": "{\"features\": ~88000}"}

aws s3 ls s3://cdn.deflock.me/all_alpr.geojson
```

The file is uploaded with `Content-Encoding: gzip` so browsers decompress automatically through Cloudflare.

---

## New files at a glance

| Path | What |
|------|------|
| `serverless/alpr_geojson/src/alpr_geojson.py` | Lambda handler + local `__main__` |
| `serverless/alpr_geojson/src/requirements.txt` | `requests`, `boto3` |
| `serverless/alpr_geojson/src/Dockerfile` | AWS Lambda Python 3.14 ARM64 image |
| `terraform/modules/alpr_geojson/` | IAM, Lambda, ECR, CloudWatch, SNS alarm |
| `webapp/src/stores/geojson.ts` | Replaces `tiles.ts` -- single fetch, progress tracking |
| `webapp/src/utils/directionCones.ts` | Direction parsing + geographic cone polygons |
| `webapp/src/components/MapLibreMap.vue` | Replaces `LeafletMap.vue` |
