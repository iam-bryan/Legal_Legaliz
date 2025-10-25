<?php
// /api/objects/schedule.php

class Schedule {
    private $conn;
    private $table_name = "schedules";

    // Object Properties
    public $id;
    public $case_id;
    public $scheduled_by;
    public $event_title;
    public $start_date;
    public $end_date;
    public $location;
    public $notes;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Reads schedule events based on user role and a date range.
     */
    public function read($user_id, $role, $start_range, $end_range) {
        $query = "SELECT s.id, s.event_title as title, s.start_date as start, s.end_date as end, c.title as case_title, s.case_id, s.location, s.notes, s.status
                  FROM " . $this->table_name . " s
                  LEFT JOIN cases c ON s.case_id = c.id";

        $where_clause = " WHERE s.start_date BETWEEN :start_range AND :end_range";
        $params = [
            ':start_range' => $start_range,
            ':end_range' => $end_range
        ];

        // Role-based filtering
        switch ($role) {
            case 'lawyer':
            case 'staff':
                // Join with cases to filter by lawyer_id
                $query .= " JOIN cases case_filter ON s.case_id = case_filter.id";
                $where_clause .= " AND case_filter.lawyer_id = :user_id";
                $params[':user_id'] = $user_id;
                break;
            case 'client':
                 // Join with cases to filter by client_id
                $query .= " JOIN cases case_filter ON s.case_id = case_filter.id";
                $where_clause .= " AND case_filter.client_id = (SELECT id FROM clients WHERE user_id = :user_id)";
                $params[':user_id'] = $user_id;
                break;
        }

        $query .= $where_clause . " ORDER BY s.start_date ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Creates a new schedule event.
     */
    public function create(): bool {
        $query = "INSERT INTO " . $this->table_name . "
                  SET case_id=:case_id, scheduled_by=:scheduled_by, event_title=:event_title, start_date=:start_date, end_date=:end_date, location=:location, notes=:notes, status=:status";
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->case_id=htmlspecialchars(strip_tags($this->case_id));
        $this->scheduled_by=htmlspecialchars(strip_tags($this->scheduled_by));
        $this->event_title=htmlspecialchars(strip_tags($this->event_title));
        $this->start_date=htmlspecialchars(strip_tags($this->start_date));
        $this->end_date=!empty($this->end_date) ? htmlspecialchars(strip_tags($this->end_date)) : null;
        $this->location=htmlspecialchars(strip_tags($this->location));
        $this->notes=htmlspecialchars(strip_tags($this->notes));
        $this->status = 'pending'; // Default status

        $stmt->bindParam(":case_id", $this->case_id);
        $stmt->bindParam(":scheduled_by", $this->scheduled_by);
        $stmt->bindParam(":event_title", $this->event_title);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":end_date", $this->end_date);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":status", $this->status);

        if($stmt->execute()){
            return true;
        }
        return false;
    }

    /**
     * Updates an existing schedule event.
     */
    public function update(): bool {
        // A full permission check would verify if the user is assigned to the case.
        // For simplicity, we assume the check is done in the endpoint.
        $query = "UPDATE " . $this->table_name . "
                  SET event_title=:event_title, start_date=:start_date, end_date=:end_date, location=:location, notes=:notes, status=:status
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);

        $this->id=htmlspecialchars(strip_tags($this->id));
        $this->event_title=htmlspecialchars(strip_tags($this->event_title));
        $this->start_date=htmlspecialchars(strip_tags($this->start_date));
        $this->end_date=!empty($this->end_date) ? htmlspecialchars(strip_tags($this->end_date)) : null;
        $this->location=htmlspecialchars(strip_tags($this->location));
        $this->notes=htmlspecialchars(strip_tags($this->notes));
        $this->status=htmlspecialchars(strip_tags($this->status));

        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":event_title", $this->event_title);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":end_date", $this->end_date);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":status", $this->status);

        if($stmt->execute()){
            return true;
        }
        return false;
    }

    /**
     * Deletes a schedule event.
     */
    public function delete(): bool {
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