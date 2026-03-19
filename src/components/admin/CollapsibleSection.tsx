'use client';

import { useState, ReactNode } from 'react';
import styles from './CollapsibleSection.module.css';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}

export default function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true,
  icon 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.section}>
      <button 
        type="button"
        className={styles.header}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.headerContent}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <h2 className={styles.title}>{title}</h2>
        </div>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
}
