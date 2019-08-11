<?php

	// Insert a new road into database.

	if(!isset($_GET['road']))
		die();

	$data = json_decode($_GET['road']);

	if($data == null)
		die();
	
	include 'db.php';

	$result = $conn->query("INSERT INTO reports(ip) VALUES ('".getUserIpAddr()."')");
	if($result){
		$last_id = mysqli_insert_id($conn);
		foreach ($data as $coordinate) {
			$conn->query("INSERT INTO coordinates(report_id,lat,lng) VALUES ($last_id,$coordinate[0],$coordinate[1])");
		}
	}
?>