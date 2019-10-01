/*
Navicat MySQL Data Transfer

Source Server         : Mutai
Source Server Version : 100130
Source Host           : localhost:3306
Source Database       : scorebible

Target Server Type    : MYSQL
Target Server Version : 100130
File Encoding         : 65001

Date: 2019-01-04 13:45:42
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for countries
-- ----------------------------
DROP TABLE IF EXISTS `countries`;
CREATE TABLE `countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `country_id` int(11) DEFAULT NULL,
  `country_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
