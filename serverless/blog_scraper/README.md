# Blog RSS Scraper

This Lambda function ingests RSS feeds into a Directus CMS instance. It's specifically configured to pull from the "Have I Been Flocked?" RSS feed and sync the posts with your Directus blog collection.

## Features

- **RSS Feed Parsing**: Extracts title, link, pubDate, and description from RSS entries
- **Directus Integration**: Creates, updates, and deletes blog posts via Directus API
- **Idempotent Operation**: Safe to run multiple times - only makes necessary changes
- **Selective Sync**: Only manages RSS-ingested posts (identified by `externalUrl` field)
- **Error Handling**: Comprehensive logging and error recovery

## Setup

### Environment Variables

Set the following environment variables:

```bash
# Required
DIRECTUS_API_TOKEN=your_directus_api_token_here

# Optional (defaults to https://cms.deflock.me)
DIRECTUS_BASE_URL=https://your-directus-instance.com
```

### Directus Collection Schema

Your Directus `blog` collection should have the following fields:

- `id` (integer, auto-increment)
- `title` (string, required)
- `description` (text)
- `content` (rich text, optional - RSS posts will have this as null)
- `externalUrl` (string, optional - identifies RSS-ingested posts)
- `date_created` (datetime)

### Dependencies

Install dependencies using pip:

```bash
pip install feedparser requests python-dateutil
```

Or use the pyproject.toml file:

```bash
pip install -e .
```

## Usage

### Local Testing

```bash
python main.py
```

### AWS Lambda

Deploy as a Python 3.14 Lambda function. The `lambda_handler` function serves as the entry point.

#### Sample Lambda Event

The function doesn't require any specific event data:

```json
{}
```

#### Sample Response

Success:
```json
{
  "statusCode": 200,
  "body": {
    "message": "RSS synchronization completed successfully",
    "stats": {
      "created": 2,
      "updated": 1,
      "deleted": 0,
      "errors": 0
    }
  }
}
```

Error:
```json
{
  "statusCode": 500,
  "body": {
    "message": "RSS synchronization failed",
    "error": "DIRECTUS_API_TOKEN environment variable is required"
  }
}
```

## How It Works

1. **Fetch RSS Feed**: Downloads and parses the RSS feed from `https://haveibeenflocked.com/feed.xml`

2. **Get Existing Posts**: Queries Directus for all blog posts that have an `externalUrl` (these are RSS-managed posts)

3. **Synchronization**:
   - **Create**: New RSS entries that don't exist in Directus
   - **Update**: Existing posts where title or description has changed
   - **Delete**: Directus posts with `externalUrl` that no longer exist in the RSS feed

4. **Preserve Manual Posts**: Posts without an `externalUrl` are left untouched

## RSS Feed Structure

The scraper expects standard RSS 2.0 format with the following elements:
- `<title>`: Post title
- `<link>`: Post URL (becomes `externalUrl`)
- `<pubDate>`: Publication date (becomes `date_created`)
- `<description>` or `<content>`: Post description (HTML tags are stripped)

## Error Handling

- Invalid dates are logged as warnings but don't stop processing
- Individual post errors are logged and counted but don't stop the entire sync
- HTTP errors from Directus API are logged with full details
- Missing environment variables cause immediate failure with clear error messages

## Logging

The function uses Python's standard logging module with INFO level. Key events logged:

- RSS feed fetch status
- Number of entries parsed
- Create/update/delete operations
- Errors and warnings
- Final synchronization statistics

## Security Considerations

- Store the Directus API token securely (AWS Secrets Manager recommended for production)
- Use HTTPS for all API communications (enforced by default)
- The function only modifies posts with `externalUrl` - manual posts are safe
- Consider rate limiting if running frequently

## Deployment

### AWS Lambda Deployment Package

1. Create a deployment package:
```bash
pip install -r requirements.txt -t package/
cp main.py package/
cd package && zip -r ../blog-scraper.zip .
```

2. Upload to AWS Lambda with Python 3.14 runtime

### Environment Variables in Lambda

Set in the Lambda function configuration:
- `DIRECTUS_API_TOKEN`: Your Directus API token
- `DIRECTUS_BASE_URL`: Your Directus instance URL (optional)

### Scheduling

Consider setting up a CloudWatch Events rule to run this function periodically (e.g., every hour or daily).

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your `DIRECTUS_API_TOKEN`
2. **404 Not Found**: Verify `DIRECTUS_BASE_URL` and collection name (`blog`)
3. **RSS Parse Errors**: Check if the RSS feed is accessible and valid
4. **Date Parse Failures**: Usually logged as warnings and don't stop processing

### Testing Connection

The function will fail fast if it can't connect to Directus, making debugging easier.

## Development

### Local Development Setup

```bash
# Clone and navigate to the blog_scraper directory
cd serverless/blog_scraper

# Install dependencies
pip install -e .

# Set environment variables
export DIRECTUS_API_TOKEN="your_token"
export DIRECTUS_BASE_URL="https://cms.deflock.me"

# Run locally
python main.py
```

### Testing with Different RSS Feeds

To test with a different RSS feed, modify the `rss_url` in the `BlogScraper.__init__` method.
