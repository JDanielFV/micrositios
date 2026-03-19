'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HexColorPicker } from 'react-colorful';
import styles from '../../Admin.module.css';
import Link from 'next/link';

// New components
import CollapsibleSection from '@/components/admin/CollapsibleSection';
import PreviewPanel from '@/components/admin/PreviewPanel';
import StatusBar from '@/components/admin/StatusBar';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

// New hooks
import { useAutoSave, validateSiteData, useHistory } from '@/hooks/useAdminForms';

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
  theme: { color1: "#ffffff", color2: "#f0f0f0", angle: 90, fontImportUrl: "", fontFamily: "" },
  metadata: { title: "", description: "" },
  navigation: [
    { text: "Inicio", link: "/" },
    { text: "Ubicación", link: "/ubicacion" },
    { text: "Contacto", link: "/contacto" }
  ] as { text: string, link: string }[],
  hero: { title: "", subtitle: "", videoUrl: "", backgroundImageUrl: "", logoUrl: "", button: { text: "", link: "" } },
  about: { title: "", text: "", imageUrl: "" },
  mainContact: { title: "", text: "", button: { text: "", link: "" } },
  locationPage: { address: "", mapIframeUrl: "" },
  contactPage: {
    title: "", vCardUrl: "", actions: [
      { iconUrl: "/file.svg", text: "Guardar contacto", link: "" },
      { iconUrl: "/whatsapp.svg", text: "WhatsApp", link: "" },
      { iconUrl: "/phone.svg", text: "Llamar Ahora", link: "" },
      { iconUrl: "/mail.svg", text: "Enviar Email", link: "" }
    ]
  },
  servicesPage: { title: "", services: [] as Service[] },
  splashScreen: { enabled: false, videoUrl: "" }
};

// Icons for sections
const sectionIcons = {
  general: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  theme: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  ),
  seo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  hero: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  about: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  contact: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  location: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  services: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  splash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  )
};

