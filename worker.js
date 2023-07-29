addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const ICECAST_SERVERS = [
  {hostName: 'icecast.example.nl', port: 80, username: 'admin', password: 'hackme', mountPoint: '/stream.mp3'},
  {hostName: 'icecast.example.nl', port: 80, username: 'admin', password: 'hackme', mountPoint: '/stream.aac'}
  // Add more servers if needed
]

async function handleRequest(request) {
  // Fetch current playing song
  let response = await fetch('https://rds.zuidwestfm.nl/')
  let song = await response.text()

  // Push to Icecast servers
  let errors = []
  for(let server of ICECAST_SERVERS){
    let metadata = {song: song, mount: server.mountPoint, mode: 'updinfo', charset: 'UTF-8'}
    let requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(server.username + ':' + server.password)
      }
    }

    let url = `http://${server.hostName}:${server.port}/admin/metadata.xsl?` + new URLSearchParams(metadata)
    let serverResponse = await fetch(url, requestOptions)
    
    if (!serverResponse.ok) {
      errors.push(`Error ${serverResponse.status}: ${serverResponse.statusText} on ${server.hostName}`)
    }
  }

  if(errors.length > 0){
    return new Response('One or more requests failed: \n' + errors.join('\n'), {status: 500})
  }

  return new Response('Updated song metadata', {status: 200})
}
