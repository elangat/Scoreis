<?php
include 'config.php';
$league_id = 63;

$curl_options = array(
  CURLOPT_URL => "https://apifootball.com/api/?action=get_standings&league_id=$league_id&APIkey=$APIkey",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HEADER => false,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_CONNECTTIMEOUT => 5
);

$curl = curl_init();
curl_setopt_array( $curl, $curl_options );
$result = curl_exec( $curl );

$result = (array) json_decode($result);

var_dump($result);
?>