export default function EditSitePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [siteData, setSiteData] = useState(defaultSiteData);
  const [id, setId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
  const [heroAudioFile, setHeroAudioFile] = useState<File | null>(null);
  const [heroLogoFile, setHeroLogoFile] = useState<File | null>(null);
  const [heroBackgroundImageFile, setHeroBackgroundImageFile] = useState<File | null>(null);
  const [vCardFile, setVCardFile] = useState<File | null>(null);
  const [splashVideoFile, setSplashVideoFile] = useState<File | null>(null);
  const [iconFiles, setIconFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  // Preview panel state
  const [showPreview, setShowPreview] = useState(false);
  const [isSidePanel, setIsSidePanel] = useState(false);
  const [panelWidth, setPanelWidth] = useState<'compact' | 'normal' | 'wide'>('normal');

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // History for undo/redo
  const history = useHistory(defaultSiteData, 30);

  // Load site data
  useEffect(() => {
    if (slug) {
      const fetchSiteData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/qrs/api/sites/${slug}`);
          if (response.ok) {
            const data = await response.json();
            setSiteData(data.data);
            setId(data.id);
            // Important: initialize history with the REAL data
            history.set(data.data);
          } else {
            setError('No se pudo cargar la información del sitio.');
          }
        } catch (err) {
          setError('Error al contactar la API.');
        } finally {
          setLoading(false);
        }
      };
      fetchSiteData();
    }
  }, [slug]);

  // Auto-save handler
  const handleSave = useCallback(async (data: any) => {
    const formData = new FormData();
    const updatedSiteData = JSON.parse(JSON.stringify(data));

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
    
    // Icon files handling
    iconFiles.forEach((file, index) => {
      if (file) {
        formData.append(`iconFile-${index}`, file);
      }
    });

    const response = await fetch(`/qrs/api/sites/${slug}`, {
      method: 'PUT',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Error al guardar');
    }
    
    setMessage(result.message);
  }, [slug, imageFile, heroVideoFile, heroAudioFile, heroLogoFile, vCardFile, splashVideoFile, heroBackgroundImageFile, iconFiles]);

  // Auto-save hook
  const { isSaving, lastSaved, hasUnsavedChanges, saveNow, error: saveError } = useAutoSave({
    data: siteData,
    saveInterval: 30000,
    onSave: handleSave,
    enabled: !loading
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validate before saving
    const errors = validateSiteData(siteData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setError(`Por favor corrige ${errors.length} error(s) antes de guardar.`);
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);

    try {
      await handleSave(siteData);
      await saveNow();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar');
    }
  };

  const handleUndo = () => {
    const previousState = history.undo();
    if (previousState) {
      setSiteData(previousState);
    }
  };

  const handleRedo = () => {
    const nextState = history.redo();
    if (nextState) {
      setSiteData(nextState);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <svg className={styles.loadingSpinner} width="48" height="48" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" />
          </svg>
          <p>Cargando datos del sitio...</p>
        </div>
      </div>
    );
  }

  if (error && !siteData.metadata) {
    return <div className={styles.container}><p className={styles.errorMessage}>{error}</p></div>;
  }

  return (
    <div className={`${styles.editPageWrapper} ${isSidePanel && showPreview ? styles.withSidePanel : ''}`}>
      <div className={styles.twoColumnLayout}>
        {/* Left Column - Form */}
        <div className={`${styles.formColumn} ${isSidePanel && showPreview ? styles.formColumnWithPanel : ''}`}>
          {/* Header with actions */}
          <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Editando: {id}</h1>
          <p className={styles.pageSubtitle}>{slug}</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleUndo}
            disabled={!history.canUndo}
            className={`${styles.iconButton} ${!history.canUndo ? styles.disabled : ''}`}
            title="Deshacer (Ctrl+Z)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>
          <button
            onClick={handleRedo}
            disabled={!history.canRedo}
            className={`${styles.iconButton} ${!history.canRedo ? styles.disabled : ''}`}
            title="Rehacer (Ctrl+Y)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 3.7" />
            </svg>
          </button>
          <button
            onClick={() => {
              setIsSidePanel(!isSidePanel);
              setShowPreview(true);
            }}
            className={`${styles.previewButton} ${isSidePanel && showPreview ? styles.active : ''}`}
            title={isSidePanel ? "Cerrar panel lateral" : "Abrir panel lateral"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            {isSidePanel && showPreview ? 'Panel' : 'Vista Previa'}
          </button>
          {isSidePanel && showPreview && (
            <div className={styles.widthToggle}>
              <button
                onClick={() => setPanelWidth('compact')}
                className={`${styles.widthButton} ${panelWidth === 'compact' ? styles.active : ''}`}
                title="Panel estrecho"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="3" width="6" height="18" rx="1" />
                  <rect x="13" y="3" width="6" height="18" rx="1" opacity="0.3" />
                </svg>
              </button>
              <button
                onClick={() => setPanelWidth('normal')}
                className={`${styles.widthButton} ${panelWidth === 'normal' ? styles.active : ''}`}
                title="Panel normal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="3" width="7" height="18" rx="1" />
                  <rect x="13" y="3" width="7" height="18" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setPanelWidth('wide')}
                className={`${styles.widthButton} ${panelWidth === 'wide' ? styles.active : ''}`}
                title="Panel ancho"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="6" height="18" rx="1" opacity="0.3" />
                  <rect x="11" y="3" width="10" height="18" rx="1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className={styles.validationErrors}>
          <h3>Errores de validación:</h3>
          <ul>
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      <form id="edit-site-form" onSubmit={handleSubmit} className={styles.form}>
        {/* General Data */}
        <CollapsibleSection title="Datos Generales" icon={sectionIcons.general}>
          <div className={styles.formGroup}>
            <label>ID</label>
            <input type="text" value={id} readOnly className={styles.readonlyInput} />
          </div>
          <div className={styles.formGroup}>
            <label>Slug (URL)</label>
            <input type="text" value={slug} readOnly className={styles.readonlyInput} />
          </div>
        </CollapsibleSection>

        {/* Theme */}
        <CollapsibleSection title="Tema y Estilo" icon={sectionIcons.theme} defaultOpen={false}>
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

        {/* SEO */}
        <CollapsibleSection title="Metadatos (SEO)" icon={sectionIcons.seo} defaultOpen={false}>
          <div className={styles.formGroup}>
            <label htmlFor="metadata.title">Título del Sitio</label>
            <input type="text" id="metadata.title" name="metadata.title" value={siteData.metadata.title} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="metadata.description">Descripción del Sitio</label>
            <textarea id="metadata.description" name="metadata.description" value={siteData.metadata.description} onChange={handleInputChange} rows={3} />
          </div>
        </CollapsibleSection>

        {/* Hero */}
        <CollapsibleSection title="Sección Principal (Hero)" icon={sectionIcons.hero}>
          <div className={styles.formGroup}>
            <label htmlFor="heroLogoFile">Logo (opcional)</label>
            <input
              type="file"
              id="heroLogoFile"
              name="heroLogoFile"
              accept="image/*"
              onChange={handleFileChange}
            />
            {siteData.hero.logoUrl && <p className={styles.fileInfo}>Logo actual: {siteData.hero.logoUrl}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="hero.title">Título Principal</label>
            <input type="text" id="hero.title" name="hero.title" value={siteData.hero.title} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="hero.subtitle">Subtítulo</label>
            <input type="text" id="hero.subtitle" name="hero.subtitle" value={siteData.hero.subtitle} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="hero.button.text">Texto del Botón</label>
            <input type="text" id="hero.button.text" name="hero.button.text" value={siteData.hero.button.text} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="heroVideoFile">Nuevo Video de Fondo (Opcional)</label>
            <input type="file" id="heroVideoFile" name="heroVideoFile" accept="video/*" onChange={handleFileChange} />
            {siteData.hero.videoUrl && <p className={styles.fileInfo}>Video actual: {siteData.hero.videoUrl}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="heroBackgroundImageFile">Imagen de Fondo del Hero (Opcional - si no hay video)</label>
            <input type="file" id="heroBackgroundImageFile" name="heroBackgroundImageFile" accept="image/*" onChange={handleFileChange} />
            {(siteData.hero as any).backgroundImageUrl && <p className={styles.fileInfo}>Imagen actual: {(siteData.hero as any).backgroundImageUrl}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="heroAudioFile">Nuevo Audio (Opcional - se reproduce al interactuar)</label>
            <input type="file" id="heroAudioFile" name="heroAudioFile" accept="audio/*" onChange={handleFileChange} />
            {(siteData.hero as any).audioUrl && <p className={styles.fileInfo}>Audio actual: {(siteData.hero as any).audioUrl}</p>}
          </div>
        </CollapsibleSection>

        {/* About */}
        <CollapsibleSection title="Sección &quot;Acerca de&quot;" icon={sectionIcons.about}>
          <div className={styles.formGroup}>
            <label htmlFor="about.title">Título</label>
            <input type="text" id="about.title" name="about.title" value={siteData.about.title} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="about.text">Texto</label>
            <textarea id="about.text" name="about.text" value={siteData.about.text} onChange={handleInputChange} rows={5} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="imageFile">Nueva Imagen de Fondo (Opcional)</label>
            <input type="file" id="imageFile" name="imageFile" onChange={handleFileChange} />
            {siteData.about.imageUrl && <p className={styles.fileInfo}>Imagen actual: {siteData.about.imageUrl}</p>}
          </div>
        </CollapsibleSection>

        {/* Main Contact */}
        <CollapsibleSection title="Sección Contacto Principal" icon={sectionIcons.contact} defaultOpen={false}>
          <div className={styles.formGroup}>
            <label htmlFor="mainContact.title">Título</label>
            <input type="text" id="mainContact.title" name="mainContact.title" value={siteData.mainContact.title} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="mainContact.text">Texto</label>
            <textarea id="mainContact.text" name="mainContact.text" value={siteData.mainContact.text} onChange={handleInputChange} rows={3} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="mainContact.button.text">Texto del Botón</label>
            <input type="text" id="mainContact.button.text" name="mainContact.button.text" value={siteData.mainContact.button.text} onChange={handleInputChange} />
          </div>
        </CollapsibleSection>

        {/* Location */}
        <CollapsibleSection title="Página de Ubicación" icon={sectionIcons.location} defaultOpen={false}>
          <div className={styles.formGroup}>
            <label htmlFor="locationPage.address">Dirección</label>
            <input type="text" id="locationPage.address" name="locationPage.address" value={siteData.locationPage.address} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="locationPage.mapIframeUrl">URL del Iframe de Google Maps</label>
            <input type="text" id="locationPage.mapIframeUrl" name="locationPage.mapIframeUrl" value={siteData.locationPage.mapIframeUrl} onChange={handleInputChange} />
          </div>
        </CollapsibleSection>

        {/* Services */}
        <CollapsibleSection title="Página de Servicios" icon={sectionIcons.services}>
          <div className={styles.formGroup}>
            <label htmlFor="servicesPage.title">Título de la Página</label>
            <input type="text" id="servicesPage.title" name="servicesPage.title" value={siteData.servicesPage.title} onChange={handleInputChange} />
          </div>
          {siteData.servicesPage.services.map((service, index) => (
            <div key={index} className={styles.dynamicItem}>
              <div className={styles.formGroup}>
                <label>Título del Servicio</label>
                <input type="text" name="title" value={service.title} onChange={(e) => handleServiceChange(index, e)} />
              </div>
              <div className={styles.formGroup}>
                <label>Descripción del Servicio</label>
                <textarea name="description" value={service.description} onChange={(e) => handleServiceChange(index, e)} rows={3} />
              </div>
              <button type="button" onClick={() => removeService(index)} className={styles.removeButton}>Eliminar Servicio</button>
            </div>
          ))}
          <button type="button" onClick={addService} className={styles.addButton}>Añadir Servicio</button>
        </CollapsibleSection>

        {/* Contact Page */}
        <CollapsibleSection title="Página de Contacto" icon={sectionIcons.contact} defaultOpen={false}>
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
            <label htmlFor="vCardFile">Subir nuevo archivo vCard (.vcf)</label>
            <input
              type="file"
              id="vCardFile"
              name="vCardFile"
              accept=".vcf"
              onChange={handleFileChange}
            />
            {siteData.contactPage.vCardUrl && (
              <p className={styles.fileInfo}>Archivo actual: <a href={`/qrs${siteData.contactPage.vCardUrl}`} target="_blank" rel="noopener noreferrer">{siteData.contactPage.vCardUrl}</a></p>
            )}
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

        {/* Splash Screen */}
        <CollapsibleSection title="Pantalla de Bienvenida (Splash Screen)" icon={sectionIcons.splash} defaultOpen={false}>
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
              className={styles.checkbox}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="splashVideoFile">Video de Fondo para Splash (Opcional)</label>
            <input
              type="file"
              id="splashVideoFile"
              name="splashVideoFile"
              accept="video/*"
              onChange={handleFileChange}
            />
            {siteData.splashScreen.videoUrl && <p className={styles.fileInfo}>Video actual: {siteData.splashScreen.videoUrl}</p>}
          </div>
        </CollapsibleSection>
      </form>

      {/* Messages */}
      {message && <p className={styles.successMessage}>{message}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* Status Bar */}
      <StatusBar
        isSaving={isSaving}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
        error={saveError || (validationErrors.length > 0 ? `${validationErrors.length} errores de validación` : null)}
        success={message}
      />

      {/* Bottom Action Bar */}
      <div className={styles.bottomBar}>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className={`${styles.bottomBarButton} ${styles.cancelButton}`}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          <span>Volver</span>
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await saveNow();
            } catch (err) {
              // Error already shown in StatusBar
            }
          }}
          disabled={isSaving || !hasUnsavedChanges}
          className={`${styles.bottomBarButton} ${styles.saveButton} ${isSaving || !hasUnsavedChanges ? styles.disabled : ''}`}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
          </svg>
          <span>{isSaving ? 'Guardando...' : hasUnsavedChanges ? 'Guardar' : 'Guardado'}</span>
        </button>
      </div>
        </div>

        {/* Right Column - Preview Panel */}
        {isSidePanel && showPreview && (
          <div className={styles.previewColumn}>
            <PreviewPanel
              siteData={siteData}
              slug={slug}
              isVisible={true}
              isSidePanel={true}
              panelWidth={panelWidth}
              onClose={() => setShowPreview(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
