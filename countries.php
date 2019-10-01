<?php
include 'config.php';

$curl_options = array(
  CURLOPT_URL => "https://apifootball.com/api/?action=get_countries&APIkey=$APIkey",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HEADER => false,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_CONNECTTIMEOUT => 5
);

$curl = curl_init();
curl_setopt_array( $curl, $curl_options );
$result = curl_exec( $curl );

$result = (array) json_decode($result);
foreach ($result as $value) {
	$country_id = $value->country_id;
	$country_name = $value->country_name;
	$sql = mysqli_query($conn,"INSERT INTO countries
		(
		country_id,
		country_name
		) 
		VALUES 
		(
		'".$country_id."',
		'".$country_name."'
		)
		");
	echo $country_id.":".$country_name;
}



?>