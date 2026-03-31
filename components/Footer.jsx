import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.container}>
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
      </div>
      
      {/* Actual footer text added below the art */}
      <div className={styles.footerContent}>
        <p>© {new Date().getFullYear()} Your Website. All rights reserved.</p>
      </div>
    </footer>
  );
}