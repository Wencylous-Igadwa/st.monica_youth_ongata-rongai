<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $body = jsonBody();
  $event_id = $body['event_id'] ?? '';
  $event_title = $body['event_title'] ?? '';
  $name = $body['name'] ?? '';
  $phone = $body['phone'] ?? '';

  if (!$event_id || !$name || !$phone) {
    jsonRes(['error' => 'event_id, name, and phone are required'], 400);
  }

  $conn = db();
  $stmt = $conn->prepare(
    'INSERT INTO rsvps (event_id, event_title, name, phone) VALUES (?, ?, ?, ?)'
  );
  $stmt->bind_param('ssss', $event_id, $event_title, $name, $phone);
  $stmt->execute();
  $newId = $conn->insert_id;

  $stmt = $conn->prepare('SELECT * FROM rsvps WHERE id = ?');
  $stmt->bind_param('i', $newId);
  $stmt->execute();
  $rsvp = $stmt->get_result()->fetch_assoc();
  jsonRes($rsvp, 201);
}

jsonRes(['error' => 'Method not allowed'], 405);
