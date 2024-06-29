<?php 
    require 'config.inc.php'; 
    $dsn = "mysql:host=". HOST . ";dbname=". DB_NAME; 

    try {
    $pdo = new PDO($dsn, USERNAME, PASSWORD); 
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
    } catch(PDOException $e) {
        echo 'Error: '.$e->getMessage(); 
    }
?>