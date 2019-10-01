<?php
include 'config.php';
$league_ids = 0;
$from = date('Y-m-d');
$to = date('Y-m-d', strtotime("+7 days"));
?>
<!DOCTYPE html><html>
<head>
    <title>Milebets</title>    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" >
<meta http-equiv="Content-Language" content="en-US" >
<meta property="og:image" content="images/online/b3/milebets/logo.png" >
<meta name="viewport" content="width=device-width, initial-scale=1" >    <link href="v4.69/css/lib.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/common/bet.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/b3.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/kiosk/flags.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/b3views.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/b3xpg.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/bcw.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/debitunit.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/lamda.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/livecasino.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/moneysafepay.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/ecopay.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/zotapay.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/ggpoker.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/uklive.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/orangepay.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/cardpay.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/paynow.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/skrill.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/neteller.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/interkassa.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/leopayment.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/everymatrix.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/b3sg.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/online/b3slip.css" media="screen" rel="stylesheet" type="text/css" >
<link href="v4.69/css/plugins/chat/chat.css" media="screen" rel="stylesheet" type="text/css" >    
<script type="text/javascript" src="languages/translations.html"></script>
<script type="text/javascript" src="v4.69/js/lib.js"></script>
<script type="text/javascript" src="v4.69/js/php.js"></script>
<script type="text/javascript" src="v4.69/js/util.js"></script>
<script type="text/javascript" src="v4.69/js/common/events.js"></script>
<script type="text/javascript" src="v4.69/js/plugins/chat/chat.js"></script>
<script type="text/javascript" src="v4.69/js/newonline/login.js"></script>
<script type="text/javascript" src="../code.jquery.com/jquery-1.11.1.min.js"></script>    </head>
<body class="yui-skin-sam loading session-guest ">
    <link rel="stylesheet" href="v4.69/css/plugins/pools/pools.css"/>
<link rel="stylesheet" href="v4.69/css/plugins/pools/web.css"/>
    <div class="pageblock"><link href='https://fonts.googleapis.com/css?family=Allura' rel='stylesheet'>
<link href='https://fonts.googleapis.com/css?family=Euphoria%20Script' rel='stylesheet'>
<link href='https://fonts.googleapis.com/css?family=Satisfy' rel='stylesheet'>
<link href='https://fonts.googleapis.com/css?family=Seaweed%20Script' rel='stylesheet'>
<link href='https://fonts.googleapis.com/css?family=Yellowtail' rel='stylesheet'>
<link href='https://fonts.googleapis.com/css?family=Alex%20Brush' rel='stylesheet'>
<link href='https://fonts.googleapis.com/css?family=Pacifico' rel='stylesheet'><style>
span.payBillNumber, img.payBill {
    display: none;
}
#hd {
    position: relative;
    height: 165px;
    background-color: #000080;
}
a#home-logo {
    position: absolute;
    top: -2px;
    left: 39px;
    width: 260px;
    height: 120px;
    z-index: 5000;
}

