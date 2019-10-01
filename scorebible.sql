/*
Navicat MySQL Data Transfer

Source Server         : Mutai
Source Server Version : 100130
Source Host           : localhost:3306
Source Database       : scorebible

Target Server Type    : MYSQL
Target Server Version : 100130
File Encoding         : 65001

Date: 2019-01-04 19:07:34
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for cards
-- ----------------------------
DROP TABLE IF EXISTS `cards`;
CREATE TABLE `cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `match_id` int(11) DEFAULT NULL,
  `time` varchar(255) DEFAULT NULL,
  `home_fault` varchar(255) DEFAULT NULL,
  `card` varchar(255) DEFAULT NULL,
  `away_fault` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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

-- ----------------------------
-- Table structure for fixtures
-- ----------------------------
DROP TABLE IF EXISTS `fixtures`;
CREATE TABLE `fixtures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `match_id` int(11) DEFAULT NULL,
  `country_id` int(11) DEFAULT NULL,
  `country_name` varchar(255) DEFAULT NULL,
  `league_id` int(11) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `match_date` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `match_status` varchar(255) DEFAULT NULL,
  `match_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `match_hometeam_name` varchar(255) DEFAULT NULL,
  `match_hometeam_score` varchar(255) DEFAULT NULL,
  `match_awayteam_name` varchar(255) DEFAULT NULL,
  `match_awayteam_score` varchar(255) DEFAULT NULL,
  `match_hometeam_halftime_score` varchar(255) DEFAULT NULL,
  `match_awayteam_halftime_score` varchar(255) DEFAULT NULL,
  `match_hometeam_extra_score` varchar(255) DEFAULT NULL,
  `match_awayteam_extra_score` varchar(255) DEFAULT NULL,
  `match_hometeam_penalty_score` varchar(255) DEFAULT NULL,
  `match_awayteam_penalty_score` varchar(255) DEFAULT NULL,
  `match_hometeam_system` varchar(255) DEFAULT NULL,
  `match_awayteam_system` varchar(255) DEFAULT NULL,
  `match_live` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for goals
-- ----------------------------
DROP TABLE IF EXISTS `goals`;
CREATE TABLE `goals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `match_id` int(11) DEFAULT NULL,
  `goalscorer` varchar(255) DEFAULT NULL,
  `time` varchar(255) DEFAULT NULL,
  `home_scorer` varchar(255) DEFAULT NULL,
  `score` varchar(255) DEFAULT NULL,
  `away_scorer` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for h2h
-- ----------------------------
DROP TABLE IF EXISTS `h2h`;
CREATE TABLE `h2h` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  `match_id` int(11) DEFAULT NULL,
  `country_id` int(11) DEFAULT NULL,
  `country_name` varchar(255) DEFAULT NULL,
  `league_id` int(11) DEFAULT NULL,
  `league_name` varchar(255) DEFAULT NULL,
  `match_date` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `match_status` varchar(255) DEFAULT NULL,
  `match_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `match_hometeam_name` varchar(255) DEFAULT NULL,
  `match_hometeam_score` varchar(255) DEFAULT NULL,
  `match_awayteam_name` varchar(255) DEFAULT NULL,
  `match_awayteam_score` varchar(255) DEFAULT NULL,
  `match_hometeam_halftime_score` varchar(255) DEFAULT NULL,
  `match_awayteam_halftime_score` varchar(255) DEFAULT NULL,
  `match_live` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for lineup
-- ----------------------------
DROP TABLE IF EXISTS `lineup`;
CREATE TABLE `lineup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `match_id` int(11) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `nature` varchar(255) DEFAULT NULL,
  `lineup_player` varchar(255) DEFAULT NULL,
  `lineup_number` int(11) DEFAULT NULL,
  `lineup_position` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for odds
-- ----------------------------
DROP TABLE IF EXISTS `odds`;
CREATE TABLE `odds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `match_id` int(11) DEFAULT NULL,
  `odd_bookmakers` varchar(255) DEFAULT NULL,
  `odd_date` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `odd_1` varchar(255) DEFAULT NULL,
  `odd_x` varchar(255) DEFAULT NULL,
  `odd_2` varchar(255) DEFAULT NULL,
  `ah-2.5_1` varchar(255) DEFAULT NULL,
  `ah-2.5_2` varchar(255) DEFAULT NULL,
  `ah-2_1` varchar(255) DEFAULT NULL,
  `ah-2_2` varchar(255) DEFAULT NULL,
  `ah-1.5_1` varchar(255) DEFAULT NULL,
  `ah-1.5_2` varchar(255) DEFAULT NULL,
  `ah-1_1` varchar(255) DEFAULT NULL,
  `ah-1_2` varchar(255) DEFAULT NULL,
  `ah0_1` varchar(255) DEFAULT NULL,
  `ah0_2` varchar(255) DEFAULT NULL,
  `o+0.5` varchar(255) DEFAULT NULL,
  `u+0.5` varchar(255) DEFAULT NULL,
  `o+1.5` varchar(255) DEFAULT NULL,
  `u+1.5` varchar(255) DEFAULT NULL,
  `o+2` varchar(255) DEFAULT NULL,
  `u+2` varchar(255) DEFAULT NULL,
  `o+2.5` varchar(255) DEFAULT NULL,
  `u+2.5` varchar(255) DEFAULT NULL,
  `o+3` varchar(255) DEFAULT NULL,
  `u+3` varchar(255) DEFAULT NULL,
  `o+3.5` varchar(255) DEFAULT NULL,
  `u+3.5` varchar(255) DEFAULT NULL,
  `o+4.5` varchar(255) DEFAULT NULL,
  `u+4.5` varchar(255) DEFAULT NULL,
  `o+5.5` varchar(255) DEFAULT NULL,
  `u+5.5` varchar(255) DEFAULT NULL,
  `bts_yes` varchar(255) DEFAULT NULL,
  `bts_no` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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

-- ----------------------------
-- Table structure for statistics
-- ----------------------------
DROP TABLE IF EXISTS `statistics`;
CREATE TABLE `statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `match_id` int(11) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `home` varchar(255) DEFAULT NULL,
  `away` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for substitutions
-- ----------------------------
DROP TABLE IF EXISTS `substitutions`;
CREATE TABLE `substitutions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lineup_player` varchar(255) DEFAULT NULL,
  `lineup_number` int(11) DEFAULT NULL,
  `lineup_position` varchar(255) DEFAULT NULL,
  `lineup_time` varchar(0) DEFAULT NULL,
  `match_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
