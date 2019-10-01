<?php
include 'config.php';
$country_ids = 0;
$query_country = "SELECT * FROM countries";
$results_country=mysqli_query($conn,$query_country);
while ($row_country = mysqli_fetch_array($results_country)) {
    //output a row here
    $country_ids = $row_country['country_id'];


$curl_options = array(
  CURLOPT_URL => "https://apifootball.com/api/?action=get_leagues&country_id=$country_ids&APIkey=$APIkey",
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
	$league_id = $value->league_id;
	$league_name = $value->league_name;
	$sql = mysqli_query($conn,"INSERT INTO competitions
		(
		country_id,
		country_name,
		league_id,
		league_name
		) 
		VALUES 
		(
		'".$country_id."',
		'".$country_name."',
		'".$league_id."',
		'".$league_name."'
		)
		");
}
}
?>