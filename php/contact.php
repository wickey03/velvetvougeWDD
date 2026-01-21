<?php

header('Content-Type: application/json');
require_once 'db_connect.php';

// Initialize response
$response = array();

// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get form data
    $name = $conn->real_escape_string($_POST['name']);
    $email = $conn->real_escape_string($_POST['email']);
    $subject = $conn->real_escape_string($_POST['subject']);
    $message = $conn->real_escape_string($_POST['message']);
    

    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        $response['success'] = false;
        $response['message'] = 'Please fill in all fields';
    } else {
        // Insert inquiry into database
        $sql = "INSERT INTO inquiries (name, email, subject, message, status) 
                VALUES ('$name', '$email', '$subject', '$message', 'New')";
        
 
        if ($conn->query($sql) === TRUE) {
            $response['success'] = true;
            $response['message'] = 'Your message has been sent successfully';
        } else {
            $response['success'] = false;
            $response['message'] = 'Failed to send message: ' . $conn->error;
        }
    }
} else {
    $response['success'] = false;
    $response['message'] = 'Invalid request method';
}


$conn->close();

// Send response
echo json_encode($response);
?>