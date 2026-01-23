<?php
session_start();
header('Content-Type: application/json');
require_once 'db_connect.php';

// Initialize response
$response = [
    'success' => false,
    'message' => 'Unknown error'
];

// Allow POST only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method';
    echo json_encode($response);
    exit;
}

// Get form data
$login = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Validate
if (empty($login) || empty($password)) {
    $response['message'] = 'Please fill in all fields';
    echo json_encode($response);
    exit;
}

// Prepared statement (username OR email)
$sql = "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    $response['message'] = 'Database error';
    echo json_encode($response);
    exit;
}

$stmt->bind_param("ss", $login, $login);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    $response['message'] = 'Invalid email/username or password';
    echo json_encode($response);
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    $response['message'] = 'Invalid email/username or password';
    echo json_encode($response);
    exit;
}


// Set session variables
$_SESSION['user_id']   = $user['user_id'];
$_SESSION['username']  = $user['username'];
$_SESSION['email']     = $user['email'];
$_SESSION['user_type'] = $user['user_type'];

// Build response
$response['success'] = true;
$response['message'] = 'Login successful';
$response['user'] = [
    'user_id'   => $user['user_id'],
    'username'  => $user['username'],
    'email'     => $user['email'],
    'full_name' => $user['full_name'],
    'user_type' => $user['user_type']
];

// Optional: frontend redirect hint
$response['redirect'] = ($user['user_type'] === 'admin')
    ? 'admin/index.php'
    : 'index.php';

$stmt->close();
$conn->close();

// Send JSON
echo json_encode($response);
exit;