#hd #product-menu {
    top: 128px;
}
#hd #product-menu li.ladies-choice a {
    color:white;
    font-family:Yellowtail;
    font-size: 13px;
    text-shadow: 0px 0px 0px #000080;
}
#hd #product-menu a.ladies-choice {
    color:white;
    font-family:Yellowtail;
    text-shadow: 0px 0px 0px #000080;
}
body {
    background: url(images/online/b3/milebets/ucl.jpg);
    background-size: cover;
    background-color: #000080;
}
#nav-left {
    margin-top: 4px;
}
div.sports-period-select, #featuredleagues {
    background: #004c3f;
}
div.sports-period-select div.period-select-markets {
    text-align: center;
}
#odds-less-than-menu div.header {
    color: #ffffff;
    text-align: center;
    border-bottom: solid 2px #2F4F4F;
    margin-left: -17px;
    font: bold 13px/20px Verdana;
}
#odds-less-than-menu div.header {
    color: #ffffff;
    text-align: center;
    background: #2F4F4F;
    height: 23px;
    text-transform: uppercase;
    border-bottom: solid 2px #ffffff;
    margin-left: -17px;
    font: bold 13px/20px Verdana;
}
#featuredleagues div.header, #match-info-panels div.header {
    margin-bottom: 4px;
    color: #ffffff;
    text-align: center;
    background: #2F4F4F;
    height: 23px;
    text-transform: uppercase;
    border-bottom: solid 2px #ffffff;
    margin-left: 0px;
    font: bold 13px/20px Verdana;
}
#nav-left #featuredleagues a {
    padding: 2px 0 2px 12px;
    font: 400 11px/16px Tahoma;
    color: #ffffff;
    margin-left: 3px;
    border-bottom: solid 1px #19ba5c;
}
#nav-left .content {
    border-radius: 0px;
}
#odds-less-than-menu a.odds-less-than {
    font: 12px Verdana;
    margin-left: 18px;
}
#sports-menu div.sports-menu-title {
    height: 32px;
    margin-top: -8px;
    background: #19ba5c;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
    color: #ffffff;
    font: bold 14px/25px Tahoma;
    text-transform: uppercase;
    text-align: center;
    display: block;
}
#nav-left li {
    border-bottom: 1px solid #26b863;
    font-size: 11px;
    overflow-x: hidden;
    background: #1a413b;
    padding: 0;
    position: relative;
}
#nav-left li:hover {
    background: #f2ff00;
    color: #1a413b !important;
}
#nav-left a:hover {
    color: #1a413b;
}
#nav-left li.open > div.left-menu-item {
    background-color: #f2ff00;
}
#nav-left li li li {
    background-color: #26b863;
}
#nav-left li li {
    background-color: #1a413b;
}
#hd div.search {
    position: absolute;
    float: none;
    width: 185px;
    height: 40px;
    top: 165px;
    right: 66px;
    z-index: 5000;
}
#hd div.search #search {
    border: 1px solid #888;
    border-radius: 0px;
    padding-left: 8px;
    width: 229px;
    height: 25px;
    color: #004c3f;
    background: #ffffff url(images/online/b3/topsearch.png) right center no-repeat;
}
#page #slip {
    background-color: #004c3f;
    border: 1px solid #212020;
    border-radius: 0px;
    width: 100%;
    top: 40px;
}
#hd #product-menu {
    background: #2F4F4F !important;
}
#hd #product-menu li.selected {
    background: #004c3f;
    height: 46px;
    top: -10px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}
#hd #product-menu li {
    display: inline-block;
    line-height: 36px;
    text-transform: uppercase;
    margin: 0 -5px 0 0;
    padding: 0px 28px;
    border-right: solid 1px #fff;
    position: relative;
}
#hd #product-menu li a:hover {
    color: #000080;
}
#hd #product-menu li:hover {
    background: #ff8806 linear-gradient(#f2ff00, #2F4F4F);
    height: 46px;
    top: -10px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}
