<?php

$metadata = file_get_contents('https://www.zuidwestupdate.nl/rds/rds_programma.php');
$serversPath = __DIR__ . '/servers.csv';
if(!file_exists($serversPath)) {
    error_log('servers.csv doesn\'t exist');
    exit(64);
}
$servers = file_get_contents($serversPath);
$servers = explode("\n", $servers);

//first line are column names;
array_shift($servers);

$failure = false;

foreach($servers as $server) {
    $server = trim($server);
    if(empty($server)) {
        continue;
    }
    
    list($hostName, $port, $username, $password, $mountPoint) = str_getcsv($server, ';');
    $url = 'https://' . $hostName . ':' . $port . '/admin/metadata.xsl?' . http_build_query(['song' => $metadata, 'mount' => $mountPoint, 'mode' => 'updinfo', 'charset' => 'UTF-8']);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_USERPWD, $username . ':' . $password);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
    $response = curl_exec($ch);
    $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($responseCode != 200) {
        error_log(sprintf('FAILURE: %s %s -> %d', $hostName, $mountPoint, $responseCode));
        $failure = true;
    } else {
        echo sprintf('SUCCESS: %s %s -> %d', $hostName, $mountPoint, $responseCode) . "\n";
    }
    curl_close($ch);
}

if($failure) {
    error_log('One or more requests failed');
    exit(65);
}
