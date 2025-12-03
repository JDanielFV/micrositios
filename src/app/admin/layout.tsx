import { Metadata } from 'next';
import styles from './Admin.module.css';

export const metadata: Metadata = {
    title: "Edición y creación",
    description: "Panel de administración de micrositios",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.adminWrapper}>
            {children}
        </div>
    );
}