#closingsoon div.match {
    background: #1a413b;
    border-bottom: solid 1px #26b863;
}
.mover-wrapper {
    background: #1a413b;
}
.mover {
    left: 10px;
}
div.match-section div.match-section-sport-menu div.sport-item.selected, div.match-section div.match-section-sport-menu div.sport-item:hover {
    background: #ff8806 linear-gradient(#f2ff00, #2F4F4F);
    color: #000;
    border-color: #000;
    box-shadow: inset 0px 0px 4px 0px #444;
}
div.match-section div.match-section-sport-menu div.sport-item {
    background: #004c3f linear-gradient(#004c3f, #004c3f);
}
div.match-section div.match-section-sport-content div.sport-section-market-header {
    position: relative;
    height: 35px;
    background: #000 linear-gradient(#004c3f, #000);
}
div.match-section div.match {
    background: #1a413b linear-gradient(#1a413b, #1a413b);
}
div.match-section div.match-bets div.match-markets div.match-market div.market-name {
    font: bold 13px Tahoma,Arial;
    color: #fff;
    background: #1a413b;
}
div.match-section div.match-bets div.match-markets div.selection-button.selection-on div.outcome, div.match-section div.match-bets div.match-markets div.selection-button.selection-on div.selection, div.match-section div.match-bets div.match-markets div.selection-button:hover div.outcome, div.match-section div.match-bets div.match-markets div.selection-button:hover div.selection {
    color: #000;
    background: #ff8806 linear-gradient(#ffed00, #19ba5c);
}
div.match-section div.match-bets div.match-markets div.selection-button {
    box-sizing: border-box;
    background: #1a413b;
}
div.match-page-top span.match-page-back-button {
    background: #ffed00;
}
div.match-content div.match-schedule-header {
    font: bold 15px/25px Tahoma,Arial;
    color: #ffed00;
}
#page div.slip-content {
    background-color: #004c3f;
    border-radius: 5px;
}
div.match-section div.match-odds div.match-odds-market div.selection-button:hover, div.match-section div.match-odds div.match-odds-market div.selection-button.selection-on {
    color: #000;
    border-top: 1px solid #ffed00;
    background-color: #ffed00;
}
div.match-section div.header {
    background: #2F4F4F;
    margin-top: 12px;
    color: black;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
}
div.match-section div.match-odds div.match-odds-market div.selection-button {
    position: absolute;
    top: 2px;
    width: 33px;
    height: 30px;
    background-color: #00261f;
}
#hd div.login-form input.login-button, #hd #user-panel .login-button {
    height: 40px;
    width: 100px;
    line-height: 22px;
    border: 1px solid #333;
    text-align: center;
    padding: 0 10px;
    color: #212121;
    font: bold 13px/22px Arial;
    margin-right: 6px;
    border-radius: 4px;
    background: #f2ff00 linear-gradient(#f2ff00, #f2ff00);
}
#hd div.login-form input[type="text"], #hd div.login-form input[type="password"], #hd #user-panel input[type="text"], #hd #user-panel input[type="password"] {
    background-color: #2F4F4F;
    border-radius: 4px;
    height: 40px;
    border: 1px solid #474747;
    width: 100px;
    padding: 0 8px;
    color: #ffffff;
}
#hd a.register {
    height: 40px;
    width: 110px;
    text-align: center;
    line-height: 35px !important;
    margin-right: 4px;
    border-radius: 4px;
    background: #ff8806 linear-gradient(#edb63f, #edb63f);
}
fieldset, img {
    border: 0;
    /*margin-top: 44px;*/
}
#page.view-live div.match-list div.live-match-section-header {
    background: linear-gradient(#004c3f, #081f1a);
}
#page.view-live div.match-list div.live-match-sport-header {
    background: #2F4F4F;
}
#page.view-live div.match-content div.match div.match-market-menu div.market-menu-button {
    background: #888 linear-gradient(#000080, #000080);
}
#ft #footer-sitemap {
    background: -webkit-linear-gradient(top, #000080, #262626);
}
#ft {
    position: relative;
    background: none repeat scroll 0 0 #171717;
    border-top: 1px solid #6e6e6e;
    clear: both;
    overflow: hidden;
    width: 100%;
    z-index: auto;
    height: 350px;
    margin: 0;
    padding: 0;
    color: #fff;
}
#ft div.copyright {
    margin-top: -195px;
    background: none;
}
#page.view-live div.match-content div.match div.match-market-menu div.market-menu-button {
    color: #fff;
}
#nav-left #account-menu li div.header {
    background-color: #2F4F4F;
    text-align: center;
    color: #000080;
}
#page.view-account #nav-left li a {
    background-color: #004c3f;
}
#page.view-account #nav-left li a:hover {
    background: #ff8806 linear-gradient(#2F4F4F, #f2ff00);
    color: #000;
}
div.sporstbook-account div.sportsbook-account-content div.info-table div.table-header div.header-cell {
    background: #004c3f;
}
#user-panel #user-account div.account-shortcuts a {
    height: 30px;
    line-height: 28px !important;
    background: #ff8806 linear-gradient(#f2ff00, #f2ff00);
}
#user-panel #user-account div.account-shortcuts a:hover {
    background: #ff8806 linear-gradient(#f2ff00, #2F4F4F);
}
div.sporstbook-account div.sportsbook-account-content div.account-tabview div.account-tabview-menu a.menu-tab.selected {
    background: #ff8806 linear-gradient(#f2ff00, #f2ff00);
}
div.sporstbook-account div.sportsbook-account-content div.account-tabview div.account-tabview-menu a.menu-tab.selected:hover {
    background: #ff8806 linear-gradient(#f2ff00, #2F4F4F);
}
div.match-section div.match:hover {
    background: #ff8806 linear-gradient(#19ba5c, #000080);
}
div.sporstbook-account div.sportsbook-account-content a.button:not(.myaccount), div.sporstbook-account div.sportsbook-account-content input[type="reset"], div.sporstbook-account div.sportsbook-account-content input[type="submit"] {
    background: #ff8806 linear-gradient(#19ba5c, #000080);
    color: #ffffff;
}
div.sporstbook-account div.sportsbook-account-content div.account-tabview div.account-tabview-menu {
    background: #004c3f;
}
/*sports.css*/

