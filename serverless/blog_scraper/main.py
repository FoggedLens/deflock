import os
import logging
import feedparser
import requests
import json
from datetime import datetime
from dateutil import parser as date_parser
from typing import List, Dict, Optional
from urllib.parse import urlencode

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BlogScraper:
    """RSS feed scraper that ingests blog posts into Directus CMS"""
    
    def __init__(self):
        self.rss_url = "https://haveibeenflocked.com/feed.xml"
        self.directus_base_url = os.getenv("DIRECTUS_BASE_URL", "https://cms.deflock.me")
        self.directus_token = os.getenv("DIRECTUS_API_TOKEN")
        
        if not self.directus_token:
            raise ValueError("DIRECTUS_API_TOKEN environment variable is required")
        
        self.headers = {
            "Authorization": f"Bearer {self.directus_token}",
            "Content-Type": "application/json"
        }
    
    def fetch_rss_feed(self) -> feedparser.FeedParserDict:
        """Fetch and parse the RSS feed"""
        logger.info(f"Fetching RSS feed from {self.rss_url}")
        
        try:
            feed = feedparser.parse(self.rss_url)
            if feed.bozo:
                logger.warning(f"Feed parsing warning: {feed.bozo_exception}")
            
            logger.info(f"Successfully parsed RSS feed with {len(feed.entries)} entries")
            return feed
        except Exception as e:
            logger.error(f"Error fetching RSS feed: {e}")
            raise
    
    def get_existing_posts(self) -> List[Dict]:
        """Get all existing blog posts from Directus that have external URLs"""
        logger.info("Fetching existing blog posts from Directus")
        
        try:
            # Filter for posts that have an externalUrl (RSS-ingested posts)
            url = f"{self.directus_base_url}/items/blog"
            
            # Properly format the filter as JSON and URL encode it
            filter_obj = {
                "externalUrl": {
                    "_nnull": True  # not null
                }
            }
            
            params = {
                "filter": json.dumps(filter_obj),
                "limit": -1  # Get all records
            }
            
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            posts = data.get("data", [])
            logger.info(f"Found {len(posts)} existing RSS-ingested posts")
            return posts
            
        except Exception as e:
            logger.error(f"Error fetching existing posts: {e}")
            raise
    
    def create_blog_post(self, post_data: Dict) -> Optional[Dict]:
        """Create a new blog post in Directus"""
        logger.info(f"Creating new blog post: {post_data['title']}")
        
        try:
            url = f"{self.directus_base_url}/items/blog"
            response = requests.post(url, headers=self.headers, json=post_data)
            response.raise_for_status()
            
            created_post = response.json()
            logger.info(f"Successfully created blog post with ID: {created_post['data']['id']}")
            return created_post["data"]
            
        except Exception as e:
            logger.error(f"Error creating blog post: {e}")
            raise
    
    def update_blog_post(self, post_id: int, post_data: Dict) -> Optional[Dict]:
        """Update an existing blog post in Directus"""
        logger.info(f"Updating blog post ID {post_id}: {post_data['title']}")
        
        try:
            url = f"{self.directus_base_url}/items/blog/{post_id}"
            response = requests.patch(url, headers=self.headers, json=post_data)
            response.raise_for_status()
            
            updated_post = response.json()
            logger.info(f"Successfully updated blog post ID: {post_id}")
            return updated_post["data"]
            
        except Exception as e:
            logger.error(f"Error updating blog post ID {post_id}: {e}")
            raise
    
    def delete_blog_post(self, post_id: int) -> None:
        """Delete a blog post from Directus"""
        logger.info(f"Deleting blog post ID {post_id}")
        
        try:
            url = f"{self.directus_base_url}/items/blog/{post_id}"
            response = requests.delete(url, headers=self.headers)
            response.raise_for_status()
            
            logger.info(f"Successfully deleted blog post ID: {post_id}")
            
        except Exception as e:
            logger.error(f"Error deleting blog post ID {post_id}: {e}")
            raise
    
    def parse_feed_entry(self, entry) -> Dict:
        """Parse a feed entry into Directus blog post format"""
        # Parse the publication date
        pub_date = None
        if hasattr(entry, 'published'):
            try:
                pub_date = date_parser.parse(entry.published).isoformat()
            except Exception as e:
                logger.warning(f"Could not parse date {entry.published}: {e}")
        
        # Extract description from summary or content
        description = ""
        if hasattr(entry, 'summary'):
            description = entry.summary
        elif hasattr(entry, 'content') and entry.content:
            # Take the first content item's value
            description = entry.content[0].value if entry.content else ""
        
        # Clean up the description (remove HTML tags if present)
        # For production, you might want to use a proper HTML parser like BeautifulSoup
        import re
        description = re.sub(r'<[^>]+>', '', description)
        description = description.strip()
        
        post_data = {
            "title": entry.title,
            "description": description,
            "externalUrl": entry.link,
            "content": None,  # RSS posts don't have content, just external links
        }
        
        # Add publication date if available
        if pub_date:
            post_data["date_created"] = pub_date
        
        # Log the data being created for debugging
        logger.debug(f"Parsed post data: {json.dumps(post_data, indent=2)}")
        
        return post_data
    
    def sync_rss_posts(self) -> Dict[str, int]:
        """Main synchronization logic - ensures RSS feed matches Directus"""
        logger.info("Starting RSS to Directus synchronization")
        
        # Fetch RSS feed
        feed = self.fetch_rss_feed()
        
        # Get existing posts from Directus
        existing_posts = self.get_existing_posts()
        
        # Create lookup by external URL
        existing_by_url = {post["externalUrl"]: post for post in existing_posts}
        
        stats = {
            "created": 0,
            "updated": 0,
            "deleted": 0,
            "errors": 0
        }
        
        # Track URLs from RSS feed
        rss_urls = set()
        
        # Process each RSS entry
        for entry in feed.entries:
            try:
                post_data = self.parse_feed_entry(entry)
                url = post_data["externalUrl"]
                rss_urls.add(url)
                
                if url in existing_by_url:
                    # Update existing post if needed
                    existing_post = existing_by_url[url]
                    
                    # Check if update is needed (compare title and description)
                    needs_update = (
                        existing_post["title"] != post_data["title"] or
                        existing_post["description"] != post_data["description"]
                    )
                    
                    if needs_update:
                        self.update_blog_post(existing_post["id"], post_data)
                        stats["updated"] += 1
                else:
                    # Create new post
                    self.create_blog_post(post_data)
                    stats["created"] += 1
                    
            except Exception as e:
                logger.error(f"Error processing RSS entry {entry.link}: {e}")
                stats["errors"] += 1
        
        # Delete posts that are no longer in RSS feed
        for existing_post in existing_posts:
            if existing_post["externalUrl"] not in rss_urls:
                try:
                    self.delete_blog_post(existing_post["id"])
                    stats["deleted"] += 1
                except Exception as e:
                    logger.error(f"Error deleting post {existing_post['id']}: {e}")
                    stats["errors"] += 1
        
        logger.info(f"Synchronization complete. Stats: {stats}")
        return stats


def lambda_handler(event, context):
    """AWS Lambda handler function"""
    try:
        scraper = BlogScraper()
        stats = scraper.sync_rss_posts()
        
        return {
            'statusCode': 200,
            'body': {
                'message': 'RSS synchronization completed successfully',
                'stats': stats
            }
        }
    except Exception as e:
        logger.error(f"Lambda execution failed: {e}")
        return {
            'statusCode': 500,
            'body': {
                'message': 'RSS synchronization failed',
                'error': str(e)
            }
        }


def main():
    """Main function for local testing"""
    try:
        scraper = BlogScraper()
        stats = scraper.sync_rss_posts()
        print(f"Synchronization completed with stats: {stats}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
