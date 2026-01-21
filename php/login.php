<?php

header('Content-Type: application/json');
require_once 'db_connect.php';

// Initialize response
$response = array();

// Check if form is submitted 
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get form data
    $email = $conn->real_escape_string($_POST['email']);
    $password = $_POST['password'];
    

    if (empty($email) || empty($password)) {
        $response['success'] = false;
        $response['message'] = 'Please fill in all fields';
    } else {
        // Query to find user
        $sql = "SELECT * FROM users WHERE email = '$email' LIMIT 1";
        $result = $conn->query($sql);
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            

            if (password_verify($password, $user['password'])) {
                // Login successful
                $response['success'] = true;
                $response['message'] = 'Login successful';
                $response['user'] = array(
                    'user_id' => $user['user_id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'user_type' => $user['user_type']
                );
            } else {
                // Wrong password
                $response['success'] = false;
                $response['message'] = 'Invalid email or password';
            }
        } else {
            // User not found
            $response['success'] = false;
            $response['message'] = 'Invalid email or password';
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