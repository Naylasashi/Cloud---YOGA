-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 16, 2026 at 04:19 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sukma_yoga`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `kode_booking` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `credit_kode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `kelas_id` int NOT NULL,
  `tanggal` date NOT NULL,
  `status` enum('aktif','dijadwalkan ulang','dibatalkan') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif',
  `credit_dikembalikan` tinyint(1) NOT NULL DEFAULT '0',
  `dibuat_pada` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dibatalkan_pada` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`kode_booking`, `credit_kode`, `kelas_id`, `tanggal`, `status`, `credit_dikembalikan`, `dibuat_pada`, `dibatalkan_pada`) VALUES
('BK-A23D18', 'MBR-817606', 6, '2026-10-23', 'aktif', 0, '2026-10-16 23:04:43', NULL),
('BK-A8B025', 'MBR-754024', 5, '2026-10-22', 'aktif', 0, '2026-10-16 23:06:38', NULL),
('BK-F8480D', 'MBR-928896', 8, '2026-10-25', 'aktif', 0, '2026-10-16 22:18:21', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `credit`
--

CREATE TABLE `credit` (
  `kode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pembelian_id` int NOT NULL,
  `pelanggan_id` int NOT NULL,
  `tipe` enum('member','dropin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_credit` int NOT NULL,
  `berlaku_sampai` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `credit`
--

INSERT INTO `credit` (`kode`, `pembelian_id`, `pelanggan_id`, `tipe`, `total_credit`, `berlaku_sampai`) VALUES
('DI-313247', 5, 4, 'dropin', 1, '2026-11-16'),
('DI-684587', 3, 3, 'dropin', 1, '2026-11-16'),
('MBR-180463', 8, 8, 'member', 4, '2026-11-16'),
('MBR-212698', 7, 7, 'member', 10, '2027-01-16'),
('MBR-754024', 10, 10, 'member', 60, '2027-10-16'),
('MBR-817606', 6, 4, 'member', 4, '2026-11-16'),
('MBR-850125', 9, 9, 'member', 10, '2027-01-16'),
('MBR-928896', 4, 4, 'member', 12, '2026-12-16');

-- --------------------------------------------------------

--
-- Table structure for table `instruktur`
--

