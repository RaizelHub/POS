import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./css/HomePage.module.css";
import logo1 from "../images/BSU LOGO.png";
import logo2 from "../images/COT.png";

const HomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className={styles.homepageContainer}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.header
        className={styles.header}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className={styles.adminIcon}
          whileHover={{ scale: 1.2, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          title="Admin Login"
        >
          <Link to="/admin-login">
            <i className="fas fa-user-shield"></i>
          </Link>
        </motion.div>

        <div className={styles.navButtons}>
          <Link to="/login-selection">
            <motion.button
              className={styles.customButton}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              variants={itemVariants}
            >
              Login
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              className={styles.customButton}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              variants={itemVariants}
            >
              Register
            </motion.button>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        className={styles.mainContent}
        variants={containerVariants}
      >
        <motion.div
          className={styles.logos}
          variants={itemVariants}
        >
          <motion.img
            src={logo1}
            alt="University Logo"
            className={styles.logoImg}
            whileHover={{ scale: 1.1, rotateY: 10 }}
            transition={{ duration: 0.3 }}
          />
          <motion.img
            src={logo2}
            alt="College Logo"
            className={styles.logoImg}
            whileHover={{ scale: 1.1, rotateY: -10 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <motion.h1
          className={styles.title}
          variants={itemVariants}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Welcome to Markiee Store
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          variants={itemVariants}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          College Of Technologies
        </motion.p>
      </motion.div>

      {/* Footer Section */}
      <motion.footer
        className={styles.footer}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <motion.p
          className={styles.footerText}
          variants={itemVariants}
        >
          BUKIDNON STATE UNIVERSITY | College of Technologies
        </motion.p>
      </motion.footer>
    </motion.div>
  );
};

export default HomePage;
