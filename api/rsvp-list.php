<?php
require_once __DIR__ . '/config.php';
requireAuth();

$eventId = $_GET['event_id'] ?? '';
if (!$eventId) jsonRes(['error' => 'event_id required'], 400);

$conn = db();
$stmt = $conn->prepare('SELECT * FROM rsvps WHERE event_id = ? ORDER BY created_at DESC');
$stmt->bind_param('s', $eventId);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

jsonRes(['data' => $rows]);