#page #hd div.search {
    top: 80px;
}


/*b3sg.css*/

#page #hd div.refer-a-friend {
    top: 87px;
    right: 250px;
}

#page #hd #user-panel {
    right: 20px;
    top: 18px;
}
</style>
</div>
<div id="page" class="static pools">
    <div id="hd">
        <div class="refer-a-friend">
            <form action="https://milebets.com/account/friendreferral">
                <input type="text" name="friend" placeholder="Friend mobile phone" /><input
                type="submit" value="Refer a friend" />
            </form>
        </div>
        <div id="user-panel">
            <div class="login-form">
                <form action="https://milebets.com/login" method="post">
                    <a class="register" href="register.php">Join Now</a>
                    <a class="forgot-password" href="forgotpass.php">Forgot your Password?</a>
                    <input type="text" name="username"  placeholder="Mobile Phone"/>
                    <input type="password" name="password"  placeholder="Password"/>
                    <input type="submit" class="login-button" value="Login"/>
                </form>
            </div>
        </div>
        <ul id="product-menu">
            <li class="selected">
                <a href="live.php" class="product-in-play">In Play<span id="in-play-nrgames">16</span></a>
            </li>
            <li>
                <a href="1x2.php" class="product-sports">1x2</a>
                
            </li>
            <li>
                <a href="uo25.php" class="product-bcw">Under/Over 2.5</a>
            </li>
            <li>
                <a href="htft.php" class="product-virtual">HT/FT</a>
            </li>
            <li>
                <a href="gg.php" class="product-spinnwin">Both To Score</a>
            </li>
            <li>
                <a href="pools.html" class="product-pools">Jackpot</a>
            </li>
            <li>
                <a href="dc.php" class="product-keno">Double chance</a>
            </li>
            <li>
                <a href="fixtures.php">Fixtures</a>
            </li>
            <li>
                <a href="cs.php" class="company-promotions">Correct Score</a>
            </li>
        </ul>
        <div class="search">
            <input id="search" type="text" placeholder="Search for matches"/>
            <div id="autocomplete"></div>
        </div>
        <ul id="top-nav-menu">

            <!--
            <li><a href="#" class="nav-about">About Us</a></li>
            <li><a href="#" class="nav-resp">Responsible Gambling</a></li>
            <li><a href="#" class="nav-help">Help</a></li>
            <li><a href="#" class="nav-register">Register</a></li>
            <li><a href="#" class="nav-register">Affiliates</a></li>
            <li><a href="#" class="nav-register">Livescore/Results</a></li>
            <li><a href="#" class="nav-register">Statistics</a></li>
            -->
        </ul>
    </div>
    <div id="nav-left">
        <div class="sports-period-select">
            <div class="bg">
                <div class="period-slider"></div>
            </div>
            <div class="options">
                <a href="#" class="period-select-option period-select-3h" p="3h">3Hrs</a>
                <a href="#" class="period-select-option period-select-5h" p="5h">5Hrs</a>
                <a href="#" class="period-select-option period-select-24h" p="24h">24Hrs</a>
                <a href="#" class="period-select-option period-select-all selected"  p="all">All</a>
                <div id="period-select-slider">
                    <div id="period-select-slider-thumb"></div>
                </div>
            </div>
            <div class="period-select-markets">
                <span id="period-select-nrmarkets"></span> Markets
                <span class="clear-all-menu-selections hidden">Clear</span>
            </div>
            <div id="odds-less-than-menu">
                <div class="header">Odds Less Than</div>
                    <div class="menu-content">
                        <a href='#' class="odds-less-than" od="175">1.75</a>
                        <a href='#' class="odds-less-than" od="150">1.50</a>
                        <a href='#' class="odds-less-than" od="125">1.25</a>
                    </div>
            </div>
        </div>
        <div id="featuredleagues">
            <div class="header">Featured Leagues</div>
            <?php $query_leagues = "SELECT * FROM competitions WHERE id NOT IN(0) ORDER BY country_name ASC";
                    $results_leagues = mysqli_query($conn, $query_leagues);
                        if (mysqli_num_rows($results_leagues) > 0) {
                            // output data of each row?>

                            <div id="Leagues">
                                <?php

                                while($Leagues = mysqli_fetch_assoc($results_leagues)) { ?>

                                    <div class="country" class="featured-league-370">          
                                        <div class="flag flag-<?php echo strtolower($Leagues['country_name']);?>"></div>
                                        <a class="featured-league" tid="370" href="index.php?tournament=<?php echo $Leagues['league_id'];?>"><?php echo $Leagues['country_name']." ".$Leagues['league_name'];?>
                                            
                                        </a>
                                    </div>

                                    <?php }
                                } ?>
                            </div>
            
        </div>
        <div id="featuredleagues">
            <div class="header">Countries</div>

            
                <?php $query_vids = "SELECT * FROM countries WHERE id NOT IN(0) ORDER BY country_name ASC";
                    $results_vids = mysqli_query($conn, $query_vids);
                        if (mysqli_num_rows($results_vids) > 0) {
                            // output data of each row?>

                            <div id="vidass">
                                <?php

                                while($vidass = mysqli_fetch_assoc($results_vids)) { ?>

                                    <div class="country" class="featured-league-370">          
                                        <div class="flag flag-<?php echo strtolower($vidass['country_name']);?>"></div>
                                        <a class="featured-league" tid="370" href="sports74ea.html?tournament=370"><?php echo $vidass['country_name'];?>
                                            
                                        </a>
                                    </div>

                                    <?php }
                                } ?>
                            </div>
        </div>
        <div id="account-menu">

        </div>
        <div id="match-info-panels">
            <div id="betservices">
                <div class="header">Bet Services</div>
                <div class="content">
                    <a href="sports.html#livescore" class="extra-livescore">Livescore</a>
                    <a href="sports.html#results" class="extra-results">Results</a>
                </div>
            </div>
            <div id="closingsoon">

            </div>
            <div id="latestoddschanges">
                <div class="header">Latest Odds Changes</div>
                <div class="content">

                </div>
            </div>
        </div>
    </div>
    <div id="nav-right">
        <div class="page-block-right-top"></div>
        <div class="slip-position-region">
            <div id="slip" class="empty">
                <div class="empty-slip">There are no bets in your Betting Slip. To add bets please click on any odds.</div>
            </div>
        </div>
        <!-- slip-position-region -->
        <div id="recent-bets">
            <div class="header">RECENT BETS</div>
            <div class="clear"></div>
            <div class="betlist">

            </div>
            <div class="total"></div>
            <div class="footer">
                <a href="#" class="show-betting-history">Show Betting History</a>
                <a href="#" class="reload-last-bet">Reload Last Bet</a>
            </div>
        </div>
        <!-- put ads here -->
        
        <div class="promotions"></div>
            <div class="pageblock">
                <img src="images/online/b3/milebets/ucl.jpg" height="100%" width="100%" />
                <img src="images/online/b3/milebets/ucl.jpg" height="100%" width="100%" />
                <img src="images/online/b3/milebets/ucl.jpg" height="100%" width="100%" />
            </div>
    </div>
    <div id="bd">
        <div id="content">
            <div id="poolsview">
                <div class="pools-content">
                    <div class="pools-item selected" pid="98" maxrows="8" comb="2:3#3:0" type="10">
                        <div class="info-header pools-item r0 selected" pid="98">
                            <div class="poolname" >Fixtures</div>
                            <div class="pooldate">
                                <?php echo $from;?>        to        <?php echo $to;?>                 
                            </div>
                        </div>

    <div class="pools-matches">
                            <table class="pools">
                                <tr class="head">
                                    <th class="pos">Pos</th>
                                    <th class="date">Date</th>
                                    <th class="date">Time</th> 
                                    <th class="match">Match</th>
                                    <th class="result">Result</th>
                                    <th class="result">Score</th>
                                </tr>
                        
                                    <?php

