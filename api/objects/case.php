<?php
// /api/objects/case.php

class CaseItem {
    // Database connection and table name
    private $conn;
    private $table_name = "cases";

    // Object Properties
    public $id;
    public $client_id;
    public $client_name;
    public $lawyer_id;
    public $lawyer_name;
    public $title;
    public $description;
    public $status;
    public $progress;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Read all cases based on user role.
     */
    function read($user_id, $role) {
        $query = "SELECT c.id, c.title, c.status, c.progress, c.created_at, cl.name as client_name, CONCAT(u.first_name, ' ', u.last_name) as lawyer_name FROM " . $this->table_name . " c LEFT JOIN clients cl ON c.client_id = cl.id LEFT JOIN users u ON c.lawyer_id = u.id";
        $where_clause = "";
        $params = [];

        switch ($role) {
            case 'lawyer':
            case 'staff':
                $where_clause = " WHERE c.lawyer_id = :user_id";
                $params[':user_id'] = $user_id;
                break;
            case 'client':
                $where_clause = " WHERE c.client_id = (SELECT id FROM clients WHERE user_id = :user_id)";
                $params[':user_id'] = $user_id;
                break;
        }

        $query .= $where_clause . " ORDER BY c.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Read a single case by ID with access control.
     */
    function readOne($user_id, $role): bool {
        $query = "SELECT c.id, c.title, c.description, c.status, c.progress, c.created_at, cl.name as client_name, cl.id as client_id, CONCAT(u.first_name, ' ', u.last_name) as lawyer_name, u.id as lawyer_id FROM " . $this->table_name . " c LEFT JOIN clients cl ON c.client_id = cl.id LEFT JOIN users u ON c.lawyer_id = u.id WHERE c.id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) return false;

        $is_accessible = false;
        if (in_array($role, ['admin', 'partner'])) {
            $is_accessible = true;
        } elseif (($role === 'lawyer' || $role === 'staff') && $row['lawyer_id'] == $user_id) {
            $is_accessible = true;
        } elseif ($role === 'client') {
            $client_stmt = $this->conn->prepare("SELECT user_id FROM clients WHERE id = ?");
            $client_stmt->execute([$row['client_id']]);
            $client_user = $client_stmt->fetch();
            if ($client_user && $client_user['user_id'] == $user_id) {
                $is_accessible = true;
            }
        }

        if (!$is_accessible) return false;

        $this->title = $row['title'];
        $this->description = $row['description'];
        $this->status = $row['status'];
        $this->progress = $row['progress'];
        $this->client_id = $row['client_id'];
        $this->client_name = $row['client_name'];
        $this->lawyer_id = $row['lawyer_id'];
        $this->lawyer_name = $row['lawyer_name'];
        $this->created_at = $row['created_at'];
        return true;
    }

    /**
     * Create a new case.
     */
    function create($role): bool {
        if (!in_array($role, ['admin', 'partner', 'lawyer', 'staff'])) {
            return false;
        }
        $query = "INSERT INTO " . $this->table_name . " SET title=:title, description=:description, client_id=:client_id, lawyer_id=:lawyer_id, status=:status, progress=:progress";
        $stmt = $this->conn->prepare($query);

        $this->title=htmlspecialchars(strip_tags($this->title));
        $this->description=htmlspecialchars(strip_tags($this->description));
        $this->client_id=htmlspecialchars(strip_tags($this->client_id));
        $this->lawyer_id=htmlspecialchars(strip_tags($this->lawyer_id));
        $this->status = 'open';
        $this->progress = 0;

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":client_id", $this->client_id);
        $stmt->bindParam(":lawyer_id", $this->lawyer_id);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":progress", $this->progress);

        if($stmt->execute()){
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    /**
     * Update an existing case.
     */
    function update($user_id, $role): bool {
        $check_query = "SELECT lawyer_id FROM " . $this->table_name . " WHERE id = ?";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $this->id);
        $check_stmt->execute();
        $row = $check_stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return false;

        $is_allowed = false;
        if (in_array($role, ['admin', 'partner']) || (($role === 'lawyer' || $role === 'staff') && $row['lawyer_id'] == $user_id)) {
            $is_allowed = true;
        }
        if (!$is_allowed) return false;

        $query = "UPDATE " . $this->table_name . " SET title = :title, description = :description, status = :status, progress = :progress, client_id = :client_id, lawyer_id = :lawyer_id WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->title=htmlspecialchars(strip_tags($this->title));
        $this->description=htmlspecialchars(strip_tags($this->description));
        $this->status=htmlspecialchars(strip_tags($this->status));
        $this->progress=htmlspecialchars(strip_tags($this->progress));
        $this->client_id=htmlspecialchars(strip_tags($this->client_id));
        $this->lawyer_id=htmlspecialchars(strip_tags($this->lawyer_id));
        $this->id=htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':progress', $this->progress);
        $stmt->bindParam(':client_id', $this->client_id);
        $stmt->bindParam(':lawyer_id', $this->lawyer_id);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()){
            return true;
        }
        return false;
    }

    /**
     * Delete a case.
     */
    function delete($role): bool {
        // Only admins and partners can delete cases
        if (!in_array($role, ['admin', 'partner'])) {
            return false;
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        $this->id=htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()){
            return true;
        }
        return false;
    }
}
?>