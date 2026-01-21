<?php


header('Content-Type: application/json');
require_once 'db_connect.php';

// Initialize response
$response = array();

// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get form data
    $fullname = $conn->real_escape_string($_POST['fullname']);
    $email = $conn->real_escape_string($_POST['email']);
    $username = $conn->real_escape_string($_POST['username']);
    $password = $_POST['password'];
    $phone = isset($_POST['phone']) ? $conn->real_escape_string($_POST['phone']) : '';
    
    // Validate inputs 
    if (empty($fullname) || empty($email) || empty($username) || empty($password)) {
        $response['success'] = false;
        $response['message'] = 'Please fill in all required fields';
    } else if (strlen($password) < 6) {
        $response['success'] = false;
        $response['message'] = 'Password must be at least 6 characters';
    } else {
        // Check if email already exists
        $check_email = "SELECT * FROM users WHERE email = '$email'";
        $result = $conn->query($check_email);
        
        //  check email
        if ($result->num_rows > 0) {
            $response['success'] = false;
            $response['message'] = 'Email already registered';
        } else {
            // Check if username already exists
            $check_username = "SELECT * FROM users WHERE username = '$username'";
            $result = $conn->query($check_username);
            
            //check username
            if ($result->num_rows > 0) {
                $response['success'] = false;
                $response['message'] = 'Username already taken';
            } else {
                // Hash password
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                
                // Insert new user
                $sql = "INSERT INTO users (username, email, password, full_name, phone, user_type) 
                        VALUES ('$username', '$email', '$hashed_password', '$fullname', '$phone', 'customer')";
                
                
                if ($conn->query($sql) === TRUE) {
                    $response['success'] = true;
                    $response['message'] = 'Registration successful';
                } else {
                    $response['success'] = false;
                    $response['message'] = 'Registration failed: ' . $conn->error;
                }
            }
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