addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const request = event.request;
  const cacheUrl = createCacheKey(new URL(request.url));
  const cache = caches.default;

  let response = await cache.match(cacheUrl);
  let headers = new Headers({
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Robots-Tag': 'noindex, nofollow, noarchive'
  });

  if (!response) {
    const data = await fetchBroadcastData();
    const content = extractContent(new URL(request.url), data);

    response = new Response(content, { status: 200, headers });
    event.waitUntil(cache.put(cacheUrl, response.clone()));
    headers.append('X-Cache-Status', 'Miss');
  } else {
    response = new Response(response.body, response);
    headers = new Headers(response.headers);
    headers.append('X-Cache-Status', 'Hit');
  }

  headers.append('X-Cache-Key', cacheUrl.url);
  return new Response(response.body, { status: response.status, headers });
}

function createCacheKey(url) {
  const amsterdamTime = new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' });
  const formattedTime = new Date(amsterdamTime).toISOString().slice(0, 13).replace(/T/, '-');
  url.searchParams.set('cacheTime', formattedTime);
  return new Request(url.toString(), { method: 'GET' });
}

async function fetchBroadcastData() {
  const response = await fetch('https://www.zuidwestupdate.nl/wp-json/zw/v1/broadcast_data');
  return response.json();
}

function extractContent(url, data) {
  const text = url.searchParams.has('ps') ? data.fm.rds.program : data.fm.rds.radiotext;
  return text.replace(/<[^>]*>?/gm, '');
}
