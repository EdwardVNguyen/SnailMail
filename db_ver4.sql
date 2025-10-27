-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: postOfficeDatabase
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `street_name` varchar(255) NOT NULL,
  `city_name` varchar(255) NOT NULL,
  `state_name` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `zip_code` char(5) NOT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`address_id`),
  KEY `fk_address_created_by` (`created_by`),
  KEY `fk_address_updated_by` (`updated_by`),
  CONSTRAINT `fk_address_created_by` FOREIGN KEY (`created_by`) REFERENCES `authentication` (`auth_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_address_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `authentication` (`auth_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` VALUES (1,'Sesame Street','New York City','NY','12345',NULL,NULL,'2025-10-22 20:47:23','2025-10-22 20:47:23'),(3,'123 Main St','Houston','TX','77004',5,5,'2025-10-25 02:00:57','2025-10-25 02:00:57'),(6,'Laugh Tale','Grand Line','OP','12345',8,8,'2025-10-25 02:31:35','2025-10-25 02:31:35'),(7,'Epping Forest','Camelot','GL','93472',9,9,'2025-10-25 02:42:49','2025-10-25 02:42:49'),(8,'Shrek’s Swamp','Lordship of Duloc','FL','94375',NULL,NULL,'2025-10-25 17:52:28','2025-10-25 17:52:28'),(9,'Royal Oak','Toledo','OH','55533',NULL,NULL,'2025-10-25 19:28:07','2025-10-25 19:28:07');
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authentication`
--

DROP TABLE IF EXISTS `authentication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authentication` (
  `auth_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`auth_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authentication`
--

LOCK TABLES `authentication` WRITE;
/*!40000 ALTER TABLE `authentication` DISABLE KEYS */;
INSERT INTO `authentication` VALUES (1,'OscarTheGrouch@email.com','pass1234','2025-10-22 20:45:21','2025-10-22 20:45:21'),(5,'jane.doe@example.com','password123','2025-10-25 02:00:57','2025-10-25 02:00:57'),(8,'luffy@onepiece.com','onepieceisreal','2025-10-25 02:31:35','2025-10-25 02:31:35'),(9,'montyPython@grail.com','tisbutascratch','2025-10-25 02:42:49','2025-10-25 02:42:49'),(11,'shrek@swamp.com','password123','2025-10-25 17:48:45','2025-10-25 17:48:45'),(12,'bossbaby@pixar.com','boss','2025-10-25 19:25:54','2025-10-25 19:25:54');
/*!40000 ALTER TABLE `authentication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint`
--

DROP TABLE IF EXISTS `complaint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint` (
  `complaint_id` int NOT NULL AUTO_INCREMENT,
  `complaint_type` enum('customer','employee') NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `customer_id` int DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(63) DEFAULT NULL,
  `issue_type` enum('lost package','damaged package','delayed delivery','harassment in office','dangerous work environment') NOT NULL,
  `package_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`complaint_id`),
  KEY `customer_id` (`customer_id`),
  KEY `package_id` (`package_id`),
  KEY `fk_complaint_created_by` (`created_by`),
  KEY `fk_complaint_updated_by` (`updated_by`),
  CONSTRAINT `complaint_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaint_created_by` FOREIGN KEY (`created_by`) REFERENCES `authentication` (`auth_id`),
  CONSTRAINT `fk_complaint_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `authentication` (`auth_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint`
--

LOCK TABLES `complaint` WRITE;
/*!40000 ALTER TABLE `complaint` DISABLE KEYS */;
/*!40000 ALTER TABLE `complaint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `address_id` int NOT NULL,
  `phone_number` varchar(63) DEFAULT NULL,
  `auth_id` int NOT NULL,
  `account_type` enum('individual','business','prime') NOT NULL,
  `birth_date` date DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `auth_id` (`auth_id`),
  KEY `fk_customer_created_by` (`created_by`),
  KEY `fk_customer_updated_by` (`updated_by`),
  KEY `fk_customer_address` (`address_id`),
  CONSTRAINT `fk_customer_address` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_customer_auth` FOREIGN KEY (`auth_id`) REFERENCES `authentication` (`auth_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_customer_created_by` FOREIGN KEY (`created_by`) REFERENCES `authentication` (`auth_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_customer_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `authentication` (`auth_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Oscar',NULL,'Bruno',1,NULL,1,'individual','1969-06-01',NULL,NULL,'2025-10-22 20:50:55','2025-10-22 20:50:55'),(2,'Jane','A','Doe',3,'8325557890',5,'individual',NULL,NULL,NULL,'2025-10-25 02:00:57','2025-10-25 02:00:57'),(4,'Luffy','D','Monkey',6,NULL,8,'prime',NULL,8,8,'2025-10-25 02:31:35','2025-10-25 02:31:35'),(5,'Monty',NULL,'Python',7,'1234412341',9,'business',NULL,9,9,'2025-10-25 02:42:49','2025-10-25 02:42:49');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `account_type` enum('manager','clerk','courier') NOT NULL,
  `address_id` int NOT NULL,
  `phone_number` varchar(63) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `ethnicity` varchar(255) DEFAULT NULL,
  `employee_ssn` char(11) NOT NULL,
  `auth_id` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `employee_ssn` (`employee_ssn`),
  UNIQUE KEY `auth_id` (`auth_id`),
  KEY `address_id` (`address_id`),
  KEY `fk_employee_created_by` (`created_by`),
  KEY `fk_employee_updated_by` (`updated_by`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`),
  CONSTRAINT `fk_employee_auth` FOREIGN KEY (`auth_id`) REFERENCES `authentication` (`auth_id`),
  CONSTRAINT `fk_employee_created_by` FOREIGN KEY (`created_by`) REFERENCES `authentication` (`auth_id`),
  CONSTRAINT `fk_employee_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `authentication` (`auth_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'Shrek',NULL,'Ogre','clerk',8,'3335551234','1990-05-15',50000.00,'Ogre','123-45-6789',11,NULL,NULL,'2025-10-25 17:56:34','2025-10-25 18:47:36'),(2,'Theodore',NULL,'Templeton','manager',9,NULL,NULL,1000000.00,NULL,'134-43-3497',12,NULL,NULL,'2025-10-25 19:32:24','2025-10-25 19:32:24');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facility`
--

DROP TABLE IF EXISTS `facility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facility` (
  `facility_id` int NOT NULL AUTO_INCREMENT,
  `status` enum('active','inactive') NOT NULL,
  `facility_name` varchar(255) NOT NULL,
  `address_id` int NOT NULL,
  `facility_type` enum('warehouse','post_office') NOT NULL,
  `days_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `opening_hours` time NOT NULL,
  `closing_hours` time NOT NULL,
  `manager_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`facility_id`),
  KEY `fk_postoffice_address` (`address_id`),
  KEY `fk_manager_facility` (`manager_id`),
  KEY `fk_facility_created_by` (`created_by`),
  KEY `fk_facility_updated_by` (`updated_by`),
  CONSTRAINT `fk_facility_created_by` FOREIGN KEY (`created_by`) REFERENCES `authentication` (`auth_id`),
  CONSTRAINT `fk_facility_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `authentication` (`auth_id`),
  CONSTRAINT `fk_manager_facility` FOREIGN KEY (`manager_id`) REFERENCES `employee` (`employee_id`),
  CONSTRAINT `fk_postoffice_address` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facility`
--

LOCK TABLES `facility` WRITE;
/*!40000 ALTER TABLE `facility` DISABLE KEYS */;
/*!40000 ALTER TABLE `facility` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package`
--

