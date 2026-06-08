'use client';

import { useState, useMemo } from 'react';
import styles from './SiteSearch.module.css';

interface Site {
  id: string;
  slug: string;
  data: {
    metadata: {
      title: string;
      description: string;
    };
    lastModification?: {
      timestamp: string;
    };
  };
}

interface SiteSearchProps {
  sites: Site[];
  onEdit: (slug: string) => void;
  onDelete: (slug: string) => void;
}

export default function SiteSearch({ sites, onEdit, onDelete }: SiteSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'name' | 'date'>('name');

  const filteredAndSortedSites = useMemo(() => {
    let result = sites.filter(site => 
      site.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.data.metadata.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOrder === 'name') {
      result.sort((a, b) => a.data.metadata.title.localeCompare(b.data.metadata.title));
    } else {
      result.sort((a, b) => {
        const dateA = a.data.lastModification?.timestamp ? new Date(a.data.lastModification.timestamp).getTime() : 0;
        const dateB = b.data.lastModification?.timestamp ? new Date(b.data.lastModification.timestamp).getTime() : 0;
        return dateB - dateA; // Newest first
      });
    }

    return result;
  }, [sites, searchTerm, sortOrder]);

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Buscar sitios por nombre o slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className={styles.clearButton}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.sortControls}>
        <span className={styles.sortLabel}>Ordenar por:</span>
        <button
          className={`${styles.sortButton} ${sortOrder === 'name' ? styles.active : ''}`}
          onClick={() => setSortOrder('name')}
        >
          Nombre
        </button>
        <button
          className={`${styles.sortButton} ${sortOrder === 'date' ? styles.active : ''}`}
          onClick={() => setSortOrder('date')}
        >
          Fecha
        </button>
      </div>

      <div className={styles.results}>
        <span className={styles.resultsCount}>
          {filteredAndSortedSites.length} {filteredAndSortedSites.length === 1 ? 'sitio' : 'sitios'}
          {searchTerm && ` para "${searchTerm}"`}
        </span>
      </div>

      <ul className={styles.siteList}>
        {filteredAndSortedSites.map(site => (
          <li key={site.id} className={styles.siteItem}>
            <div className={styles.siteInfo}>
              <h3 className={styles.siteTitle}>{site.data.metadata.title}</h3>
              <p className={styles.siteSlug}>https://www.tuqr.com.mx/qrs/{site.slug}</p>
              {site.data.lastModification && (
                <span className={styles.siteDate}>
                  Modificado: {new Date(site.data.lastModification.timestamp).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
            <div className={styles.siteActions}>
              <a 
                href={`/qrs/${site.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewButton}
                title="Ver sitio en vivo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Ver
              </a>
              <button 
                onClick={() => onEdit(site.slug)}
                className={styles.editButton}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar
              </button>
              <button 
                onClick={() => onDelete(site.slug)}
                className={styles.deleteButton}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {filteredAndSortedSites.length === 0 && (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <p>No se encontraron sitios</p>
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className={styles.clearSearchButton}>
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  );
}
