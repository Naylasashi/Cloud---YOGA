
<?php
$host = '127.0.0.1';
$port = '3306';
$db   = 'sukma_yoga';
$user = 'root';
$pass = ''; // Sesuaikan jika MySQL lu pakai password

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    echo "Koneksi database berhasil!";
} catch (PDOException $e) {
    http_response_code(500);
    echo "Koneksi gagal: " . $e->getMessage();
}
