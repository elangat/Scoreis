/*
Navicat MySQL Data Transfer

Source Server         : Mutai
Source Server Version : 100130
Source Host           : localhost:3306
Source Database       : scorebible

Target Server Type    : MYSQL
Target Server Version : 100130
File Encoding         : 65001

Date: 2019-01-21 23:03:43
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for competitions
-- ----------------------------
DROP TABLE IF EXISTS `competitions`;
CREATE TABLE `competitions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `country_id` int(11) DEFAULT NULL,
  `country_name` varchar(255) DEFAULT NULL,
  `league_id` int(11) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
