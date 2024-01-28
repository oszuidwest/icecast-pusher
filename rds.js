// Adding the "fetch" event listener
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request, event))
})

// Asynchronous function to handle requests
async function handleRequest (request, event) {
  const { cacheUrl, cacheBusterValue } = addCacheBuster(new URL(request.url))
  const cache = caches.default

  let response = await cache.match(cacheUrl)
  let headers = new Headers({
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'X-Cache-Buster': cacheBusterValue // Add cache buster for debugging
  })

  if (!response) {
    const data = await fetchBroadcastData()
    const content = extractContent(new URL(request.url), data)

    response = new Response(content, {
      status: 200,
      headers
    })
    event.waitUntil(cache.put(cacheUrl, response.clone()))
    headers.append('X-Cache-Status', 'Miss')
  } else {
    response = new Response(response.body, response)
    headers = new Headers(response.headers)
    headers.append('X-Cache-Status', 'Hit')
  }

  return new Response(response.body, {
    status: response.status,
    headers
  })
}

// Function to add a cache buster to the URL
function addCacheBuster (url) {
  const amsterdamTime = new Date().toLocaleString('en-US', {
    timeZone: 'Europe/Amsterdam'
  })
  const cacheBusterValue = new Date(amsterdamTime).toISOString().slice(0, 13).replace(/T/, '-')
  url.searchParams.set('cacheBuster', cacheBusterValue)
  return {
    cacheUrl: new Request(url.toString(), {
      method: 'GET'
    }),
    cacheBusterValue
  }
}

// Asynchronous function to fetch broadcast data
async function fetchBroadcastData () {
  const response = await fetch('https://www.zuidwestupdate.nl/wp-json/zw/v1/broadcast_data')
  return response.json()
}

// Function to extract content from the data
function extractContent (url, data) {
  const text = url.searchParams.has('ps')
    ? data.fm.rds.program
    : data.fm.rds.radiotext
  return text.replace(/<[^>]*>?/gm, '')
}
