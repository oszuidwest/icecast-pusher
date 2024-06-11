const ICECAST_SERVERS = [
  {hostName: 'icecast.zuidwestfm.nl', port: 80, username: 'admin', password: 'hackme', mountPoint: '/zuidwest.mp3'},
  {hostName: 'icecast.zuidwestfm.nl', port: 80, username: 'admin', password: 'hackme', mountPoint: '/zuidwest.aac'}
  // Add more servers if needed
]

export default {
  async scheduled(event, env, ctx) {
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
      console.error('One or more requests failed: \n' + errors.join('\n'))
      return;
    }

    console.log('Updated song metadata')
  }
}
