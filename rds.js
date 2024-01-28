addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request, event));
});

async function handleRequest(request, event) {
  const url = new URL(request.url);
  const cacheUrl = new URL(request.url);

  // Append the current hour to the URL as a query parameter for caching
  cacheUrl.searchParams.set('cacheHour', getCurrentHour());

  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;

  let response = await cache.match(cacheKey);
  if (!response) {
    // Fetch the data from the remote server
    const fetchResponse = await fetch("https://www.zuidwestupdate.nl/wp-json/zw/v1/broadcast_data");
    const data = await fetchResponse.json();

    let displayText;
    if (url.searchParams.has('ps')) {
      displayText = data.fm.rds.program;
    } else {
      displayText = data.fm.rds.radiotext;
    }

    const cleanText = displayText.replace(/<[^>]*>?/gm, '');
    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex, follow, noarchive',
    });

    response = new Response(cleanText, { status: 200, headers: headers });

    // Cache the response
    event.waitUntil(cache.put(cacheKey, response.clone()));
  } else {
    // Add status headers to the cached response
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Cache-Status', 'Hit');
    newHeaders.set('X-Cache-Key', cacheKey.url);

    response = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }

  return response;
}

function getCurrentHour() {
  const now = new Date();
  return now.getUTCHours().toString();
}
