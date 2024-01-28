# zwfm-metadata
Pushes metadata to icecast servers and generates RDS on https://rds.zuidwestfm.nl/. 

- **rds.js**: Generates RDS data. Use it with `?ps` to display the programme service or `?rt` to display the radio text. Defaults to radio text for legacy integrations.
- **push.js**: Pushes metadata to Icecast servers. Use this with theh sceduler of Cloudflare Workers to update the metadata as often as you want.

Both scripts run serverless as Cloudflare Worker.