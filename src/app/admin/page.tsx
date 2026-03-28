'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HexColorPicker } from 'react-colorful';
import styles from './Admin.module.css';
import Link from 'next/link';

// New components
import SiteSearch from '@/components/admin/SiteSearch';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import CollapsibleSection from '@/components/admin/CollapsibleSection';
import StatusBar from '@/components/admin/StatusBar';

// Tauri utilities
import { isTauri, tauriInvoke } from '@/utils/tauri';

interface Service {
  title: string;
  description: string;
}

interface ContactAction {
  iconUrl: string;
  text: string;
  link: string;
}

const defaultSiteData = {
  theme: {
    color1: "#ffffff",
    color2: "#f0f0f0",
    angle: 90,
    fontImportUrl: "",
    fontFamily: ""
  },
  metadata: {
    title: "",
    description: ""
  },
  navigation: [
    { text: "Inicio", link: "/" },
    { text: "Ubicación", link: "/ubicacion" },
    { text: "Contacto", link: "/contacto" }
  ] as { text: string, link: string }[],
  hero: {
    title: "",
    subtitle: "",
    videoUrl: "",
    logoUrl: "",
    button: {
      text: "",
      link: "/servicios"
    },
    backgroundImageUrl: ""
  },
  about: {
    title: "",
    text: "",
    imageUrl: ""
  },
  mainContact: {
    title: "",
    text: "",
    button: {
      text: "",
      link: "/contacto"
    }
  },
  locationPage: {
    address: "",
    mapIframeUrl: ""
  },
  contactPage: {
    title: "Centro de Contacto",
    vCardUrl: "",
    actions: [
      { iconUrl: "/card.png", text: "Guardar contacto", link: "" },
      { iconUrl: "/wh.svg", text: "WhatsApp", link: "" },
      { iconUrl: "/sm.webp", text: "Llamar Ahora", link: "" },
      { iconUrl: "/ml.webp", text: "Enviar Email", link: "" }
    ]
  },
  servicesPage: {
    title: "",
    services: [] as Service[]
  },
  splashScreen: {
    enabled: false,
    videoUrl: ""
  }
};

