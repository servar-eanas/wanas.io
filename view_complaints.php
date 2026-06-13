<?php
$servername = "localhost";
$username = "root"; // غيّر حسب إعداداتك
$password = "";     // غيّر حسب إعداداتك
$dbname = "server_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("فشل الاتصال: " . $conn->connect_error);
}

$result = $conn->query("SELECT * FROM complaints ORDER BY id DESC");
?>

<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <title>عرض الشكاوي</title>
</head>
<body>
  <h1>الشكاوي المحفوظة</h1>
  <ul>
    <?php if ($result && $result->num_rows > 0): ?>
      <?php while($row = $result->fetch_assoc()): ?>
        <li>
          <strong><?php echo htmlspecialchars($row['name']); ?>:</strong>
          <?php echo htmlspecialchars($row['complaint']); ?>
          <em>(<?php echo isset($row['created_at']) ? htmlspecialchars($row['created_at']) : 'تاريخ غير معروف'; ?>)</em>
        </li>
      <?php endwhile; ?>
    <?php else: ?>
      <li>لا توجد شكاوى حالياً.</li>
    <?php endif; ?>
  </ul>
</body>
</html>

<?php $conn->close(); ?>
