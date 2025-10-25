<?php // /api/cases/update.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/case.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $case = new CaseItem($db);
$user_id = $decoded->data->id; $user_role = $decoded->data->role; $data = json_decode(file_get_contents("php://input"));
if (empty($data->id) || empty($data->title) || empty($data->client_id) || !isset($data->client_id) || empty($data->lawyer_id) || !isset($data->lawyer_id) || !isset($data->status) || !isset($data->progress)) { http_response_code(400); echo json_encode(["message" => "Incomplete data."]); exit(); }
$case->id = $data->id; $case->title = $data->title; $case->description = $data->description ?? ''; $case->status = $data->status; $case->progress = max(0, min(100, (int)$data->progress)); $case->client_id = $data->client_id; $case->lawyer_id = $data->lawyer_id;
if ($case->update($user_id, $user_role)) {
    // --- UPDATED LOGGING (No ID in description) ---
    $log_description = "Updated case: '" . htmlspecialchars($case->title) . "'";
    logActivity($db, $user_id, 'CASE_UPDATED', $log_description, 'case', $case->id);
    // --- END LOGGING ---
    http_response_code(200); echo json_encode(["message" => "Case updated."]);
} else { http_response_code(403); echo json_encode(["message" => "Update failed. No permission, case not found, or no changes submitted."]); }
?>