export default function AdminPage() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [slug, setSlug] = useState('');
  const [siteData, setSiteData] = useState(defaultSiteData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
  const [heroAudioFile, setHeroAudioFile] = useState<File | null>(null);
  const [heroLogoFile, setHeroLogoFile] = useState<File | null>(null);
  const [heroBackgroundImageFile, setHeroBackgroundImageFile] = useState<File | null>(null);
  const [vCardFile, setVCardFile] = useState<File | null>(null);
  const [splashVideoFile, setSplashVideoFile] = useState<File | null>(null);
  const [iconFiles, setIconFiles] = useState<File[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [isExistingSitesOpen, setIsExistingSitesOpen] = useState(true);
  const [isNewSiteOpen, setIsNewSiteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // AI Generation State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiUrl, setAiUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Analytics State
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);

  // Delete confirmation
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/qrs/api/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, url: aiUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        setSiteData(prev => ({
          ...prev,
          ...result.data,
        }));
        setMessage('¡Sitio generado con IA exitosamente! Revisa los campos.');
        setIsAiOpen(false);
      } else {
        setError(result.message || 'Error al generar con IA');
      }
    } catch (err) {
      setError('Error de conexión con el servicio de IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchSites = async () => {
    try {
      console.log('Fetching sites...');
      
      // If in Tauri, use native Rust command
      if (isTauri()) {
        const nativeSites = await tauriInvoke<any[]>('get_sites');
        if (nativeSites) {
          // Parse data string from SQLite to object
          const parsedSites = nativeSites.map(s => ({
            ...s,
            data: typeof s.data === 'string' ? JSON.parse(s.data) : s.data
          }));
          setSites(parsedSites);
          return;
        }
      }

      // Fallback to standard web API
      const response = await fetch('/qrs/api/sites');
      if (response.ok) {
        const data = await response.json();
        setSites(data);
      }
    } catch (err) {
      console.error("Error fetching sites:", err);
    }
  };

  const fetchVisits = async () => {
    try {
      const response = await fetch('https://tuqr.com.mx/qrs/tracker.php');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setVisits(data.reverse());
        }
      }
    } catch (err) {
      console.error("Error fetching visits:", err);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchVisits();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSiteData(prevData => {
      const keys = name.split('.');
      const newData = { ...prevData };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleColorChange = (colorName: string, colorValue: string) => {
    setSiteData(prevData => ({
      ...prevData,
      theme: {
        ...prevData.theme,
        [colorName]: colorValue
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      if (name === 'imageFile') {
        setImageFile(file);
      } else if (name === 'heroVideoFile') {
        setHeroVideoFile(file);
      } else if (name === 'heroAudioFile') {
        setHeroAudioFile(file);
      } else if (name === 'heroLogoFile') {
        setHeroLogoFile(file);
      } else if (name === 'vCardFile') {
        setVCardFile(file);
      } else if (name === 'splashVideoFile') {
        setSplashVideoFile(file);
      } else if (name === 'heroBackgroundImageFile') {
        setHeroBackgroundImageFile(file);
      }
    }
  };

  const handleIconFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newIconFiles = [...iconFiles];
      newIconFiles[index] = e.target.files[0];
      setIconFiles(newIconFiles);
    }
  };

  const handleServiceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSiteData(prevData => {
      const newServices = [...prevData.servicesPage.services];
      const updatedService: Service = {
        ...newServices[index],
        [name]: value
      };
      newServices[index] = updatedService;
      return { ...prevData, servicesPage: { ...prevData.servicesPage, services: newServices } };
    });
  };

  const addService = () => {
    setSiteData(prevData => ({
      ...prevData,
      servicesPage: {
        ...prevData.servicesPage,
        services: [...prevData.servicesPage.services, { title: '', description: '' } as Service]
      }
    }));
  };

  const removeService = (index: number) => {
    setSiteData(prevData => ({
      ...prevData,
      servicesPage: {
        ...prevData.servicesPage,
        services: prevData.servicesPage.services.filter((_, i) => i !== index)
      }
    }));
  };

  const handleContactActionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSiteData(prevData => {
      const newActions = [...prevData.contactPage.actions];
      const updatedAction: ContactAction = {
        ...newActions[index],
        [name]: value
      };
      newActions[index] = updatedAction;
      return { ...prevData, contactPage: { ...prevData.contactPage, actions: newActions } };
    });
  };

  const addContactAction = () => {
    setSiteData(prevData => ({
      ...prevData,
      contactPage: {
        ...prevData.contactPage,
        actions: [...prevData.contactPage.actions, { iconUrl: '', text: '', link: '' } as ContactAction]
      }
    }));
  };

  const removeContactAction = (index: number) => {
    setSiteData(prevData => ({
      ...prevData,
      contactPage: {
        ...prevData.contactPage,
        actions: prevData.contactPage.actions.filter((_, i) => i !== index)
      }
    }));
  };

  const confirmDelete = (slug: string) => {
    setSiteToDelete(slug);
  };

  const handleDelete = async () => {
    if (!siteToDelete) return;

    try {
      const response = await fetch(`/qrs/api/sites/${siteToDelete}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        fetchSites();
        setSiteToDelete(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Ocurrió un error al eliminar el sitio.');
    }
  };

  const handleEdit = (slug: string) => {
    router.push(`/admin/edit/${slug}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('id', id);
    formData.append('slug', slug);

    const updatedSiteData = JSON.parse(JSON.stringify(siteData));
    if (vCardFile) {
      updatedSiteData.contactPage.vCardUrl = `/uploads/${slug}/${vCardFile.name}`;
    }

    formData.append('siteData', JSON.stringify(updatedSiteData));

    if (imageFile) formData.append('imageFile', imageFile);
    if (heroVideoFile) formData.append('heroVideoFile', heroVideoFile);
    if (heroAudioFile) formData.append('heroAudioFile', heroAudioFile);
    if (heroLogoFile) formData.append('heroLogoFile', heroLogoFile);
    if (vCardFile) formData.append('vCardFile', vCardFile);
    if (splashVideoFile) formData.append('splashVideoFile', splashVideoFile);
    if (heroBackgroundImageFile) formData.append('heroBackgroundImageFile', heroBackgroundImageFile);
    iconFiles.forEach((file, index) => {
      if (file) formData.append(`iconFile-${index}`, file);
    });

    try {
      const response = await fetch('/qrs/api/sites', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        setId('');
        setSlug('');
        setSiteData(defaultSiteData);
        setImageFile(null);
        setHeroVideoFile(null);
        setHeroBackgroundImageFile(null);
        setHeroLogoFile(null);
        setVCardFile(null);
        setSplashVideoFile(null);
        fetchSites();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Ocurrió un error al enviar el formulario.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Constructor de micrositios</h1>
      
      {!mounted ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p>Cargando panel...</p>
        </div>
      ) : (
        <>
          {/* Analytics Section */}
      <CollapsibleSection 
        title={`Estadísticas de Visitas (${visits.length} visitas)`}
        defaultOpen={false}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        }
      >
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{visits.length}</div>
            <div className={styles.statLabel}>Visitas Totales</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {new Set(visits.map(v => v.ip)).size}
            </div>
            <div className={styles.statLabel}>Usuarios Únicos</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {visits.filter(v => {
                const date = new Date(v.timestamp);
                const now = new Date();
                return date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div className={styles.statLabel}>Visitas Hoy</div>
          </div>
        </div>

        <h3 className={styles.subSectionTitle}>Páginas Más Visitadas</h3>
        <div className={styles.tableContainer}>
          <table className={styles.analyticsTable}>
            <thead>
              <tr>
                <th>Página</th>
                <th>Visitas</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(visits.reduce((acc, curr) => {
                acc[curr.page] = (acc[curr.page] || 0) + 1;
                return acc;
              }, {} as Record<string, number>))
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([page, count]) => (
                  <tr key={page}>
                    <td>{page}</td>
                    <td>{count as number}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <h3 className={styles.subSectionTitle}>Registro Reciente</h3>
        <div className={styles.tableContainer}>
          <table className={styles.analyticsTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Página</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {visits.slice(0, 10).map((visit, index) => (
                <tr key={index}>
                  <td>{visit.timestamp}</td>
                  <td>{visit.page}</td>
                  <td>{visit.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* Existing Sites with Search */}
      <div className={styles.section}>
        <div 
          className={styles.sectionHeader}
          onClick={() => setIsExistingSitesOpen(!isExistingSitesOpen)}
        >
          <h2 className={styles.sectionTitle}>
            <span style={{ marginRight: '0.5rem' }}>📁</span>
            Sitios Existentes
          </h2>
          <span className={styles.chevron}>{mounted ? (isExistingSitesOpen ? '▼' : '▶') : '▼'}</span>
        </div>
        
        {mounted && isExistingSitesOpen && (
          <SiteSearch 
            sites={sites}
            onEdit={handleEdit}
            onDelete={confirmDelete}
          />
        )}
      </div>

      {/* New Site Form */}
      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2
            className={styles.sectionTitle}
            onClick={() => setIsNewSiteOpen(!isNewSiteOpen)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', margin: 0, flex: 1 }}
          >
            <span style={{ marginRight: '0.5rem' }}>➕</span>
            Añadir Nuevo Sitio
            <span style={{ marginLeft: '10px' }}>{isNewSiteOpen ? '▼' : '▶'}</span>
          </h2>

          <button
            type="button"
            className={styles.aiButton}
            onClick={(e) => {
              e.stopPropagation();
              setIsNewSiteOpen(true);
              setIsAiOpen(!isAiOpen);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10A10 10 0 0 1 2 12 10 10 0 0 1 12 2z" />
              <path d="M12 8v4l3 3" />
            </svg>
            Gemini AI
          </button>
        </div>

        {isAiOpen && (
          <div className={styles.aiContainer}>
            <p style={{ color: 'white', marginBottom: '0.5rem' }}>Describe tu negocio y la IA buscará información real y creará el sitio:</p>
            <div className={styles.aiInputGroup}>
              <input
                type="text"
                className={styles.aiInput}
                placeholder="Ej: Notaría 178 en Cancún, Lic. Gustavo Rivero..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <input
                type="text"
                className={styles.aiInput}
                placeholder="URL del sitio web existente (opcional, para extraer datos)"
                value={aiUrl}
                onChange={(e) => setAiUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                type="button"
                className={styles.aiButton}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generando...' : 'Generar Sitio'}
              </button>
            </div>
          </div>
        )}

        {isNewSiteOpen && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <CollapsibleSection title="Datos Generales" defaultOpen={true}>
              <div className={styles.formGroup}>
                <label htmlFor="id">ID</label>
                <input
                  type="text"
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="slug">Slug (URL)</label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Tema y Estilo" defaultOpen={false}>
              <div className={styles.formGroup}>
                <label htmlFor="theme.color1">Color 1</label>
                <HexColorPicker color={siteData.theme.color1} onChange={(color) => handleColorChange('color1', color)} />
                <input
                  type="text"
                  value={siteData.theme.color1}
                  onChange={(e) => handleColorChange('color1', e.target.value)}
                  className={styles.colorInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="theme.color2">Color 2</label>
                <HexColorPicker color={siteData.theme.color2} onChange={(color) => handleColorChange('color2', color)} />
                <input
                  type="text"
                  value={siteData.theme.color2}
                  onChange={(e) => handleColorChange('color2', e.target.value)}
                  className={styles.colorInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="theme.angle">Ángulo del Degradado</label>
                <input
                  type="number"
                  id="theme.angle"
                  name="theme.angle"
                  value={siteData.theme.angle}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="theme.fontImportUrl">URL de Import de Fuente (Google Fonts)</label>
                <input
                  type="text"
                  id="theme.fontImportUrl"
                  name="theme.fontImportUrl"
                  value={siteData.theme.fontImportUrl}
                  onChange={handleInputChange}
                  placeholder="https://fonts.googleapis.com/css2?family=Roboto..."
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="theme.fontFamily">Familia de Fuente (CSS)</label>
                <input
                  type="text"
                  id="theme.fontFamily"
                  name="theme.fontFamily"
                  value={siteData.theme.fontFamily}
                  onChange={handleInputChange}
                  placeholder="'Roboto', sans-serif"
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Metadatos (SEO)" defaultOpen={false}>
              <div className={styles.formGroup}>
                <label htmlFor="metadata.title">Título del Sitio</label>
                <input
                  type="text"
                  id="metadata.title"
                  name="metadata.title"
                  value={siteData.metadata.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="metadata.description">Descripción del Sitio</label>
                <input
                  type="text"
                  id="metadata.description"
                  name="metadata.description"
                  value={siteData.metadata.description}
                  onChange={handleInputChange}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Sección Principal (Hero)" defaultOpen={false}>
              <div className={styles.formGroup}>
                <label htmlFor="heroLogoFile">Logo (opcional)</label>
                <input
                  type="file"
                  id="heroLogoFile"
                  name="heroLogoFile"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Video de fondo (opcional)</label>
                <input
                  type="file"
                  name="heroVideoFile"
                  onChange={handleFileChange}
                  accept="video/*"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Imagen de fondo (opcional - si no hay video)</label>
                <input
                  type="file"
                  name="heroBackgroundImageFile"
                  onChange={handleFileChange}
                  accept="image/*"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Audio de interacción (opcional - mp3)</label>
                <input
                  type="file"
                  name="heroAudioFile"
                  onChange={handleFileChange}
                  accept="audio/*"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="hero.title">Título Principal</label>
                <input
                  type="text"
                  id="hero.title"
                  name="hero.title"
                  value={siteData.hero.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="hero.subtitle">Subtítulo</label>
                <input
                  type="text"
                  id="hero.subtitle"
                  name="hero.subtitle"
                  value={siteData.hero.subtitle}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="hero.button.text">Texto del Botón</label>
                <input
                  type="text"
                  id="hero.button.text"
                  name="hero.button.text"
                  value={siteData.hero.button.text}
                  onChange={handleInputChange}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Sección &quot;Acerca de&quot;" defaultOpen={false}>
              <div className={styles.formGroup}>
                <label htmlFor="about.title">Título</label>
                <input
                  type="text"
                  id="about.title"
                  name="about.title"
                  value={siteData.about.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="about.text">Texto</label>
                <textarea
                  id="about.text"
                  name="about.text"
                  value={siteData.about.text}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="imageFile">Imagen de Fondo (opcional)</label>
                <input
                  type="file"
                  id="imageFile"
                  name="imageFile"
                  onChange={handleFileChange}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Contacto Principal" defaultOpen={false}>
              <div className={styles.formGroup}>
                <label htmlFor="mainContact.title">Título</label>
                <input
                  type="text"
                  id="mainContact.title"
                  name="mainContact.title"
                  value={siteData.mainContact.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="mainContact.text">Texto</label>
                <textarea
                  id="mainContact.text"
                  name="mainContact.text"
                  value={siteData.mainContact.text}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="mainContact.button.text">Texto del Botón</label>
                <input
                  type="text"
                  id="mainContact.button.text"
                  name="mainContact.button.text"
                  value={siteData.mainContact.button.text}
                  onChange={handleInputChange}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Ubicación" defaultOpen={false}>
              <div className={styles.formGroup}>
                <label htmlFor="locationPage.address">Dirección</label>
                <input
                  type="text"
                  id="locationPage.address"
                  name="locationPage.address"
                  value={siteData.locationPage.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="locationPage.mapIframeUrl">URL del Iframe de Google Maps</label>
                <input
                  type="text"
                  id="locationPage.mapIframeUrl"
                  name="locationPage.mapIframeUrl"
                  value={siteData.locationPage.mapIframeUrl}
                  onChange={handleInputChange}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Servicios" defaultOpen={false}>
              <div className={styles.formGroup}>
                <label htmlFor="servicesPage.title">Título de la Página</label>
                <input
                  type="text"
                  id="servicesPage.title"
                  name="servicesPage.title"
                  value={siteData.servicesPage.title}
                  onChange={handleInputChange}
                />
              </div>
              {siteData.servicesPage.services.map((service, index) => (
                <div key={index} className={styles.dynamicItem}>
                  <div className={styles.formGroup}>
                    <label>Título del Servicio</label>
                    <input
                      type="text"
                      name="title"
                      value={service.title}
                      onChange={(e) => handleServiceChange(index, e)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Descripción del Servicio</label>
                    <textarea
                      name="description"
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, e)}
                      rows={3}
                    />
                  </div>
                  <button type="button" onClick={() => removeService(index)} className={styles.removeButton}>
                    Eliminar Servicio
                  </button>
                </div>
              ))}
              <button type="button" onClick={addService} className={styles.addButton}>
                Añadir Servicio
              </button>
            </CollapsibleSection>

            <CollapsibleSection title="Página de Contacto" defaultOpen={false}>
              <div className={styles.formGroup}>
                <label htmlFor="contactPage.title">Título de la Página</label>
                <input
                  type="text"
                  id="contactPage.title"
                  name="contactPage.title"
                  value={siteData.contactPage.title}
                  onChange={handleInputChange}
                />
              </div>

              <h3 className={styles.subSectionTitle}>vCard</h3>
              <div className={styles.formGroup}>
                <label htmlFor="contactPage.vCardUrl">URL de la vCard (.vcf)</label>
                <input
                  type="text"
                  id="contactPage.vCardUrl"
                  name="contactPage.vCardUrl"
                  value={siteData.contactPage.vCardUrl}
                  onChange={handleInputChange}
                  readOnly
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="vCardFile">Subir archivo vCard (.vcf)</label>
                <input
                  type="file"
                  id="vCardFile"
                  name="vCardFile"
                  accept=".vcf"
                  onChange={handleFileChange}
                />
              </div>

              <h3 className={styles.subSectionTitle}>Acciones de Contacto</h3>
              {siteData.contactPage.actions.map((action, index) => (
                <div key={index} className={styles.dynamicItem}>
                  <div className={styles.formGroup}>
                    <label>Icono (SVG)</label>
                    <input
                      type="file"
                      name={`iconFile-${index}`}
                      accept=".svg"
                      onChange={(e) => handleIconFileChange(index, e)}
                      disabled={index < 4}
                    />
                    {action.iconUrl && (
                      <div className={styles.iconPreview}>
                        <img src={`/qrs${action.iconUrl}`} alt="Icono actual" width={24} height={24} />
                        <span>{action.iconUrl}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Texto del Botón</label>
                    <input
                      type="text"
                      name="text"
                      value={action.text}
                      onChange={(e) => handleContactActionChange(index, e)}
                      readOnly={index < 4 && action.text !== 'Guardar contacto'}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Enlace (URL)</label>
                    <input
                      type="text"
                      name="link"
                      value={action.link}
                      onChange={(e) => handleContactActionChange(index, e)}
                      disabled={action.text === 'Guardar contacto'}
                    />
                  </div>
                  {index >= 4 && (
                    <button type="button" onClick={() => removeContactAction(index)} className={styles.removeButton}>
                      Eliminar Acción
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addContactAction} className={styles.addButton}>
                Añadir Acción de Contacto
              </button>
            </CollapsibleSection>

            <CollapsibleSection title="Splash Screen" defaultOpen={false}>
              <div className={styles.formGroup}>
                <label htmlFor="splashScreen.enabled">Habilitar Splash Screen</label>
                <input
                  type="checkbox"
                  id="splashScreen.enabled"
                  name="splashScreen.enabled"
                  checked={siteData.splashScreen.enabled}
                  onChange={(e) => setSiteData(prevData => ({
                    ...prevData,
                    splashScreen: { ...prevData.splashScreen, enabled: e.target.checked }
                  }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="splashVideoFile">Video de Fondo para Splash</label>
                <input
                  type="file"
                  id="splashVideoFile"
                  name="splashVideoFile"
                  accept="video/*"
                  onChange={handleFileChange}
                />
              </div>
            </CollapsibleSection>

            <div className={styles.formActions}>
              <button type="submit" className={styles.button}>
                Crear Sitio
              </button>
            </div>
          </form>
        )}
      </div>

        </>
      )}

      {message && <p className={styles.successMessage}>{message}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!siteToDelete}
        title="Eliminar Sitio"
        message={`¿Estás seguro de que quieres eliminar el sitio "${siteToDelete}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setSiteToDelete(null)}
      />
    </div>
  );
}
