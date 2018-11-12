<?PHP
	$hostname='192.168.2.177:3306';
	$username='Tekainos';
	$password='7340Tekainos';
	$dbname='uhs_workflow';

	mysql_connect($hostname, $username, $password) or die("<html><script language='Javascript'>alert('Unable to connect to database'), history.go(-1)</script></html>");

	mysql_select_db($dbname);

	$day = date("Y-m-d");
	$query = "SELECT soldDate, projectNum, jobName, jobStatus, jobType, laborCategory, storeNum, custName, phoneNum FROM ims_in_log WHERE transdate > $day";

	$result = mysql_query($query);
	
	$messages = array();
	while ($row =  mysql_fetch_array($result)) {
		array_push($messages, $row);
	}
	echo json_encode($messages);
?>