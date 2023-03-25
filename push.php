<?php
// Fetch the metadata from the remote API
$metadata = strip_tags(html_entity_decode(json_decode(file_get_contents('https://www.zuidwestupdate.nl/wp-json/zw/v1/broadcast_data'), true)['fm']['rds']['radiotext']));

// Get the Icecast password from the environment variable
$icecast_password = getenv('ICECAST_PASSWORD') ?? '';
if (empty($icecast_password)) {
    // Log an error and exit if the password is not set
    error_log('ICECAST_PASSWORD is not set. You probably need to set it up in GitHub Actions!');
    exit(64);
}

// Define the server configurations to update. More can be added
$servers = [
    [
        'hostname' => 'icecast.zuidwestfm.nl',
        'port' => 80,
        'username' => 'admin',
        'password' => $icecast_password,
        'mountpoint' => '/zuidwest.mp3',
    ],
    [
        'hostname' => 'icecast.zuidwestfm.nl',
        'port' => 80,
        'username' => 'admin',
        'password' => $icecast_password,
        'mountpoint' => '/zuidwest.aac',
    ],
    [
        'hostname' => 'icecast.zuidwestfm.nl',
        'port' => 80,
        'username' => 'admin',
        'password' => $icecast_password,
        'mountpoint' => '/zuidwest.stl',
    ],
];

$failure = false;

// Iterate over each server configuration and update the metadata
foreach ($servers as $server) {
    $url = 'http://' . $server['hostname'] . ':' . $server['port'] . '/admin/metadata.xsl?' . http_build_query(['song' => $metadata, 'mount' => $server['mountpoint'], 'mode' => 'updinfo', 'charset' => 'UTF-8']);

    $ch = curl_init($url);
    // Set the credentials for authentication
    curl_setopt($ch, CURLOPT_USERPWD, $server['username'] . ':' . $server['password']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($responseCode != 200) {
        // Log an error message if the request fails
        error_log(sprintf('FAILURE: %s %s -> %d', $server['hostname'], $server['mountpoint'], $responseCode));
        $failure = true;
    } else {
        // Output success message, metadata value, and response code if the request is successful
        echo sprintf('SUCCESS: %s %s -> %d (Metadata: %s)', $server['hostname'], $server['mountpoint'], $responseCode, $metadata) . "\n";
    }
    curl_close($ch);
}

// If any request failed, log an error message and exit
if ($failure) {
    error_log('One or more requests failed');
    exit(65);
}