<?php
date_default_timezone_set('Africa/Nairobi');
$servername='localhost';
$username='root';
$password='';
$dbname='scorebible';
$conn = mysqli_connect($servername, $username, $password, $dbname);
    if (!$conn) 
    {
    die("Connection failed: " . mysqli_connect_error());
    }
$APIkey='';
?>