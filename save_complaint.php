<?php
// إعداد الاتصال بقاعدة البيانات
$servername = "localhost";
$username = "root"; // غيّر حسب إعداداتك
$password = "";     // غيّر حسب إعداداتك
$dbname = "server_db";

$conn = new mysqli($servername, $username, $password, $dbname);

// التحقق من الاتصال
if ($conn->connect_error) {
  die("فشل الاتصال: " . $conn->connect_error);
}

// استقبال البيانات من الفورم
$name = isset($_POST['name']) ? mysqli_real_escape_string($conn, $_POST['name']) : '';
$complaint = isset($_POST['complaint']) ? mysqli_real_escape_string($conn, $_POST['complaint']) : '';

if (!empty($name) && !empty($complaint)) {
  // إدخال البيانات في الجدول
  $sql = "INSERT INTO complaints (name, complaint) VALUES ('$name', '$complaint')";

  if ($conn->query($sql) === TRUE) {
    echo "تم حفظ الشكوى بنجاح!";
  } else {
    echo "خطأ: " . $conn->error;
  }
} else {
  echo "يرجى ملء جميع الحقول المطلوبة.";
}

$conn->close();
?>
