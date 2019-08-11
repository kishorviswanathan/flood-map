<?php
	// Database configurations
	$host = "localhost";
	$uname = "root";
	$password = "";
	$db = "FloodData";
	$conn = new mysqli($host,$uname,$password,$db);
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	} 

	// Get user IP for logging
	function getUserIpAddr(){
	    if(!empty($_SERVER['HTTP_CLIENT_IP'])){
	        //ip from share internet
	        $ip = $_SERVER['HTTP_CLIENT_IP'];
	    }elseif(!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
	        //ip pass from proxy
	        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	    }else{
	        $ip = $_SERVER['REMOTE_ADDR'];
	    }
	    return $ip;
	}
?>
