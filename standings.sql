/*
Navicat MySQL Data Transfer

Source Server         : Mutai
Source Server Version : 100130
Source Host           : localhost:3306
Source Database       : scorebible

Target Server Type    : MYSQL
Target Server Version : 100130
File Encoding         : 65001

Date: 2019-01-21 23:46:27
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for standings
-- ----------------------------
DROP TABLE IF EXISTS `standings`;
CREATE TABLE `standings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `country_name` varchar(255) DEFAULT NULL,
  `league_id` int(11) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `team_name` varchar(255) DEFAULT NULL,
  `overall_league_position` varchar(255) DEFAULT NULL,
  `overall_league_payed` varchar(255) DEFAULT NULL,
  `overall_league_W` varchar(255) DEFAULT NULL,
  `overall_league_D` varchar(255) DEFAULT NULL,
  `overall_league_L` varchar(255) DEFAULT NULL,
  `overall_league_GF` varchar(255) DEFAULT NULL,
  `overall_league_GA` varchar(255) DEFAULT NULL,
  `overall_league_PTS` varchar(255) DEFAULT NULL,
  `home_league_position` varchar(255) DEFAULT NULL,
  `home_league_payed` varchar(255) DEFAULT NULL,
  `home_league_W` varchar(255) DEFAULT NULL,
  `home_league_D` varchar(255) DEFAULT NULL,
  `home_league_L` varchar(255) DEFAULT NULL,
  `home_league_GF` varchar(255) DEFAULT NULL,
  `home_league_GA` varchar(255) DEFAULT NULL,
  `home_league_PTS` varchar(255) DEFAULT NULL,
  `away_league_position` varchar(255) DEFAULT NULL,
  `away_league_payed` varchar(255) DEFAULT NULL,
  `away_league_W` varchar(255) DEFAULT NULL,
  `away_league_D` varchar(255) DEFAULT NULL,
  `away_league_L` varchar(255) DEFAULT NULL,
  `away_league_GF` varchar(255) DEFAULT NULL,
  `away_league_GA` varchar(255) DEFAULT NULL,
  `away_league_PTS` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