CREATE TABLE `instruktur` (
  `id` int NOT NULL,
  `nama` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `instruktur`
--

INSERT INTO `instruktur` (`id`, `nama`) VALUES
(1, 'Ayu'),
(3, 'Dewi'),
(2, 'Raka');

-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

CREATE TABLE `kelas` (
  `id` int NOT NULL,
  `nama` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hari` enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu') COLLATE utf8mb4_unicode_ci NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `instruktur_id` int NOT NULL,
  `kapasitas` int NOT NULL DEFAULT '15'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kelas`
--

INSERT INTO `kelas` (`id`, `nama`, `hari`, `jam_mulai`, `jam_selesai`, `instruktur_id`, `kapasitas`) VALUES
(1, 'Hatha Yoga (Pemula)', 'Senin', '07:00:00', '08:00:00', 1, 15),
(2, 'Vinyasa Flow', 'Selasa', '18:30:00', '19:30:00', 2, 15),
(3, 'Meditasi dan Pernapasan', 'Rabu', '07:00:00', '08:00:00', 1, 15),
(4, 'Hatha Yoga (Pemula)', 'Rabu', '18:30:00', '19:30:00', 3, 15),
(5, 'Yin Yoga', 'Kamis', '18:30:00', '19:30:00', 3, 15),
(6, 'Vinyasa Flow', 'Jumat', '07:00:00', '08:00:00', 2, 15),
(7, 'Vinyasa Flow', 'Sabtu', '08:00:00', '09:30:00', 2, 15),
(8, 'Hatha Yoga (Pemula)', 'Minggu', '08:00:00', '09:00:00', 3, 15);

-- --------------------------------------------------------

--
-- Table structure for table `paket`
--

CREATE TABLE `paket` (
  `id` int NOT NULL,
  `kode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe` enum('member','dropin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `harga` int NOT NULL,
  `jumlah_credit` int NOT NULL,
  `masa_berlaku_bulan` int NOT NULL
) ;

--
-- Dumping data for table `paket`
--

INSERT INTO `paket` (`id`, `kode`, `nama`, `tipe`, `harga`, `jumlah_credit`, `masa_berlaku_bulan`) VALUES
(1, 'MBR-4', 'Member 4 Kelas', 'member', 100000, 4, 1),
(2, 'PLS-20', 'Plus', 'member', 1600000, 20, 6),
(3, 'REG-10', 'Regular', 'member', 850000, 10, 3),
(4, 'DROP-1', 'Drop-in', 'dropin', 100000, 1, 1),
(5, 'THN-60', 'Tahunan', 'member', 4200000, 60, 12);

-- --------------------------------------------------------

--
-- Table structure for table `pelanggan`
--

CREATE TABLE `pelanggan` (
  `id` int NOT NULL,
  `nama` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dibuat_pada` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pelanggan`
--

INSERT INTO `pelanggan` (`id`, `nama`, `email`, `hp`, `dibuat_pada`) VALUES
(1, 'Via', 'contoh@gmail.com', '082112345678', '2026-10-15 08:24:22'),
(2, 'pio', 'email@gmail.com', '082112345678', '2026-10-15 08:40:16'),
(3, 'silvia', 'sss@gnail.com', '0984629372', '2026-10-16 21:36:35'),
(4, 'Naylasashi R. Putri', 'naylasashirputri@gmail.com', '02834912', '2026-10-16 21:50:32'),
(7, 'Putri', 'nayla@gmail.com', '0921039216', '2026-10-16 22:32:56'),
(8, 'RRRR', 'naylasautri@gmail.com', '1094017', '2026-10-16 22:40:20'),
(9, 'Naylasashi R.', 'putri@gmail.com', '912741261', '2026-10-16 22:51:48'),
(10, 'anuan', 'ann@jaty.com', '0995739', '2026-10-16 23:06:20');

-- --------------------------------------------------------

--
-- Table structure for table `pembelian`
--

CREATE TABLE `pembelian` (
  `id` int NOT NULL,
  `pelanggan_id` int NOT NULL,
  `paket_id` int NOT NULL,
  `harga` int NOT NULL,
  `metode` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('menunggu','lunas','gagal','kedaluwarsa') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'menunggu',
  `referensi_gateway` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dibuat_pada` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dibayar_pada` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pembelian`
--

INSERT INTO `pembelian` (`id`, `pelanggan_id`, `paket_id`, `harga`, `metode`, `status`, `referensi_gateway`, `dibuat_pada`, `dibayar_pada`) VALUES
(1, 1, 1, 100000, 'QRIS', 'lunas', NULL, '2026-10-15 08:24:22', '2026-10-15 08:24:22'),
(2, 2, 1, 100000, 'Transfer bank', 'lunas', NULL, '2026-10-15 08:40:16', '2026-10-15 08:40:16'),
(3, 3, 4, 50000, 'Transfer bank', 'lunas', NULL, '2026-10-16 21:36:35', '2026-10-16 21:36:35'),
(4, 4, 3, 250000, 'Transfer bank', 'lunas', NULL, '2026-10-16 21:50:32', '2026-10-16 21:50:32'),
(5, 4, 4, 100000, 'QRIS', 'lunas', NULL, '2026-10-16 22:09:45', '2026-10-16 22:09:45'),
(6, 4, 1, 100000, 'Transfer bank', 'lunas', NULL, '2026-10-16 22:28:56', '2026-10-16 22:28:56'),
(7, 7, 3, 850000, 'Transfer bank', 'lunas', NULL, '2026-10-16 22:32:56', '2026-10-16 22:32:56'),
(8, 8, 1, 100000, 'Transfer bank', 'lunas', NULL, '2026-10-16 22:40:20', '2026-10-16 22:40:20'),
(9, 9, 3, 850000, 'Transfer bank', 'lunas', NULL, '2026-10-16 22:51:48', '2026-10-16 22:51:48'),
(10, 10, 5, 4200000, 'QRIS', 'lunas', NULL, '2026-10-16 23:06:20', '2026-10-16 23:06:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`kode_booking`),
  ADD KEY `idx_booking_kelas_tanggal` (`kelas_id`,`tanggal`),
  ADD KEY `idx_booking_credit` (`credit_kode`);

--
-- Indexes for table `credit`
--
ALTER TABLE `credit`
  ADD PRIMARY KEY (`kode`),
  ADD UNIQUE KEY `pembelian_id` (`pembelian_id`),
  ADD KEY `pelanggan_id` (`pelanggan_id`);

--
-- Indexes for table `instruktur`
--
ALTER TABLE `instruktur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`);

--
-- Indexes for table `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `instruktur_id` (`instruktur_id`);

--
-- Indexes for table `paket`
--
ALTER TABLE `paket`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`);

--
-- Indexes for table `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `pembelian`
--
ALTER TABLE `pembelian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pelanggan_id` (`pelanggan_id`),
  ADD KEY `paket_id` (`paket_id`),
  ADD KEY `idx_pembelian_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `instruktur`
--
ALTER TABLE `instruktur`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `kelas`
--
ALTER TABLE `kelas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `paket`
--
ALTER TABLE `paket`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pelanggan`
--
ALTER TABLE `pelanggan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pembelian`
--
ALTER TABLE `pembelian`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`credit_kode`) REFERENCES `credit` (`kode`),
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`);

--
-- Constraints for table `credit`
--
ALTER TABLE `credit`
  ADD CONSTRAINT `credit_ibfk_1` FOREIGN KEY (`pembelian_id`) REFERENCES `pembelian` (`id`),
  ADD CONSTRAINT `credit_ibfk_2` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`);

--
-- Constraints for table `kelas`
--
ALTER TABLE `kelas`
  ADD CONSTRAINT `kelas_ibfk_1` FOREIGN KEY (`instruktur_id`) REFERENCES `instruktur` (`id`);

--
-- Constraints for table `pembelian`
--
ALTER TABLE `pembelian`
  ADD CONSTRAINT `pembelian_ibfk_1` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`id`),
  ADD CONSTRAINT `pembelian_ibfk_2` FOREIGN KEY (`paket_id`) REFERENCES `paket` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
