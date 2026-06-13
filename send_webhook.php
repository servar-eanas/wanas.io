<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// إعدادات الروابط الخاصة بالديسكورد (Discord Webhooks)
// يمكنك وضع الروابط الحقيقية هنا لتبقى مخفية تماماً عن المستخدمين والزوار
$webhooks = [
    'apply' => 'https://discord.com/api/webhooks/1515321872219246672/q1Uq2p15R8BLfJWIhT2SJB9wHd6GPgIYdNxbzlwXkLUTHaZVmqlzecjrB7BiT3XBnVTA',
    'complaints' => 'https://discord.com/api/webhooks/1515321872219246672/q1Uq2p15R8BLfJWIhT2SJB9wHd6GPgIYdNxbzlwXkLUTHaZVmqlzecjrB7BiT3XBnVTA',
    'contact' => 'https://discord.com/api/webhooks/1515321872219246672/q1Uq2p15R8BLfJWIhT2SJB9wHd6GPgIYdNxbzlwXkLUTHaZVmqlzecjrB7BiT3XBnVTA'
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

$type = $input['type'] ?? '';
$payload = $input['payload'] ?? null;

if (!isset($webhooks[$type])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid webhook type: " . $type]);
    exit;
}

$webhookUrl = $webhooks[$type];

if (empty($webhookUrl) || $webhookUrl === 'YOUR_DISCORD_WEBHOOK_URL_HERE') {
    // إذا لم يكن مهيئاً في PHP، سنرجع رسالة تفيد بذلك لتسهيل معرفة المشكلة
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Webhook URL not configured in send_webhook.php"]);
    exit;
}

if (!$payload) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Payload is empty"]);
    exit;
}

// إرسال الطلب إلى الديسكورد عبر cURL
$ch = curl_init($webhookUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code >= 200 && $http_code < 300) {
    echo json_encode(["status" => "success", "message" => "Sent to Discord successfully"]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Failed to send message to Discord. HTTP code: " . $http_code,
        "response" => $response
    ]);
}
?>
