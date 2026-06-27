<?php
require_once __DIR__ . '/config.php';

$section = $_GET['section'] ?? '';
$id = $_GET['id'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];
$conn = db();

$valid = ['events', 'gallery', 'spotlight', 'sports', 'hof', 'leadership', 'families', 'programs', 'football_squad'];
if (!in_array($section, $valid)) {
  jsonRes(['error' => 'Invalid section'], 400);
}

function parseRow($row) {
  if (!$row) return $row;
  foreach (['images', 'members', 'stats'] as $field) {
    if (isset($row[$field]) && is_string($row[$field])) {
      $decoded = json_decode($row[$field], true);
      $row[$field] = is_array($decoded) ? $decoded : [];
    }
  }
  return $row;
}

function parseRows($rows) {
  return array_map('parseRow', $rows);
}

function jsonCol($body, $key, $default = '[]') {
  $v = $body[$key] ?? $default;
  return is_array($v) ? json_encode($v) : $v;
}

$desc_sections = ['events', 'gallery', 'spotlight', 'sports'];
$db_order = in_array($section, $desc_sections) ? 'DESC' : 'ASC';

$role_rank = ['chairperson' => 1, 'vice chairperson' => 2, 'secretary' => 3, 'assistant secretary' => 4, 'treasurer' => 5, 'organizing secretary' => 6];

function sortByRole(&$items) {
  global $role_rank;
  usort($items, function($a, $b) use ($role_rank) {
    $ra = $role_rank[strtolower($a['role'] ?? '')] ?? 99;
    $rb = $role_rank[strtolower($b['role'] ?? '')] ?? 99;
    return $ra <=> $rb;
  });
}

if ($method === 'GET') {
  if (!$id) {
    $result = $conn->query("SELECT * FROM `$section` ORDER BY id $db_order");
    $rows = parseRows($result->fetch_all(MYSQLI_ASSOC));
    if ($section === 'leadership') sortByRole($rows);
    jsonRes(['data' => $rows]);
  } else {
    $stmt = $conn->prepare("SELECT * FROM `$section` WHERE id = ?");
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $row = parseRow($stmt->get_result()->fetch_assoc());
    if (!$row) jsonRes(['error' => 'Not found'], 404);
    jsonRes($row);
  }
}

if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
  $user = requireAuth();
}

