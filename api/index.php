<?php
require_once __DIR__ . '/config.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
$path = preg_replace('#^/api#', '', $uri);

if ($path === '' || $path === '/') {
  jsonRes(['message' => 'St. Monica Parish API']);
}

switch (true) {
  case $path === '/login' && $method === 'POST':
    require __DIR__ . '/login.php';
    break;

  case $path === '/upload' && $method === 'POST':
    require __DIR__ . '/upload.php';
    break;

  case $path === '/uploads' && $method === 'GET':
    require __DIR__ . '/upload.php';
    break;

  case $path === '/rsvp' && $method === 'POST':
    require __DIR__ . '/rsvp.php';
    break;

  case preg_match('#^/rsvp/([^/]+)$#', $path, $m) && $method === 'GET':
    $_GET['event_id'] = $m[1];
    require __DIR__ . '/rsvp-list.php';
    break;

  case preg_match('#^/rsvp/([^/]+)/pdf$#', $path, $m) && $method === 'GET':
    $_GET['event_id'] = $m[1];
    require __DIR__ . '/rsvp-pdf.php';
    break;

  case preg_match('#^/(events|gallery|spotlight|sports|hof|leadership|families|programs|football_squad)(?:/([^/]+))?$#', $path, $m):
    $_GET['section'] = $m[1];
    $_GET['id'] = $m[2] ?? null;
    require __DIR__ . '/crud.php';
    break;

  case preg_match('#^/store/([^/]+)$#', $path, $m):
    $_GET['store_key'] = $m[1];
    require __DIR__ . '/store.php';
    break;

  case $path === '/football_stats' && $method === 'GET':
    require __DIR__ . '/football-stats.php';
    break;

  case $path === '/football_stats' && $method === 'PUT':
    require __DIR__ . '/football-stats.php';
    break;

  default:
    jsonRes(['error' => 'Not found'], 404);
}
