<?php
if ($_SERVER['REQUEST_METHOD'] == "POST") {
	$email = filter_var(trim($POST["email"]), FILTER_SANITIZE_EMAIL);

	if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
		$file = 'subscribers.txt';

		//Append the email to the file with a newline
		file_put_contents($file, $email. PHP_EOL, FILE_APPEND | LOCK_EX);

		echo "Thank you for subscribing!";
	}else{
		echo "Invalid email address";
	}
}else{
	echo "Invalid request" 
}
?>