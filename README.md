# zwfm-metadata
Pushes metadata to icecast servers and generates RDS on https://rds.zuidwestfm.nl/. 

- **rds.js** generates RDS data. Use it with `?ps` to disply the programma service or `?rt` to display the radio text. Defaults to radio text for legacy integrations.
- **push.js** pushes metadata to Icecast servers. Use this with theh sceduler of Cloudflare Workers to update the metadata as often as you want.
