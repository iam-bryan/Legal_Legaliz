<?php
// /api/auth/register.php

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/user.php';
require_once __DIR__ . '/../objects/client.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$client = new Client($db);

$data = json_decode(file_get_contents("php://input"));

if (empty($data->first_name) || empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. First name, email, and password are required."]);
    exit();
}

try {
    $user->email = $data->email;
    if ($user->emailExists()) {
        http_response_code(409);
        echo json_encode(["message" => "This email address is already registered."]);
        exit();
    }

    $db->beginTransaction();

    $user->first_name = $data->first_name;
    $user->last_name = $data->last_name;
    $user->password = $data->password;
    $user->role = 'client';
    
    if (!$user->create()) {
        throw new Exception("Unable to create user in the database.");
    }

    $client->user_id = $user->id;
    $client->name = $user->first_name . ' ' . $user->last_name;
    $client->email = $user->email;

    if (!$client->create()) {
        throw new Exception("Unable to create client profile in the database.");
    }

    $db->commit();

    http_response_code(201);
    echo json_encode(["message" => "User was successfully created."]);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(503);
    echo json_encode([
        "message" => "Registration failed due to a server error.",
        "error" => $e->getMessage()
    ]);
}
?>