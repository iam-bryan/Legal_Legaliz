<?php // /api/cases/create.php
ini_set('display_errors', 1); error_reporting(E_ALL);
require_once __DIR__ . '/../config/core.php'; // Includes functions.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/case.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database(); $db = $database->getConnection(); $case = new CaseItem($db);
$user_role = $decoded->data->role; $user_id = $decoded->data->id;
$data = json_decode(file_get_contents("php://input"));

if (empty($data->title) || empty($data->client_id) || !isset($data->client_id) || empty($data->lawyer_id) || !isset($data->lawyer_id)) { http_response_code(400); echo json_encode(["message" => "Incomplete data. Title, client ID, and lawyer ID required."]); exit(); }
try {
    $case->title = $data->title; $case->description = $data->description ?? ''; $case->client_id = $data->client_id; $case->lawyer_id = $data->lawyer_id;
    if ($case->create($user_role)) {
        // --- UPDATED LOGGING (No ID in description) ---
        $log_description = "Created case: '" . htmlspecialchars($case->title) . "'";
        logActivity($db, $user_id, 'CASE_CREATED', $log_description, 'case', $case->id);
        // --- END LOGGING ---
        http_response_code(201); echo json_encode(["message" => "Case created.", "case_id" => $case->id]);
    } else { http_response_code(403); echo json_encode(["message" => "Access denied to create case."]); }
} catch (Exception $e) { http_response_code(500); echo json_encode(["message" => "Server error creating case.", "error" => $e->getMessage()]); }
?>