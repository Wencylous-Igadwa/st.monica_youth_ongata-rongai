<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = db();

if ($method === 'GET') {
  $stmt = $conn->prepare("SELECT * FROM football_stats WHERE id = 'singleton'");
  $stmt->execute();
  $row = $stmt->get_result()->fetch_assoc();
  if ($row) {
    unset($row['id']);
    jsonRes(['data' => $row]);
  }
  jsonRes(['data' => ['matches' => 0, 'goals' => 0, 'cleanSheets' => 0, 'trophies' => 0]]);
}

if ($method === 'PUT') {
  $user = requireAuth();
  $body = jsonBody();

  $stmt = $conn->prepare(
    "INSERT INTO football_stats (id, matches, goals, cleanSheets, trophies) VALUES ('singleton', ?, ?, ?, ?) ON DUPLICATE KEY UPDATE matches=?, goals=?, cleanSheets=?, trophies=?"
  );
  $stmt->bind_param('iiiiiiii',
    (int)($body['matches'] ?? 0), (int)($body['goals'] ?? 0),
    (int)($body['cleanSheets'] ?? 0), (int)($body['trophies'] ?? 0),
    (int)($body['matches'] ?? 0), (int)($body['goals'] ?? 0),
    (int)($body['cleanSheets'] ?? 0), (int)($body['trophies'] ?? 0)
  );
  $stmt->execute();

  jsonRes(['success' => true]);
}

jsonRes(['error' => 'Method not allowed'], 405);
