<?php

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
require_once 'db_connect.php';

// Initialize response
$response = array();

try {
    // Check if requesting single product
    if (isset($_GET['id'])) {
        $product_id = $conn->real_escape_string($_GET['id']);
        
        $sql = "SELECT * FROM products WHERE product_id = '$product_id'";
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception("Query failed: " . $conn->error);
        }
        
        if ($result->num_rows > 0) {
            $products = array();
            while ($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
            $response['success'] = true;
            $response['products'] = $products;
        } else {
            $response['success'] = false;
            $response['message'] = 'Product not found';
        }
    }
    // Check if requesting featured products
    else if (isset($_GET['featured'])) {
        $sql = "SELECT * FROM products WHERE is_featured = 1 LIMIT 6";
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception("Query failed: " . $conn->error);
        }
        
        if ($result->num_rows > 0) {
            $products = array();
            while ($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
            $response['success'] = true;
            $response['products'] = $products;
        } else {
            $response['success'] = false;
            $response['message'] = 'No featured products found';
        }
    }
    // Get all products
    else {
        $sql = "SELECT * FROM products ORDER BY created_at DESC";
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception("Query failed: " . $conn->error);
        }
        
        if ($result->num_rows > 0) {
            $products = array();
            while ($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
            $response['success'] = true;
            $response['products'] = $products;
            $response['count'] = count($products);
        } else {
            $response['success'] = false;
            $response['message'] = 'No products found in database';
        }
    }
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = 'Error: ' . $e->getMessage();
    $response['sql'] = isset($sql) ? $sql : 'No SQL';
}


if (isset($conn)) {
    $conn->close();
}

// Send response
echo json_encode($response);
?>