# zwfm-metadata
This repository contains a metadata management solution specifically designed for ZuidWest FM in the Netherlands. It includes two small services: one that pushes metadata to Icecast servers and another that generates program information for various purposes, including RDS (Radio Data System).

These services operate on https://rds.zuidwestfm.nl/ and https://rds-rucphen.zuidwestfm.nl/. 

- **rds.js**: Generates RDS data. Use it with `?ps` to display the programme service or `?rt` to display the radio text. Defaults to radio text for legacy integrations.
- **rds-rucphen.js**: Generates RDS data for Rucphen RTV. Custom implementation based on html parsing of the website rucphenrtv.nl.
- **push.js**: Pushes metadata to Icecast servers. Use this with the scheduler of Cloudflare Workers to update the metadata as often as you want.

All scripts run serverless as Cloudflare Worker.