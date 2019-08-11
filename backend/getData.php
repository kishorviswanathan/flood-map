<?php
	include "db.php";

	// Respond as JSON with key as id and set of coordinates as value.
	$resp = array();
	$result = $conn->query("SELECT report_id,lat,lng FROM coordinates WHERE report_id NOT IN (SELECT id FROM reports WHERE deleted = 1)");
	if($result){
		while($row = mysqli_fetch_assoc($result)){
			if(!isset($resp[$row['report_id']]))
				$resp[$row['report_id']] = array();
			array_push($resp[$row['report_id']],[$row['lat'],$row['lng']]);
		}
	}

	header('Content-Type: application/json');
	echo json_encode($resp);
?>