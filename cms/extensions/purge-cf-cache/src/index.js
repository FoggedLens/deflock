export default ({ action }, { env }) => {
  const { CF_API_KEY, CF_ZONE_ID } = env;
  const creds = { CF_API_KEY, CF_ZONE_ID };

  action('items.create', async ({ collection, keys }) => {
    await purgeCloudflareCache(collection, keys, creds);
  });

  action('items.update', async ({ collection, keys }) => {
    await purgeCloudflareCache(collection, keys, creds);
  });

  action('items.delete', async ({ collection, keys }) => {
    await purgeCloudflareCache(collection, keys, creds);
  });
};

async function purgeCloudflareCache(collectionName, ids, creds) {
  const baseUrl = `cms.deflock.me/items/${collectionName}`;
  const additionalUrls = ids ? ids.map(id => `${baseUrl}/${id}`) : [];

  console.log(baseUrl);
  console.log(additionalUrls);

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${creds.CF_ZONE_ID}/purge_cache`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${creds.CF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prefixes: [
          baseUrl,
          ...additionalUrls
        ]
      })
    }
  );

  if (res.status >= 200 && res.status < 300) {
    console.log(`Cloudflare Cache Purged for updated items in collection: ${collectionName}`);
  } else
    console.error(res);
}
