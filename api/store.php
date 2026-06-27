<?php
require_once __DIR__ . '/config.php';

$key = $_GET['store_key'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$allowed = ['gallery_sphere', 'gallery_grid'];
if (!in_array($key, $allowed)) {
  jsonRes(['error' => 'Invalid key'], 400);
}

$conn = db();

if ($method === 'GET') {
  $stmt = $conn->prepare('SELECT `value` FROM kv_store WHERE `key` = ?');
  $stmt->bind_param('s', $key);
  $stmt->execute();
  $row = $stmt->get_result()->fetch_assoc();
  $value = $row ? json_decode($row['value'], true) : [];
  jsonRes(['data' => $value]);
}

if ($method === 'PUT') {
  $user = requireAuth();
  $body = jsonBody();
  $value = json_encode($body['data'] ?? []);

  $stmt = $conn->prepare('INSERT INTO kv_store (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?');
  $stmt->bind_param('sss', $key, $value, $value);
  $stmt->execute();

  jsonRes(['success' => true, 'data' => $body['data'] ?? []]);
}

jsonRes(['error' => 'Method not allowed'], 405);
