Q: How do I get/download the underlying map data?
A: DeFlock uses OpenStreetMap (OSM) as our backend/database — think "Wikipedia for maps" if you're not familiar. OSM has been around for 20+ years and there's a ton of (often free and open source) tooling for interacting with its data.

Until downloads are built directly into the website, a good place to start is Overpass Turbo: https://overpass-turbo.eu/s/2cMH (or https://overpass-turbo.eu/s/2liK). Overpass Turbo lets you search and export OSM data to GeoJSON, GPX, and KML. The linked queries have comments with instructions for filtering by country, state, or getting worldwide data.

Note that query includes all ALPRs, not just Flock ones. To filter to Flock specifically, replace the `node[...]` line with:
```
(
  node["manufacturer"="Flock Safety"];
  node["brand"="Flock Safety"];
);
```

Q: I'm in Canada (or another country) — can I map ALPRs there too?
A: Yes, the app isn't geographically bound. Canada (and most non-US countries) just has far fewer known ALPRs mapped so far, and the ones that exist haven't drawn as much public attention yet, so fewer people have been mapping them. We're not sure what brands/capabilities are common outside the US — that's somewhat unmapped territory (pun intended).

Technical context: DeFlock doesn't run its own database — we show a limited set of what's on OpenStreetMap. OSM's database is full of "nodes" tagged with key=value pairs. Our app ships with a few built-in "profiles" (just a set of tags describing a type of thing), but you may need to create or modify a custom profile in Settings > Profiles to correctly map whatever devices exist in your area. As an example of how flexible this is: you could map a park bench with a custom profile of just `amenity=bench`, or a tree with `natural=tree`. Look at the built-in profiles for a sense of the pattern.

We're also working on a larger update to deflock.org/identify with more vendors and non-ALPR device types, each with an importable app profile, to make this easier going forward.
