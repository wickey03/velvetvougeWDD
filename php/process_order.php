<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$response = array();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $order_data = json_decode($_POST['order_data'], true);
    
    $user_id = $order_data['user_id'];
    $address = $conn->real_escape_string($order_data['address']);
    $payment_method = $conn->real_escape_string($order_data['payment_method']);
    $total_amount = floatval($order_data['total_amount']);
    
    // Insert order
    $sql = "INSERT INTO orders (user_id, total_amount, order_status, payment_method, shipping_address) 
            VALUES ('$user_id', '$total_amount', 'Pending', '$payment_method', '$address')";
    
    if ($conn->query($sql) === TRUE) {
        $order_id = $conn->insert_id;
        
        // Insert order items
        foreach ($order_data['items'] as $item) {
            $product_id = intval($item['product_id']);
            $quantity = intval($item['quantity']);
            $price = floatval($item['price']);
            $size = $conn->real_escape_string($item['size']);
            $color = $conn->real_escape_string($item['color']);
            
            $item_sql = "INSERT INTO order_items (order_id, product_id, quantity, price, selected_size, selected_color) 
                        VALUES ('$order_id', '$product_id', '$quantity', '$price', '$size', '$color')";
            $conn->query($item_sql);
        }
        
        $response['success'] = true;
        $response['order_id'] = $order_id;
    } else {
        $response['success'] = false;
        $response['message'] = 'Failed to create order';
    }
} else {
    $response['success'] = false;
    $response['message'] = 'Invalid request';
}

$conn->close();
echo json_encode($response);
?>