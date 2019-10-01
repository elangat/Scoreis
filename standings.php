<?php
include 'config.php';
$league_ids = 0;
$query_leagues = "SELECT * FROM competitions";
$results_leagues=mysqli_query($conn,$query_leagues);
while ($row_standings = mysqli_fetch_array($results_leagues)) {
    //output a row here
    $league_ids = $row_standings['league_id'];

$curl_options = array(
  CURLOPT_URL => "https://apifootball.com/api/?action=get_standings&league_id=$league_ids&APIkey=$APIkey",
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
	$country_name = $value->country_name;
	$league_id = $value->league_id;
	$league_name = $value->league_name;
	$team_name = $value->team_name;
	$overall_league_position = $value->overall_league_position;
	$overall_league_payed = $value->overall_league_payed;
	$overall_league_W = $value->overall_league_W;
	$overall_league_D = $value->overall_league_D;
	$overall_league_L = $value->overall_league_L;
	$overall_league_GF = $value->overall_league_GF;
	$overall_league_GA = $value->overall_league_GA;
	$overall_league_PTS = $value->overall_league_PTS;
	$home_league_position = $value->home_league_position;
	$home_league_payed = $value->home_league_payed;
	$home_league_W = $value->home_league_W;
	$home_league_D = $value->home_league_D;
	$home_league_L = $value->home_league_L;
	$home_league_GF = $value->home_league_GF;
	$home_league_GA = $value->home_league_GA;
	$home_league_PTS = $value->home_league_PTS;
	$away_league_position = $value->away_league_position;
	$away_league_payed = $value->away_league_payed;
	$away_league_W = $value->away_league_W;
	$away_league_D = $value->away_league_D;
	$away_league_L = $value->away_league_L;
	$away_league_GF = $value->away_league_GF;
	$away_league_GA = $value->away_league_GA;
	$away_league_PTS = $value->away_league_PTS;
	$sql = mysqli_query($conn,"INSERT INTO standings
		(
		country_name,
        league_id,
        league_name,
        team_name,
        overall_league_position,
        overall_league_payed,
        overall_league_W,
        overall_league_D,
        overall_league_L,
        overall_league_GF,
        overall_league_GA,
        overall_league_PTS,
        home_league_position,
        home_league_payed,
        home_league_W,
        home_league_D,
        home_league_L,
        home_league_GF,
        home_league_GA,
        home_league_PTS,
        away_league_position,
        away_league_payed,
        away_league_W,
        away_league_D,
        away_league_L,
        away_league_GF,
        away_league_GA,
        away_league_PTS
		) 
		VALUES 
		(
		'".$country_name."',
		'".$league_id."',
		'".$league_name."',
		'".$team_name."',
		'".$overall_league_position."',
		'".$overall_league_payed."',
		'".$overall_league_W."',
		'".$overall_league_D."',
		'".$overall_league_L."',
		'".$overall_league_GF."',
		'".$overall_league_GA."',
		'".$overall_league_PTS."',
		'".$home_league_position."',
		'".$home_league_payed."',
		'".$home_league_W."',
		'".$home_league_D."',
		'".$home_league_L."',
		'".$home_league_GF."',
		'".$home_league_GA."',
		'".$home_league_PTS."',
		'".$away_league_position."',
		'".$away_league_payed."',
		'".$away_league_W."',
		'".$away_league_D."',
		'".$away_league_L."',
		'".$away_league_GF."',
		'".$away_league_GA."',
		'".$away_league_PTS."'
		)
		");
}
}
?>