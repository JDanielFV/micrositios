import Link from 'next/link';
import styles from './Header.module.css';

interface HeaderProps {
  links: Array<{ text: string; link: string; }>;
}

const Header: React.FC<HeaderProps> = ({ links }) => {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {links.map((item, index) => (
          <Link key={index} href={item.link} className={styles.link}>
            {item.text}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
