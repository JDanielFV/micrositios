<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Prevent caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Handle GET request (Retrieve visits)
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (file_exists($logFile)) {
        echo file_get_contents($logFile);
    } else {
        echo json_encode([]);
    }
    exit;
}

// Handle POST request (Record visit)
// Get data
$data = json_decode(file_get_contents('php://input'), true);

$page = isset($data['page']) ? $data['page'] : (isset($_GET['page']) ? $_GET['page'] : 'unknown');
$ip = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];
$timestamp = date('Y-m-d H:i:s');

// Log entry
$entry = [
    'timestamp' => $timestamp,
    'ip' => $ip,
    'page' => $page,
    'userAgent' => $userAgent
];

// Read existing data
$currentData = [];
if (file_exists($logFile)) {
    $jsonContent = file_get_contents($logFile);
    $currentData = json_decode($jsonContent, true);
    if (!is_array($currentData)) {
        $currentData = [];
    }
}

// Append new entry
$currentData[] = $entry;

// Save back to file
file_put_contents($logFile, json_encode($currentData, JSON_PRETTY_PRINT));

// Return success
header('Content-Type: application/json');
echo json_encode(['status' => 'success']);
?>
