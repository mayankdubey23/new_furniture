import React from 'react';
import { motion } from 'framer-motion';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <motion.footer
      className={styles.footerWrapper}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <motion.div className={styles.container} whileHover={{ y: -6 }} transition={{ duration: 0.35 }}>
        <div className={styles.sofa}>
          <div className={styles.sofaBottomPart}></div>
          <div className={styles.sofaArmrest}></div>
          <div className={styles.sofaArmrest}></div>
          <div className={styles.sofaLeg}></div>
          <div className={`${styles.sofaLeg} ${styles.sofaRightLeg}`}></div>
          <div className={styles.sofaGlare}></div>
        </div>
        <div className={styles.picture}></div>
        <div className={styles.lamp}></div>
        <div className={styles.lampLeg}></div>
        <div className={styles.pot}></div>
        <div className={styles.cactus}></div>
        <div className={styles.bricks1}></div>
        <div className={styles.bricks2}></div>
      </motion.div>

      <motion.div
        className={styles.footerContent}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <p>© {new Date().getFullYear()} Luxe Decor. All rights reserved.</p>
      </motion.div>
    </motion.footer>
  );
}

