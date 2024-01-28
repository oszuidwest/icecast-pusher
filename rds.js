addEventListener("fetch", event => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const request = event.request;
  const cacheKey = createCacheKey(new URL(request.url));
  const cache = caches.default;

  let response = await cache.match(cacheKey);
  let cacheStatus = 'Hit';

  if (!response) {
    const fetchResponse = await fetch("https://www.zuidwestupdate.nl/wp-json/zw/v1/broadcast_data");
    const data = await fetchResponse.json();

    const content = new URL(request.url).searchParams.has('ps') ? 
                    data.fm.rds.program.replace(/<[^>]*>?/gm, '') : 
                    data.fm.rds.radiotext.replace(/<[^>]*>?/gm, '');

    response = new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'X-Cache-Key': cacheKey.url
      }
    });

    event.waitUntil(cache.put(cacheKey, response.clone()));
    cacheStatus = 'Miss';
  }

  // Add 'X-Cache-Status' header to the response
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Cache-Status', cacheStatus);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

function createCacheKey(url) {
  const amsterdamTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Amsterdam" });
  const formattedTime = new Date(amsterdamTime).toISOString().slice(0, 13).replace(/T/, '-');
  url.searchParams.set('cacheTime', formattedTime);
  return new Request(url.toString(), { method: 'GET' });
}
