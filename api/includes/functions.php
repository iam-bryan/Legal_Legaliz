<?php
// /api/includes/functions.php

/**
 * Logs an activity to the activity_log table.
 *
 * @param PDO $db Database connection object.
 * @param int|null $user_id ID of the user performing the action (can be null for system actions).
 * @param string $action_type A short code for the action (e.g., 'CASE_CREATED').
 * @param string $description A human-readable description of the action.
 * @param string|null $entity_type Optional type of related entity (e.g., 'case', 'document').
 * @param int|null $entity_id Optional ID of the related entity.
 */
function logActivity($db, $user_id, $action_type, $description, $entity_type = null, $entity_id = null) {
    // Basic validation
    if (empty($db) || empty($action_type) || empty($description)) {
        error_log("logActivity failed: Missing required parameters.");
        return;
    }

    try {
        $sql = "INSERT INTO activity_log (user_id, action_type, description, related_entity_type, related_entity_id)
                VALUES (:user_id, :action_type, :description, :entity_type, :entity_id)";
        $stmt = $db->prepare($sql);

        // Bind parameters carefully, handling potential nulls and types
        $stmt->bindParam(':user_id', $user_id, $user_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindParam(':action_type', $action_type, PDO::PARAM_STR);
        $stmt->bindParam(':description', $description, PDO::PARAM_STR);
        $stmt->bindParam(':entity_type', $entity_type, $entity_type === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':entity_id', $entity_id, $entity_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);

        $stmt->execute();
    } catch (PDOException $e) {
        // Log the error but don't stop the main script execution
        error_log("Failed to log activity: UserID={$user_id}, Action={$action_type}, Error: " . $e->getMessage());
    } catch (Exception $e) {
        error_log("General error in logActivity: " . $e->getMessage());
    }
}
?>