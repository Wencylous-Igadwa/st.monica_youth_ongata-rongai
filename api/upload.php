<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
  $user = requireAuth();

  $uploadDir = ensureUploadsDir();
  $files = $_FILES['file'] ?? null;
  if (!$files) jsonRes(['error' => 'No files provided'], 400);

  $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'];
  $allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'];
  $urls = [];

  function validateImage($tmpPath, $ext, $allowedExt, $allowedMime) {
    if (!in_array($ext, $allowedExt)) return false;
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $tmpPath);
    finfo_close($finfo);
    return in_array($mime, $allowedMime);
  }

  if (is_array($files['name'])) {
    foreach ($files['name'] as $i => $name) {
      if ($files['error'][$i] !== UPLOAD_ERR_OK) continue;
      $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
      if (!validateImage($files['tmp_name'][$i], $ext, $allowed, $allowedMime)) continue;
      $newName = time() . '-' . substr(bin2hex(random_bytes(4)), 0, 6) . '.' . $ext;
      move_uploaded_file($files['tmp_name'][$i], "$uploadDir/$newName");
      $urls[] = "/uploads/$newName";
    }
  } else {
    if ($files['error'] !== UPLOAD_ERR_OK) jsonRes(['error' => 'Upload failed'], 500);
    $ext = strtolower(pathinfo($files['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) jsonRes(['error' => 'File type not supported'], 415);
    if ($files['size'] > 10 * 1024 * 1024) jsonRes(['error' => 'File too large (max 10MB)'], 413);
    if (!validateImage($files['tmp_name'], $ext, $allowed, $allowedMime)) jsonRes(['error' => 'File content does not match extension'], 415);
    $newName = time() . '-' . substr(bin2hex(random_bytes(4)), 0, 6) . '.' . $ext;
    move_uploaded_file($files['tmp_name'], "$uploadDir/$newName");
    $urls[] = "/uploads/$newName";
  }

  jsonRes(['urls' => $urls], 201);
}

if ($method === 'GET') {
  $user = requireAuth();

  $uploadDir = ensureUploadsDir();
  $files = scandir($uploadDir);
  $result = [];
  foreach ($files as $f) {
    if ($f === '.' || $f === '..') continue;
    $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'])) continue;
    $path = "$uploadDir/$f";
    $result[] = [
      'name' => $f,
      'url' => "/uploads/$f",
      'uploadedAt' => date('c', filemtime($path)),
    ];
  }
  usort($result, fn($a, $b) => strtotime($b['uploadedAt']) - strtotime($a['uploadedAt']));
  jsonRes(['data' => $result]);
}

jsonRes(['error' => 'Method not allowed'], 405);
