addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const response = await fetch("https://www.zuidwestupdate.nl/wp-json/zw/v1/broadcast_data");
  const data = await response.json();

  let displayText;
  if (url.searchParams.has('ps')) {
    // If 'ps' query param is present, display program
    displayText = data.fm.rds.program;
  } else {
    // Default to displaying radio text (also for 'rt' query param)
    displayText = data.fm.rds.radiotext;
  }

  const cleanText = displayText.replace(/<[^>]*>?/gm, ''); // remove HTML tags

  const headers = {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Robots-Tag': 'noindex' // Instructs search engines not to index this page
  };

  return new Response(cleanText, { status: 200, headers: headers });
}
