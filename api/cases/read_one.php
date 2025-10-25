<?php
// /api/cases/read_one.php

// Required headers
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/case.php';

// Validate JWT to secure the endpoint
require_once __DIR__ . '/../auth/validate_token.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate case object
$case = new CaseItem($db);

// Get user details from the decoded JWT
$user_id = $decoded->data->id;
$role = $decoded->data->role;

// Get the case ID from the URL query string
$case->id = isset($_GET['id']) ? $_GET['id'] : die();

// Attempt to read the case details
// The readOne method now includes the access control logic
if ($case->readOne($user_id, $role)) {
    // Create an array from the case object's properties
    $case_details = array(
        "id" => $case->id,
        "title" => $case->title,
        "description" => $case->description,
        "status" => $case->status,
        "progress" => $case->progress,
        "client_id" => $case->client_id,
        "client_name" => $case->client_name,
        "lawyer_id" => $case->lawyer_id,
        "lawyer_name" => $case->lawyer_name,
        "created_at" => $case->created_at
    );

    http_response_code(200);
    echo json_encode($case_details);
} else {
    // If readOne returns false, the case either doesn't exist or the user lacks permission
    http_response_code(404); // Use 404 Not Found for both scenarios
    echo json_encode(array("message" => "Case not found or you do not have permission to view it."));
}
?>