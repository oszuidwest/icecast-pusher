<?php

$dayOfWeek = date("N");
$currentTime = time();

// Initialize the current show to "Non-Stop"
$currentShow = "Non-Stop";

// Parse the HTML
$html = file_get_contents("https://www.onswestbrabant.nl/radio/gids");
$doc = new DOMDocument();
@$doc->loadHTML($html);
$xpath = new DOMXPath($doc);

// Find the div with the current day of the week
$dayDivs = $xpath->query("//div[@class='guide-tab-item' and @data-day='$dayOfWeek']");
if ($dayDivs->length > 0) {
  $dayDiv = $dayDivs[0];

  // Find all the show divs for the current day
  $showDivs = $xpath->query("div[@class='guide-item']", $dayDiv);

  // Find the current show
  foreach ($showDivs as $showDiv) {
    // Get the start and end times for the show
    $timeSpan = $xpath->query("span[@class='guide-item-time']", $showDiv)[0];
    $timeText = $timeSpan->textContent;
    $timeParts = explode(" - ", $timeText);
    $startTime = strtotime($timeParts[0]);
    $endTime = strtotime($timeParts[1]);

    // If the current time is within the start and end times for the show,
    // set the current show to the show title
    if ($currentTime >= $startTime && $currentTime < $endTime) {
      $titleSpan = $xpath->query("span[@class='guide-item-title']/a", $showDiv)[0];
      $currentShow = strip_tags($titleSpan->textContent);
      break;
    }
  }
}

echo trim($currentShow);
