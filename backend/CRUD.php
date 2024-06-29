<?php
require 'config.inc.php'; // Include your database configuration

// Get the raw POST data
$rawData = file_get_contents("php://input");
$task = json_decode($rawData, true);

if (is_array($task)) {
    try {
        $dsn = "mysql:host=" . HOST . ";dbname=" . DB_NAME;
        $pdo = new PDO($dsn, USERNAME, PASSWORD);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Check if the task ID exists in the database
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM todo_list WHERE id = :id");
        $stmt->execute(['id' => $task['id']]);
        $taskExists = $stmt->fetchColumn();

        if ($taskExists) {
            // Update existing task
            $sql = 'UPDATE todo_list SET task_name = :task_name, task_due_date = :task_date, task_due_time = :task_time, task_priority = :priority WHERE id = :id';
        } else {
            // Insert new task
            $sql = 'INSERT INTO todo_list (id, task_name, task_due_date, task_due_time, task_priority) VALUES (:id, :task_name, :task_date, :task_time, :priority)';
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $task['id'],
            ':task_name' => htmlspecialchars($task['task_name']),
            ':task_date' => htmlspecialchars($task['task_date']),
            ':task_time' => htmlspecialchars($task['task_time']),
            ':priority' => htmlspecialchars($task['priority'])
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Task saved successfully.']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input data.']);
}
?>
