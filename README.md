# DeFlock

Crowdsourced tool for locating and reporting ALPRs. [View Live Site](https://deflock.org).

![DeFlock Screenshot](./webapp/public/map-interface-nationwide.webp)

## Purpose

I created this project after noticing the mass deployment of ALPRs in cities, towns, and even rural areas in the recent years. It's a massive threat to privacy, and this projects helps shed a light on this issue as ALPRs continue to be deployed to thousands of cities across the US and possibly beyond.

## What it Does

### View ALPRs on a Map
Uses OpenStreetMap data to populate a map with crowdsourced locations of ALPRs, along with their type and direction they face.

The map has become a separate repository, [deflockhopper_maps](https://github.com/FoggedLens/deflockhopper_maps).


### Report ALPRs
Provides instructions for using the [DeFlock App](https://deflock.org/app) or OpenStreetMap's [iD web editor](https://www.openstreetmap.org/edit) to report ALPRs using a standardized tagging system.

### Identify ALPRs
A constantly-growing repository of ALPR makes, models, and tagging instructions for OpenStreetMap, along with images for identifying them.

## Tech Stack

### Backend
* TypeScript
* Fastify API server
* Cloudflare R2 for ALPR points and vector tiles
* OpenTelemetry

### Cloud
* AWS Lambda (for [region segmenting \[deprecated\]](serverless/alpr_clusters) and [counts](serverless/alpr_counts))
* AWS S3 - phasing out for R2
* AWS ECR
* Cloudflare as DNS + Proxy
* Directus CDN
* Zammad helpdesk

### Frontend
* Vue3
* Vuetify
* MapLibre GL
* Vue Leaflet \[deprecated\] - phasing out for MapLibre GL

### Services
* OpenStreetMap - Overpass API, Basic Map Tiles \[deprecated\]
* Nominatim - Geocoding

## Development

### Requirements
* [bun](https://bun.sh/)

### Running Frontend

1. `cd webapp`
2. `bun i`
3. `bun dev`

### Running Backend

1. `cd api`
2. `bun i`
3. `bun dev`

## Contributing

We welcome contributions from anyone. Here's how you can help:

### How to Contribute

1. Fork the Repository
2. Make Your Changes
3. Open a Pull Request against This Repo