$query_leagues = "SELECT * FROM competitions";
$results_leagues=mysqli_query($conn,$query_leagues);
while ($row_standings = mysqli_fetch_array($results_leagues)) {
    //output a row here
    //$n=0;
    $league_ids = $row_standings['league_id'];
      $curl_options = array(
      CURLOPT_URL => "https://apifootball.com/api/?action=get_events&from=$from&to=$to&league_id=$league_ids&APIkey=$APIkey",
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
    $n++;
    $match_id = $value->match_id;
    $country_id = $value->country_id;
    $country_name = $value->country_name;
    $league_id = $value->league_id;
    $league_name = $value->league_name;
    $match_date = $value->match_date;
    $match_status = $value->match_status;
    $match_time = $value->match_time;
    $match_hometeam_name = $value->match_hometeam_name;
    $match_hometeam_score = $value->match_hometeam_score;
    $match_awayteam_name = $value->match_awayteam_name;
    $match_awayteam_score = $value->match_awayteam_score;
    $match_hometeam_halftime_score = $value->match_hometeam_halftime_score;
    $match_hometeam_extra_score = $value->match_hometeam_extra_score;
    $match_awayteam_extra_score = $value->match_awayteam_extra_score;
    $match_hometeam_penalty_score = $value->match_hometeam_penalty_score;
    $match_awayteam_penalty_score = $value->match_awayteam_penalty_score;
    $match_hometeam_system = $value->match_hometeam_system;
    $match_awayteam_system = $value->match_awayteam_system;
    $match_live = $value->match_live;
    ?>
                                
                                <tr mid="1059" class="match m1059" >
    <td class="pos">
                                        <div class="evt-pos"><?php echo $n; ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="evt-date"><?php 
                                            echo $match_date;
                                          ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="evt-date"><?php 
                                            echo $match_time;
                                          ?>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="evt-title"><span class="home"><?php echo $match_hometeam_name; 
                                        ?></span>
                                            <span class="vs">v</span>
                                               <span class="away"><?php echo $match_awayteam_name;
                                                 ?></span>    
                                        </div>
                                    </td>
                                       
                                    <td class="result"><?php if ($match_live =='1') { ?>
                                    <font color="brown">
                                       <?php echo $match_status;?>
                                           
                                    </font>
                                   <?php } else{ ?>
                                    <font color="white">
                                       <?php echo $match_status;?>
                                           
                                    </font>
                                  <?php } ?>
                                                
                                    </td>
                                    <td class="score"><?php if ($match_live =='1') { ?>
                                    <font color="brown">
                                        
                                   <?php  echo $match_hometeam_score; ?>-<?php echo $match_awayteam_score; ?>
                                           
                                    </font>
                                  <?php } else{ ?>
                                    <font color="white">
                                        
                                   <?php  echo $match_hometeam_score;
                                      ?>-<?php echo $match_awayteam_score; }
                                     ?>
                                         
                                     </font>
                                                
                                    </td>'

    <?php }
}
?>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div id="ft">
    <div id="footer-sitemap">
        <div class="footer-links">
            <ul class="menu-block">
                <div class="footer_header">
                    
                </div>
                    <div class="footer_header">Payment Methods:</div>
                    <a href="sports.html#deposit">
                        <img class="" src="images/online/b3/milebets/788466.jpeg" style="width: 50%;">
                    </a>
            </ul>
            <div style='clear: both;'></div>
        </div>
    </div>
    <div class="copyright">&copy;2019 milebets | <a href="#">Terms &amp; Conditions</a></div>
</div>
<script src="v4.69/js/plugins/pools/pools.js"></script>
</body>
<script type="text/javascript" src="v4.69/js/common/betdb.js"></script>
<script type="text/javascript" src="v4.69/js/common/coupon.js"></script>
<script type="text/javascript" src="v4.69/js/common/coupon_boa.js"></script>
<script type="text/javascript" src="v4.69/js/common/slip2.js"></script>
<script type="text/javascript" src="v4.69/js/common/betregister.js"></script>
<script type="text/javascript" src="v4.69/js/coupon/markets.js"></script>
<script type="text/javascript" src="v4.69/js/common/b3coupon.js"></script>
<script type="text/javascript" src="v4.69/js/online/b3.js"></script>
<script type="text/javascript" src="v4.69/js/newonline/pages.js"></script>
<script type="text/javascript" src="v4.69/js/newonline/account.js"></script>
</html>
