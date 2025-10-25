<?php
// /api/objects/client.php

class Client {
    private $conn;
    private $table_name = "clients";

    // Object Properties
    public $id;
    public $user_id;
    public $name;
    public $email;
    public $contact;
    public $address;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Read all clients.
     * Only accessible by admin, partner, lawyer, and staff roles.
     */
    function read($role) {
        if (!in_array($role, ['admin', 'partner', 'lawyer', 'staff'])) {
            return false; // Permission denied
        }
        $query = "SELECT id, name, email, contact, address, created_at FROM " . $this->table_name . " ORDER BY name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Read a single client by ID.
     */
    function readOne() {
        $query = "SELECT id, name, email, contact, address, created_at FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->contact = $row['contact'];
            $this->address = $row['address'];
            $this->created_at = $row['created_at'];
        }
    }

    /**
     * Create a new client record (typically linked to a user account).
     * This is an expanded version for manual creation by staff/lawyers.
     */
    function create(): bool {
        $query = "INSERT INTO " . $this->table_name . " SET user_id = :user_id, name = :name, email = :email, contact = :contact, address = :address";
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->contact = htmlspecialchars(strip_tags($this->contact));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":contact", $this->contact);
        $stmt->bindParam(":address", $this->address);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    /**
     * Update an existing client record.
     */
    function update(): bool {
        $query = "UPDATE " . $this->table_name . " SET name = :name, email = :email, contact = :contact, address = :address WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->contact = htmlspecialchars(strip_tags($this->contact));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':contact', $this->contact);
        $stmt->bindParam(':address', $this->address);
        $stmt->bindParam(':id', $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    /**
     * Delete a client record.
     */
    function delete(): bool {
        // Note: Consider business logic here. Deleting a client might require reassigning cases.
        // For simplicity, we allow deletion, but cascading deletes are handled by the DB constraints.
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>