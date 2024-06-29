<?php 
    require 'database_connection.php'; 

    if($_SERVER['REQUEST_METHOD'] == 'POST') {

        $task_name = htmlspecialchars($_POST['task_name']); 
        $task_due_date = htmlspecialchars($_POST['task_due_date']); 
        $task_due_time = htmlspecialchars($_POST['task_due_time']); 
        $task_priority = htmlspecialchars($_POST['task_priority']); 

        $sql = 'INSERT INTO todo_list (task_name, task_due_date, task_due_time, task_priority) VALUES (:task_name, :task_due_date, :task_due_time, :task_priority)'; 
        $stmt = $pdo->prepare($sql); 

        try {
            $stmt->execute(['task_name'=>$task_name, 'task_due_date'=>$task_due_date, 'task_due_time'=>$task_due_time, 'task_priority'=>$task_priority]); 
            echo 'Added Task Successfully!'; 
        } catch(PDOException $e) {
            echo "Error: ".$e->getMessage(); 
        }
    }
?>