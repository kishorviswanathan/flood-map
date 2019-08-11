<?php
	// Delete a marked road
	if(!isset($_REQUEST['id']))
		die();

	include 'db.php';
	
	// Allow a max of 2 deletions per 10 minutes
	$result = $conn->query("SELECT id from reports where dip ='".getUserIpAddr()."' and dtimestamp > date_sub(now(), interval 10 minute)");
	if(mysqli_num_rows($result) == 2)
	    die("You have made 2 deletions in the last 10 minutes. Try again after 10 minutes.");

	$conn->query("UPDATE reports set deleted = 1, dip = '".getUserIpAddr()."', dtimestamp = NOW() WHERE id = ".$_REQUEST['id']);
?>