DROP TABLE IF EXISTS `package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package` (
  `package_id` int NOT NULL AUTO_INCREMENT,
  `sender_customer_id` int DEFAULT NULL,
  `sender_name` varchar(255) NOT NULL,
  `sender_phone` varchar(63) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `sender_address_id` int NOT NULL,
  `recipient_customer_id` int DEFAULT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `recipient_phone` varchar(63) NOT NULL,
  `recipient_email` varchar(255) DEFAULT NULL,
  `recipient_address_id` int NOT NULL,
  `package_type` varchar(255) NOT NULL,
  `weight` decimal(10,2) NOT NULL,
  `length` decimal(10,2) NOT NULL,
  `width` decimal(10,2) NOT NULL,
  `height` decimal(10,2) NOT NULL,
  `package_status` varchar(255) NOT NULL,
  `courier_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`package_id`),
  KEY `fk_package_sender_customer` (`sender_customer_id`),
  KEY `fk_package_recipient_customer` (`recipient_customer_id`),
  KEY `fk_package_sender_address` (`sender_address_id`),
  KEY `fk_package_recipient_address` (`recipient_address_id`),
  KEY `fk_package_courier` (`courier_id`),
  KEY `fk_package_created_by` (`created_by`),
  KEY `fk_package_updated_by` (`updated_by`),
  CONSTRAINT `fk_package_courier` FOREIGN KEY (`courier_id`) REFERENCES `employee` (`employee_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_package_created_by` FOREIGN KEY (`created_by`) REFERENCES `authentication` (`auth_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_package_recipient_address` FOREIGN KEY (`recipient_address_id`) REFERENCES `address` (`address_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_package_recipient_customer` FOREIGN KEY (`recipient_customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_package_sender_address` FOREIGN KEY (`sender_address_id`) REFERENCES `address` (`address_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_package_sender_customer` FOREIGN KEY (`sender_customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_package_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `authentication` (`auth_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package`
--

LOCK TABLES `package` WRITE;
/*!40000 ALTER TABLE `package` DISABLE KEYS */;
/*!40000 ALTER TABLE `package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tracking_event`
--

DROP TABLE IF EXISTS `tracking_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tracking_event` (
  `tracking_event_id` int NOT NULL AUTO_INCREMENT,
  `package_id` int NOT NULL,
  `location_id` int DEFAULT NULL,
  `event_type` enum('pre-shipment','in transit','out for delivery','delivered') NOT NULL,
  `event_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tracking_event_id`),
  KEY `package_id` (`package_id`),
  KEY `location_id` (`location_id`),
  KEY `fk_tracking_event_created_by` (`created_by`),
  KEY `fk_tracking_event_updated_by` (`updated_by`),
  CONSTRAINT `fk_tracking_event_created_by` FOREIGN KEY (`created_by`) REFERENCES `authentication` (`auth_id`),
  CONSTRAINT `fk_tracking_event_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `authentication` (`auth_id`),
  CONSTRAINT `tracking_event_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `address` (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tracking_event`
--

LOCK TABLES `tracking_event` WRITE;
/*!40000 ALTER TABLE `tracking_event` DISABLE KEYS */;
/*!40000 ALTER TABLE `tracking_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `package_id` int NOT NULL,
  `cost_fee` decimal(10,2) NOT NULL,
  `date_time` datetime NOT NULL,
  `shipping_option` enum('individual','business','prime') NOT NULL,
  `estimated_shipping_time` varchar(255) DEFAULT NULL,
  `special_instructions` text,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `package_id` (`package_id`),
  KEY `fk_transaction_created_by` (`created_by`),
  KEY `fk_transaction_updated_by` (`updated_by`),
  CONSTRAINT `fk_transaction_created_by` FOREIGN KEY (`created_by`) REFERENCES `authentication` (`auth_id`),
  CONSTRAINT `fk_transaction_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `authentication` (`auth_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-25 19:35:18
