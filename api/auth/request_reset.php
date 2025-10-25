<?php
// /api/auth/request_reset.php

// Allow errors for debugging locally
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/core.php'; // Includes CORS, JWT settings (though not used directly here)
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/user.php'; // To check if email exists

// --- Dependencies for Email (Install via Composer: composer require phpmailer/phpmailer) ---
// use PHPMailer\PHPMailer\PHPMailer;
// use PHPMailer\PHPMailer\Exception;
// require_once __DIR__ . '/../vendor/autoload.php';
// --- End Email Dependencies ---


$database = new Database();
$db = $database->getConnection();
$user = new User($db); // Instantiate User object to check email

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || !filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Please enter a valid email address."]);
    exit();
}

$user->email = $data->email;

// Check if the email exists in the users table
if (!$user->emailExists()) {
    // SECURITY NOTE: Return a generic success message even if email doesn't exist
    // to prevent attackers from discovering registered emails.
    http_response_code(200);
    echo json_encode(["message" => "If an account exists for this email, a password reset link has been sent."]);
    exit();
}

try {
    // Generate a secure token
    $token = bin2hex(random_bytes(32)); // Creates a 64-character hex token

    // Set expiration time (e.g., 1 hour from now)
    $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // --- Store the token in the database ---
    // First, delete any existing tokens for this email to prevent conflicts
    $delete_sql = "DELETE FROM password_resets WHERE email = :email";
    $delete_stmt = $db->prepare($delete_sql);
    $delete_stmt->bindParam(':email', $user->email);
    $delete_stmt->execute();

    // Now, insert the new token
    $insert_sql = "INSERT INTO password_resets (email, token, expires_at) VALUES (:email, :token, :expires_at)";
    $insert_stmt = $db->prepare($insert_sql);
    $insert_stmt->bindParam(':email', $user->email);
    $insert_stmt->bindParam(':token', $token);
    $insert_stmt->bindParam(':expires_at', $expires_at);

    if (!$insert_stmt->execute()) {
        throw new Exception("Database error: Could not store reset token.");
    }

    // --- (Conceptual) Send the Email ---
    $resetLink = "http://localhost:3000/reset-password?token=" . $token; // Frontend URL + token

    /*
    // ---- PHPMailer Example (Requires setup) ----
    $mail = new PHPMailer(true);
    try {
        //Server settings - Configure with your SMTP details (e.g., from Hostinger or Gmail)
        $mail->isSMTP();
        $mail->Host       = 'smtp.example.com'; // Your SMTP server
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your_email@example.com';
        $mail->Password   = 'your_password';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // or ENCRYPTION_SMTPS
        $mail->Port       = 587; // or 465 for SMTPS

        //Recipients
        $mail->setFrom('no-reply@yourdomain.com', 'Password Reset');
        $mail->addAddress($user->email); // Add a recipient

        //Content
        $mail->isHTML(true);
        $mail->Subject = 'Password Reset Request';
        $mail->Body    = "Hello,<br><br>You requested a password reset. Click the link below to reset your password:<br><br>"
                       . "<a href='" . $resetLink . "'>" . $resetLink . "</a><br><br>"
                       . "This link will expire in 1 hour.<br><br>If you did not request this, please ignore this email.";
        $mail->AltBody = "Hello,\n\nYou requested a password reset. Copy and paste the following link into your browser to reset your password:\n\n"
                       . $resetLink . "\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.";

        $mail->send();
        // Email sent successfully
    } catch (Exception $e) {
        // Log the email error but still return generic success to user
        error_log("Mailer Error: {$mail->ErrorInfo}");
        // Don't throw the exception here to maintain the generic response below
    }
    // ---- End PHPMailer Example ----
    */

    // --- End Email Sending ---

    // Send generic success response regardless of email success/failure
    http_response_code(200);
    echo json_encode(["message" => "If an account exists for this email, a password reset link has been sent."]);

} catch (Exception $e) {
    error_log("Password Reset Request Error: " . $e->getMessage()); // Log the actual error
    http_response_code(500);
    // Send a generic error to the user for security
    echo json_encode(["message" => "An error occurred while processing your request. Please try again later."]);
}
?>