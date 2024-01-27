addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch("https://www.zuidwestupdate.nl/wp-json/zw/v1/broadcast_data");
  const data = await response.json();
  const text = data.fm.rds.radiotext;
  const cleanText = text.replace(/<[^>]*>?/gm, ''); // remove HTML tags
  return new Response(cleanText, { status: 200 });
}
