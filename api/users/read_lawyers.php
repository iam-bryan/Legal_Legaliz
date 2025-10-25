<?php
// /api/users/read_lawyers.php

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/validate_token.php'; // Secure this endpoint

$database = new Database();
$db = $database->getConnection();

// Simple query to get users with lawyer or partner roles
$query = "SELECT id, first_name, last_name FROM users WHERE role IN ('lawyer', 'partner') ORDER BY last_name ASC";
$stmt = $db->prepare($query);

try {
    $stmt->execute();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $lawyers_arr = ["records" => []];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $lawyer_item = [
                "id" => $id,
                "name" => $first_name . ' ' . $last_name
            ];
            array_push($lawyers_arr["records"], $lawyer_item);
        }
        http_response_code(200);
        echo json_encode($lawyers_arr);
    } else {
        http_response_code(200);
        echo json_encode(["records" => [], "message" => "No lawyers found."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching lawyers.", "error" => $e->getMessage()]);
}
?>