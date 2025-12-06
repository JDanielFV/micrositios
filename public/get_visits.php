<?php
// Allow access from any origin (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

// File path
$logFile = 'visits.json';

// Check if file exists
if (file_exists($logFile)) {
    // Read and output the file content
    readfile($logFile);
} else {
    // Return empty array if file doesn't exist
    echo '[]';
}
?>
