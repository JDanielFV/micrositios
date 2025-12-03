<?php
// Prevent caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

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

// File path
$logFile = 'visits.json';

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
