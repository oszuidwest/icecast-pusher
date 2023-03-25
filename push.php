<?php

$metadata = file_get_contents('https://www.zuidwestupdate.nl/rds/rds_programma.php');

$icecast_password = getenv('ICECAST_PASSWORD');
if(empty($icecast_password)) {
    error_log('ICECAST_PASSWORD is not set');
    exit(64);
}

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

foreach ($servers as $server) {
    $url = 'http://' . $server['hostname'] . ':' . $server['port'] . '/admin/metadata.xsl?' . http_build_query(['song' => $metadata, 'mount' => $server['mountpoint'], 'mode' => 'updinfo', 'charset' => 'UTF-8']);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_USERPWD, $server['username'] . ':' . $server['password']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($responseCode != 200) {
        error_log(sprintf('FAILURE: %s %s -> %d', $server['hostname'], $server['mountpoint'], $responseCode));
        $failure = true;
    } else
    {
        echo sprintf('SUCCESS: %s %s -> %d', $server['hostname'], $server['mountpoint'], $responseCode) . "\n";
    }
    curl_close($ch);
}

if($failure) {
    error_log('One or more requests failed');
    exit(65);
}