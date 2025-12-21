# /// script
# requires-python = ">=3.14"
# dependencies = [
#     "boto3",
#     "requests",
# ]
# ///
import json
import requests
import boto3

def fetch_alpr_count(usa_only=False):
  overpass_url = "https://overpass-api.de/api/interpreter"
  overpass_query = f"""
  [out:json][timeout:180];
  {'area["ISO3166-1"="US"]->.searchArea;' if usa_only else ''}
  node["man_made"="surveillance"]["surveillance:type"="ALPR"]{f'(area.searchArea)' if usa_only else ''};
  out count;
  """

  response = requests.get(overpass_url, params={'data': overpass_query})

  if response.status_code == 200:
    response_json = response.json()
    try:
      return response_json['elements'][0]['tags']['nodes']
    except (IndexError, KeyError):
      raise RuntimeError("Could not find 'elements[0].tags.nodes' in the response.")
  else:
    raise RuntimeError(f"Failed to fetch data from Overpass API. Status code: {response.status_code}")

def lambda_handler(event, context):
  try:
    us_alprs = fetch_alpr_count(usa_only=True)
    worldwide_alprs = fetch_alpr_count()
  except Exception as e:
    return {
      'statusCode': 500,
      'body': f"Failed to fetch ALPR counts: {str(e)}",
    }

  all_alprs = {
    'us': us_alprs,
    'worldwide': worldwide_alprs
  }

  s3 = boto3.client('s3')
  bucket = 'cdn.deflock.me'
  key = 'alpr-counts.json'

  s3.put_object(
    Bucket=bucket,
    Key=key,
    Body=json.dumps(all_alprs),
    ContentType='application/json'
  )

  return {
    'statusCode': 200,
    'body': 'Successfully fetched ALPR counts.',
  }

if __name__=="__main__":
  print(f"{fetch_alpr_count(usa_only=True)} ALPR's in the US")
  print(f"{fetch_alpr_count(usa_only=False)} ALPR's worldwide")

