<?php

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'st-monica-parish-secret-2025');

function db() {
  static $conn = null;
  if ($conn === null) {
    $host = getenv('DB_HOST') ?: 'localhost';
    $port = getenv('DB_PORT') ?: '3306';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') ?: '';
    $name = getenv('DB_NAME') ?: 'st_monica_parish';
    $conn = new mysqli($host, $user, $pass, $name, (int)$port);
    if ($conn->connect_error) {
      http_response_code(500);
      echo json_encode(['error' => 'Database connection failed']);
      exit;
    }
    $conn->set_charset('utf8mb4');
  }
  return $conn;
}

function cors() {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  header('Content-Type: application/json; charset=utf-8');
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
}

function jsonRes($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function jsonBody() {
  $body = file_get_contents('php://input');
  $data = json_decode($body, true);
  if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    jsonRes(['error' => 'Invalid JSON body'], 400);
  }
  return $data ?: [];
}

function getBearerToken() {
  $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
    return $m[1];
  }
  return null;
}

function authenticate() {
  $token = getBearerToken();
  if (!$token) return null;
  require_once __DIR__ . '/vendor/autoload.php';
  try {
    $payload = Firebase\JWT\JWT::decode($token, new Firebase\JWT\Key(JWT_SECRET, 'HS256'));
    return (array) $payload;
  } catch (Exception $e) {
    return null;
  }
}

function requireAuth() {
  $user = authenticate();
  if (!$user) {
    jsonRes(['error' => 'Unauthorized'], 401);
  }
  return $user;
}

function ensureUploadsDir() {
  $dir = __DIR__ . '/uploads';
  if (!is_dir($dir)) mkdir($dir, 0755, true);
  return $dir;
}
