<?php

// Database configuration
$host = 'localhost';
$dbname = 'velvetvouge_db';
$username = 'root';
$password = '';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);


$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // Log error to file
    error_log("Database connection failed: " . $conn->connect_error);
    
    // Send JSON error response
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed',
        'error' => $conn->connect_error,
        'host' => $host,
        'database' => $dbname
    ]);
    exit();
}

$conn->set_charset("utf8");
?>

