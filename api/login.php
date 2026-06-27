<?php
require_once __DIR__ . '/config.php';

$body = jsonBody();
$username = $body['username'] ?? '';
$password = $body['password'] ?? '';

if (!$username || !$password) {
  jsonRes(['error' => 'Username and password required'], 400);
}

$conn = db();
$stmt = $conn->prepare('SELECT * FROM users WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
  jsonRes(['error' => 'Invalid credentials'], 401);
}

$stored = $user['password'];
if (!password_verify($password, $stored)) {
  jsonRes(['error' => 'Invalid credentials'], 401);
}

require_once __DIR__ . '/vendor/autoload.php';

$payload = [
  'id' => (int) $user['id'],
  'username' => $user['username'],
  'iat' => time(),
  'exp' => time() + (7 * 24 * 3600),
];

$token = Firebase\JWT\JWT::encode($payload, JWT_SECRET, 'HS256');
jsonRes(['token' => $token]);