if ($method === 'POST') {
  $body = jsonBody();
  $itemId = $body['id'] ?? (dechex(time()) . substr(bin2hex(random_bytes(2)), 0, 4));

  switch ($section) {
    case 'events': {
      $a = $itemId;
      $b = $body['title'] ?? '';
      $c = $body['date'] ?? '';
      $d = $body['time'] ?? '';
      $e = $body['location'] ?? '';
      $f = $body['status'] ?? 'upcoming';
      $g = (float)($body['duration'] ?? 2);
      $h = $body['description'] ?? '';
      $i = $body['image'] ?? '';
      $j = !empty($body['homepage']) ? 1 : 0;
      $stmt = $conn->prepare(
        'INSERT INTO events (id, title, date, time, location, status, duration, description, image, homepage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      $stmt->bind_param('ssssssdssi', $a, $b, $c, $d, $e, $f, $g, $h, $i, $j);
      break;
    }
    case 'gallery': {
      $a = $itemId;
      $b = $body['title'] ?? '';
      $c = $body['meta'] ?? '';
      $d = jsonCol($body, 'images');
      $stmt = $conn->prepare('INSERT INTO gallery (id, title, meta, images) VALUES (?, ?, ?, ?)');
      $stmt->bind_param('ssss', $a, $b, $c, $d);
      break;
    }
    case 'spotlight': {
      $a = $itemId;
      $b = $body['type'] ?? '';
      $c = $body['event'] ?? '';
      $d = $body['date'] ?? '';
      $e = $body['title'] ?? '';
      $f = $body['subtitle'] ?? '';
      $g = $body['image'] ?? '';
      $stmt = $conn->prepare(
        'INSERT INTO spotlight (id, type, event, date, title, subtitle, image) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      $stmt->bind_param('sssssss', $a, $b, $c, $d, $e, $f, $g);
      break;
    }
    case 'sports': {
      $a = $itemId;
      $b = $body['sport'] ?? 'football';
      $c = $body['competition'] ?? '';
      $d = $body['date'] ?? '';
      $e = $body['team1'] ?? '';
      $f = $body['team2'] ?? '';
      $g = (int)($body['score1'] ?? 0);
      $h = (int)($body['score2'] ?? 0);
      $i = $body['notes'] ?? '';
      $j = $body['notes2'] ?? '';
      $stmt = $conn->prepare(
        'INSERT INTO sports (id, sport, competition, date, team1, team2, score1, score2, notes, notes2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      $stmt->bind_param('ssssssiiss', $a, $b, $c, $d, $e, $f, $g, $h, $i, $j);
      break;
    }
    case 'hof': {
      $a = $itemId;
      $b = $body['icon'] ?? '';
      $c = $body['year'] ?? '';
      $d = $body['title'] ?? '';
      $e = $body['desc'] ?? '';
      $stmt = $conn->prepare('INSERT INTO hof (id, icon, year, title, `desc`) VALUES (?, ?, ?, ?, ?)');
      $stmt->bind_param('sssss', $a, $b, $c, $d, $e);
      break;
    }
    case 'leadership': {
      $a = $itemId;
      $b = $body['name'] ?? '';
      $c = $body['role'] ?? '';
      $d = $body['initials'] ?? '';
      $e = $body['color'] ?? '';
      $f = $body['img'] ?? '';
      $g = $body['quote'] ?? '';
      $stmt = $conn->prepare(
        'INSERT INTO leadership (id, name, role, initials, color, img, quote) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      $stmt->bind_param('sssssss', $a, $b, $c, $d, $e, $f, $g);
      break;
    }
    case 'families': {
      $a = $itemId;
      $b = $body['name'] ?? '';
      $c = $body['sub'] ?? '';
      $d = $body['color'] ?? '';
      $e = jsonCol($body, 'members');
      $stmt = $conn->prepare('INSERT INTO families (id, name, sub, color, members) VALUES (?, ?, ?, ?, ?)');
      $stmt->bind_param('sssss', $a, $b, $c, $d, $e);
      break;
    }
    case 'programs': {
      $a = $itemId;
      $b = $body['title'] ?? '';
      $c = $body['desc'] ?? '';
      $d = $body['meta'] ?? '';
      $stmt = $conn->prepare('INSERT INTO programs (id, title, `desc`, meta) VALUES (?, ?, ?, ?)');
      $stmt->bind_param('ssss', $a, $b, $c, $d);
      break;
    }
    case 'football_squad': {
      $a = $itemId;
      $b = $body['name'] ?? '';
      $c = (int)($body['num'] ?? 0);
      $d = $body['label'] ?? '';
      $e = $body['group'] ?? '';
      $f = (int)($body['x'] ?? 50);
      $g = (int)($body['y'] ?? 50);
      $h = $body['color'] ?? '';
      $i = $body['img'] ?? '';
      $j = $body['position'] ?? '';
      $k = (int)($body['rating'] ?? 50);
      $l = jsonCol($body, 'stats', '{}');
      $stmt = $conn->prepare(
        'INSERT INTO football_squad (id, name, num, label, `group`, x, y, color, img, position, rating, stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      $stmt->bind_param('ssissiisssis', $a, $b, $c, $d, $e, $f, $g, $h, $i, $j, $k, $l);
      break;
    }
  }
  $stmt->execute();

  $stmt = $conn->prepare("SELECT * FROM `$section` WHERE id = ?");
  $stmt->bind_param('s', $itemId);
  $stmt->execute();
  $item = parseRow($stmt->get_result()->fetch_assoc());
  jsonRes($item, 201);
}

if ($method === 'PUT') {
  if (!$id) jsonRes(['error' => 'id required'], 400);
  $body = jsonBody();

  $stmt = $conn->prepare("SELECT * FROM `$section` WHERE id = ?");
  $stmt->bind_param('s', $id);
  $stmt->execute();
  $existing = $stmt->get_result()->fetch_assoc();
  if (!$existing) jsonRes(['error' => 'Not found'], 404);

  switch ($section) {
    case 'events': {
      $a = $body['title'] ?? $existing['title'];
      $b = $body['date'] ?? $existing['date'];
      $c = $body['time'] ?? $existing['time'];
      $d = $body['location'] ?? $existing['location'];
      $e = $body['status'] ?? $existing['status'];
      $f = (float)($body['duration'] ?? $existing['duration']);
      $g = $body['description'] ?? $existing['description'];
      $h = $body['image'] ?? $existing['image'];
      $i = isset($body['homepage']) ? (!empty($body['homepage']) ? 1 : 0) : (int)($existing['homepage'] ?? 0);
      $stmt = $conn->prepare(
        'UPDATE events SET title=?, date=?, time=?, location=?, status=?, duration=?, description=?, image=?, homepage=? WHERE id=?'
      );
      $stmt->bind_param('sssssdssis', $a, $b, $c, $d, $e, $f, $g, $h, $i, $id);
      break;
    }
    case 'gallery': {
      $a = $body['title'] ?? $existing['title'];
      $b = $body['meta'] ?? $existing['meta'];
      $c = jsonCol($body, 'images') ?: $existing['images'];
      $stmt = $conn->prepare('UPDATE gallery SET title=?, meta=?, images=? WHERE id=?');
      $stmt->bind_param('ssss', $a, $b, $c, $id);
      break;
    }
    case 'spotlight': {
      $a = $body['type'] ?? $existing['type'];
      $b = $body['event'] ?? $existing['event'];
      $c = $body['date'] ?? $existing['date'];
      $d = $body['title'] ?? $existing['title'];
      $e = $body['subtitle'] ?? $existing['subtitle'];
      $f = $body['image'] ?? $existing['image'];
      $stmt = $conn->prepare(
        'UPDATE spotlight SET type=?, event=?, date=?, title=?, subtitle=?, image=? WHERE id=?'
      );
      $stmt->bind_param('sssssss', $a, $b, $c, $d, $e, $f, $id);
      break;
    }
    case 'sports': {
      $a = $body['sport'] ?? $existing['sport'];
      $b = $body['competition'] ?? $existing['competition'];
      $c = $body['date'] ?? $existing['date'];
      $d = $body['team1'] ?? $existing['team1'];
      $e = $body['team2'] ?? $existing['team2'];
      $f = (int)($body['score1'] ?? $existing['score1']);
      $g = (int)($body['score2'] ?? $existing['score2']);
      $h = $body['notes'] ?? $existing['notes'];
      $i = $body['notes2'] ?? $existing['notes2'] ?? '';
      $stmt = $conn->prepare(
        'UPDATE sports SET sport=?, competition=?, date=?, team1=?, team2=?, score1=?, score2=?, notes=?, notes2=? WHERE id=?'
      );
      $stmt->bind_param('ssssssiiss', $a, $b, $c, $d, $e, $f, $g, $h, $i, $id);
      break;
    }
    case 'hof': {
      $a = $body['icon'] ?? $existing['icon'];
      $b = $body['year'] ?? $existing['year'];
      $c = $body['title'] ?? $existing['title'];
      $d = $body['desc'] ?? $existing['desc'];
      $stmt = $conn->prepare('UPDATE hof SET icon=?, year=?, title=?, `desc`=? WHERE id=?');
      $stmt->bind_param('sssss', $a, $b, $c, $d, $id);
      break;
    }
    case 'leadership': {
      $a = $body['name'] ?? $existing['name'];
      $b = $body['role'] ?? $existing['role'];
      $c = $body['initials'] ?? $existing['initials'];
      $d = $body['color'] ?? $existing['color'];
      $e = $body['img'] ?? $existing['img'];
      $f = $body['quote'] ?? $existing['quote'];
      $stmt = $conn->prepare('UPDATE leadership SET name=?, role=?, initials=?, color=?, img=?, quote=? WHERE id=?');
      $stmt->bind_param('sssssss', $a, $b, $c, $d, $e, $f, $id);
      break;
    }
    case 'families': {
      $a = $body['name'] ?? $existing['name'];
      $b = $body['sub'] ?? $existing['sub'];
      $c = $body['color'] ?? $existing['color'];
      $d = jsonCol($body, 'members') ?: $existing['members'];
      $stmt = $conn->prepare('UPDATE families SET name=?, sub=?, color=?, members=? WHERE id=?');
      $stmt->bind_param('sssss', $a, $b, $c, $d, $id);
      break;
    }
    case 'programs': {
      $a = $body['title'] ?? $existing['title'];
      $b = $body['desc'] ?? $existing['desc'];
      $c = $body['meta'] ?? $existing['meta'];
      $stmt = $conn->prepare('UPDATE programs SET title=?, `desc`=?, meta=? WHERE id=?');
      $stmt->bind_param('ssss', $a, $b, $c, $id);
      break;
    }
    case 'football_squad': {
      $a = $body['name'] ?? $existing['name'];
      $b = (int)($body['num'] ?? $existing['num']);
      $c = $body['label'] ?? $existing['label'];
      $d = $body['group'] ?? $existing['group'];
      $e = (int)($body['x'] ?? $existing['x']);
      $f = (int)($body['y'] ?? $existing['y']);
      $g = $body['color'] ?? $existing['color'];
      $h = $body['img'] ?? $existing['img'];
      $i = $body['position'] ?? $existing['position'];
      $j = (int)($body['rating'] ?? $existing['rating']);
      $k = jsonCol($body, 'stats', '{}') ?: $existing['stats'];
      $stmt = $conn->prepare(
        'UPDATE football_squad SET name=?, num=?, label=?, `group`=?, x=?, y=?, color=?, img=?, position=?, rating=?, stats=? WHERE id=?'
      );
      $stmt->bind_param('sissiisssiss', $a, $b, $c, $d, $e, $f, $g, $h, $i, $j, $k, $id);
      break;
    }
  }
  $stmt->execute();

  $stmt = $conn->prepare("SELECT * FROM `$section` WHERE id = ?");
  $stmt->bind_param('s', $id);
  $stmt->execute();
  $item = parseRow($stmt->get_result()->fetch_assoc());
  jsonRes($item);
}

if ($method === 'DELETE') {
  if (!$id) jsonRes(['error' => 'id required'], 400);
  $stmt = $conn->prepare("DELETE FROM `$section` WHERE id = ?");
  $stmt->bind_param('s', $id);
  $stmt->execute();
  if ($stmt->affected_rows === 0) jsonRes(['error' => 'Not found'], 404);
  jsonRes(['success' => true]);
}

jsonRes(['error' => 'Method not allowed'], 405);