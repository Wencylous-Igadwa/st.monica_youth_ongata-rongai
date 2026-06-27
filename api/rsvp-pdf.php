<?php
require_once __DIR__ . '/config.php';
requireAuth();

$eventId = $_GET['event_id'] ?? '';
if (!$eventId) jsonRes(['error' => 'event_id required'], 400);

$conn = db();

$stmt = $conn->prepare('SELECT title FROM events WHERE id = ?');
$stmt->bind_param('s', $eventId);
$stmt->execute();
$event = $stmt->get_result()->fetch_assoc();

$stmt = $conn->prepare('SELECT * FROM rsvps WHERE event_id = ? ORDER BY created_at ASC');
$stmt->bind_param('s', $eventId);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$eventTitle = $event ? $event['title'] : (count($rows) > 0 ? $rows[0]['event_title'] : 'Event');
$safeName = preg_replace('/[^a-zA-Z0-9\s-]/', '', $eventTitle);
$safeName = trim(preg_replace('/\s+/', ' ', $safeName)) ?: 'Attendance List';

require_once __DIR__ . '/vendor/autoload.php';

$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
$pdf->SetCreator('St. Monica Catholic Youth Parish');
$pdf->SetAuthor('St. Monica Parish');
$pdf->SetTitle('Attendance List - ' . $eventTitle);
$pdf->SetMargins(50, 50, 50);
$pdf->SetAutoPageBreak(true, 70);
$pdf->AddPage();

$GOLD = '#b8860b';
$DARK = '#2c2416';
$MUTED = '#6b5d4a';
$pageW = $pdf->getPageWidth() - 100;

$pdf->SetFillColor(250, 246, 240);
$pdf->Rect(0, 0, $pdf->getPageWidth(), 120, 'F');

$pdf->SetDrawColor(184, 134, 11);
$pdf->SetLineWidth(2.5);
$pdf->Line($pdf->getPageWidth() / 2 - 9, 55, $pdf->getPageWidth() / 2 + 9, 55);
$pdf->Line($pdf->getPageWidth() / 2 - 9 * 0.65, 55 - 9 * 0.3, $pdf->getPageWidth() / 2 + 9 * 0.65, 55 - 9 * 0.3);
$pdf->Line($pdf->getPageWidth() / 2 - 9 * 0.65, 55 + 9 * 0.3, $pdf->getPageWidth() / 2 + 9 * 0.65, 55 + 9 * 0.3);

$pdf->SetFont('helvetica', 'B', 22);
$pdf->SetTextColor(44, 36, 22);
$pdf->setXY(50, 65);
$pdf->Cell($pageW, 10, 'St. Monica Catholic Youth Parish', 0, 1, 'C');

$pdf->SetFont('helvetica', '', 11);
$pdf->SetTextColor(107, 93, 74);
$pdf->setX(50);
$pdf->Cell($pageW, 8, "Faith  \xc2\xb7  Hope  \xc2\xb7  Love", 0, 1, 'C');

$pdf->SetFillColor(184, 134, 11);
$pdf->Rect(50, 120, $pageW, 2, 'F');

$pdf->SetFont('helvetica', 'B', 16);
$pdf->SetTextColor(44, 36, 22);
$pdf->setXY(50, 150);
$pdf->Cell($pageW, 10, 'Attendance List', 0, 1, 'C');

$pdf->SetFont('helvetica', '', 13);
$pdf->SetTextColor(107, 93, 74);
$pdf->setX(50);
$pdf->Cell($pageW, 8, $eventTitle, 0, 1, 'C');

if (count($rows) === 0) {
  $pdf->SetFont('helvetica', '', 12);
  $pdf->SetTextColor(107, 93, 74);
  $pdf->setXY(50, 230);
  $pdf->Cell($pageW, 10, 'No attendees registered yet.', 0, 1, 'C');
} else {
  $pdf->SetFont('helvetica', '', 10);
  $pdf->SetTextColor(107, 93, 74);
  $pdf->setXY(50, 218);
  $pdf->Cell($pageW, 8, "Total Attendees: " . count($rows), 0, 1, 'R');

  $tableTop = 240;
  $colX = [50, 60, 320, 460];
  $colW = [10, 260, 140, 100];
  $headers = ['#', 'Name', 'Phone', 'Registered'];

  $pdf->SetFillColor(240, 232, 216);
  $pdf->Rect(50, $tableTop - 4, $pageW, 22, 'F');

  $pdf->SetFont('helvetica', 'B', 10);
  $pdf->SetTextColor(44, 36, 22);
  $y = $tableTop;
  foreach ($headers as $i => $h) {
    $align = $i === 0 ? 'C' : 'L';
    $pdf->setXY($colX[$i], $y);
    $pdf->Cell($colW[$i], 8, $h, 0, 0, $align);
  }

  $pdf->SetFillColor(184, 134, 11);
  $pdf->Rect(50, $tableTop + 18, $pageW, 1, 'F');

  $y = $tableTop + 28;
  foreach ($rows as $i => $row) {
    if ($y > $pdf->getPageHeight() - 80) {
      $pdf->AddPage();
      $y = 50;
    }
    if ($i % 2 === 0) {
      $pdf->SetFillColor(250, 246, 240);
      $pdf->Rect(50, $y - 4, $pageW, 20, 'F');
    }
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor(44, 36, 22);
    $pdf->setXY($colX[0], $y);
    $pdf->Cell($colW[0], 8, strval($i + 1), 0, 0, 'C');
    $pdf->setXY($colX[1], $y);
    $pdf->Cell($colW[1], 8, $row['name'], 0, 0, 'L');
    $pdf->setXY($colX[2], $y);
    $pdf->Cell($colW[2], 8, $row['phone'], 0, 0, 'L');
    $date = $row['created_at'] ? substr($row['created_at'], 0, 10) : '-';
    $pdf->setXY($colX[3], $y);
    $pdf->Cell($colW[3], 8, $date, 0, 0, 'L');
    $y += 22;
  }
}

$pdf->SetFillColor(184, 134, 11);
$pdf->Rect(50, $pdf->getPageHeight() - 70, $pageW, 1, 'F');

$pdf->SetFont('helvetica', '', 8);
$pdf->SetTextColor(187, 187, 187);
$pdf->setXY(50, $pdf->getPageHeight() - 55);
$pdf->Cell($pageW, 8, "St. Monica Catholic Youth Parish  \xc2\xb7  Generated automatically", 0, 0, 'C');

$pdf->Output($safeName . ' - Attendance List.pdf', 'D');
