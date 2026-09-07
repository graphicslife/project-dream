<?php
// Database connection for InfinityFree

$host = "sql306.infinityfree.com";           // MySQL host from InfinityFree
$db   = "if0_40880347_XXXMySQL";            // Database name
$user = "if0_40880347";                      // MySQL username
$pass = "PARVwAnGeH7";                       // MySQL password

// Create connection
$conn = mysqli_connect($host, $user, $pass, $db);

// Check connection
if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}

// Optional: set charset to avoid encoding issues
mysqli_set_charset($conn, "utf8");
?>
