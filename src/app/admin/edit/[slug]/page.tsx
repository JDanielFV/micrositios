'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HexColorPicker } from 'react-colorful';
import styles from '../../Admin.module.css';
import Link from 'next/link';

// New components
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
    { text: "Servicios", link: "/servicios" },
    { text: "Ubicación", link: "/ubicacion" },
    { text: "Contacto", link: "/contacto" }
  ],
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

const STEPS = [
  { id: 1, label: 'Identidad', route: '/', section: 'top' },
  { id: 2, label: 'Portada', route: '/', section: 'hero' },
  { id: 3, label: 'Historia', route: '/', section: 'about' },
  { id: 4, label: 'Acción', route: '/', section: 'main-contact' },
  { id: 5, label: 'Servicios', route: '/servicios', section: 'top' },
  { id: 6, label: 'Ubicación', route: '/ubicacion', section: 'top' },
  { id: 7, label: 'Conexión', route: '/contacto', section: 'top' }
];

export default function EditSitePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [siteData, setSiteData] = useState(defaultSiteData);
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  // File states for persistence
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
  const [heroAudioFile, setHeroAudioFile] = useState<File | null>(null);
  const [heroLogoFile, setHeroLogoFile] = useState<File | null>(null);
  const [heroBackgroundImageFile, setHeroBackgroundImageFile] = useState<File | null>(null);
  const [vCardFile, setVCardFile] = useState<File | null>(null);
  const [splashVideoFile, setSplashVideoFile] = useState<File | null>(null);
  const [iconFiles, setIconFiles] = useState<File[]>([]);

  // Local previews for reactivity (blob URLs)
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

  // History for undo/redo
  const history = useHistory(defaultSiteData, 30);

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
    
    iconFiles.forEach((file, index) => {
      if (file) formData.append(`iconFile-${index}`, file);
    });

    const response = await fetch(`/qrs/api/sites/${slug}`, {
      method: 'PUT',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Error al guardar');
    setMessage(result.message);
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  }, [slug, imageFile, heroVideoFile, heroAudioFile, heroLogoFile, vCardFile, splashVideoFile, heroBackgroundImageFile, iconFiles]);

  const { isSaving, lastSaved, hasUnsavedChanges, saveNow, error: saveError } = useAutoSave({
    data: siteData,
    saveInterval: 30000,
    onSave: handleSave,
    enabled: !loading
  });

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

  // Merge live siteData with local blob previews for the PreviewPanel
  const livePreviewData = useMemo(() => {
    const merged = JSON.parse(JSON.stringify(siteData));
    if (localPreviews.heroVideo) merged.hero.videoUrl = localPreviews.heroVideo;
    if (localPreviews.heroImage) merged.hero.backgroundImageUrl = localPreviews.heroImage;
    if (localPreviews.aboutImage) merged.about.imageUrl = localPreviews.aboutImage;
    if (localPreviews.logo) merged.hero.logoUrl = localPreviews.logo;
    return merged;
  }, [siteData, localPreviews]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSiteData(prevData => {
      const keys = name.split('.');
      const newData = { ...prevData };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleColorChange = (colorName: string, colorValue: string) => {
    setSiteData(prevData => ({
      ...prevData,
      theme: { ...prevData.theme, [colorName]: colorValue }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const blobUrl = URL.createObjectURL(file);
      
      if (name === 'imageFile') {
        setImageFile(file);
        setLocalPreviews(prev => ({ ...prev, aboutImage: blobUrl }));
      } else if (name === 'heroVideoFile') {
        setHeroVideoFile(file);
        setLocalPreviews(prev => ({ ...prev, heroVideo: blobUrl }));
      } else if (name === 'heroLogoFile') {
        setHeroLogoFile(file);
        setLocalPreviews(prev => ({ ...prev, logo: blobUrl }));
      } else if (name === 'heroBackgroundImageFile') {
        setHeroBackgroundImageFile(file);
        setLocalPreviews(prev => ({ ...prev, heroImage: blobUrl }));
      } else if (name === 'vCardFile') {
        setVCardFile(file);
      } else if (name === 'splashVideoFile') {
        setSplashVideoFile(file);
      } else if (name === 'heroAudioFile') {
        setHeroAudioFile(file);
      }
    }
  };

  const handleServiceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSiteData(prevData => {
      const newServices = [...prevData.servicesPage.services];
      newServices[index] = { ...newServices[index], [name]: value };
      return { ...prevData, servicesPage: { ...prevData.servicesPage, services: newServices } };
    });
  };

  const addService = () => {
    setSiteData(prevData => ({
      ...prevData,
      servicesPage: {
        ...prevData.servicesPage,
        services: [...prevData.servicesPage.services, { title: '', description: '' }]
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
      newActions[index] = { ...newActions[index], [name]: value };
      return { ...prevData, contactPage: { ...prevData.contactPage, actions: newActions } };
    });
  };

  const handleUndo = () => {
    const prev = history.undo();
    if (prev) setSiteData(prev);
  };

  const handleRedo = () => {
    const next = history.redo();
    if (next) setSiteData(next);
  };

  if (loading) return (
    <div className={styles.loadingState}>
      <svg className={styles.loadingSpinner} width="48" height="48" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" />
      </svg>
      <p>Cargando datos del sitio...</p>
    </div>
  );

  return (
    <div className={`${styles.editPageWrapper} ${styles.withSidePanel}`}>
      {/* Step Stepper Header */}
      <div className={styles.stepper}>
        {STEPS.map((step) => (
          <div 
            key={step.id} 
            className={`${styles.step} ${currentStep >= step.id ? styles.stepActive : ''}`}
            onClick={() => setCurrentStep(step.id)}
          >
            <div className={styles.stepIcon}>{step.id}</div>
            <div className={styles.stepLabel}>{step.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.twoColumnLayout}>
        <div className={`${styles.formColumn} ${styles.formColumnWithPanel}`}>
          
          <div className={styles.wizardStepContent}>
            {currentStep === 1 && (
              <div className="animate-in">
                <h2 className={styles.wizardTitle}>Identidad & Estilo</h2>
                <p className={styles.wizardDescription}>Define la base visual y técnica de tu micrositio.</p>
                
                <div className={styles.formGroup}>
                  <label>Color Principal (Gradiente Inicio)</label>
                  <HexColorPicker color={siteData.theme.color1} onChange={(c) => handleColorChange('color1', c)} />
                  <input type="text" value={siteData.theme.color1} onChange={(e) => handleColorChange('color1', e.target.value)} className={styles.colorInput} />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Color Secundario (Gradiente Fin)</label>
                  <HexColorPicker color={siteData.theme.color2} onChange={(c) => handleColorChange('color2', c)} />
                  <input type="text" value={siteData.theme.color2} onChange={(e) => handleColorChange('color2', e.target.value)} className={styles.colorInput} />
                </div>

                <div className={styles.formGroup}>
                  <label>Familia de Fuente (CSS)</label>
                  <input type="text" name="theme.fontFamily" value={siteData.theme.fontFamily} onChange={handleInputChange} placeholder="'Inter', sans-serif" />
                </div>

                <div className={styles.formGroup}>
                  <label>Título SEO (Para Google)</label>
                  <input type="text" name="metadata.title" value={siteData.metadata.title} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in">
                <h2 className={styles.wizardTitle}>Portada (Hero)</h2>
                <p className={styles.wizardDescription}>La primera impresión. Configura el video o imagen de fondo.</p>
                
                <div className={styles.formGroup}>
                  <label>Título Principal</label>
                  <input type="text" name="hero.title" value={siteData.hero.title} onChange={handleInputChange} />
                </div>

                <div className={styles.formGroup}>
                  <label>Subtítulo</label>
                  <textarea name="hero.subtitle" value={siteData.hero.subtitle} onChange={handleInputChange} rows={2} />
                </div>

                <div className={styles.formGroup}>
                  <label>Logo de la Notaría</label>
                  <input type="file" name="heroLogoFile" accept="image/*" onChange={handleFileChange} />
                  {localPreviews.logo && <div className={styles.filePreviewContainer}><img src={localPreviews.logo} className={styles.filePreviewImg} /></div>}
                </div>

                <div className={styles.formGroup}>
                  <label>Video de Fondo (Recomendado)</label>
                  <input type="file" name="heroVideoFile" accept="video/*" onChange={handleFileChange} />
                  {localPreviews.heroVideo && <div className={styles.filePreviewContainer}><video src={localPreviews.heroVideo} autoPlay muted loop className={styles.filePreviewVideo} /></div>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-in">
                <h2 className={styles.wizardTitle}>Nuestra Historia</h2>
                <p className={styles.wizardDescription}>Habla sobre la trayectoria y los valores de la oficina.</p>
                
                <div className={styles.formGroup}>
                  <label>Título de Sección</label>
                  <input type="text" name="about.title" value={siteData.about.title} onChange={handleInputChange} />
                </div>

                <div className={styles.formGroup}>
                  <label>Contenido</label>
                  <textarea name="about.text" value={siteData.about.text} onChange={handleInputChange} rows={6} />
                </div>

                <div className={styles.formGroup}>
                  <label>Imagen de Apoyo</label>
                  <input type="file" name="imageFile" accept="image/*" onChange={handleFileChange} />
                  {localPreviews.aboutImage && <div className={styles.filePreviewContainer}><img src={localPreviews.aboutImage} className={styles.filePreviewImg} /></div>}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-in">
                <h2 className={styles.wizardTitle}>Llamada a la Acción (Home)</h2>
                <p className={styles.wizardDescription}>Configura el mensaje final de la página de inicio.</p>
                
                <div className={styles.formGroup}>
                  <label>Título de la Sección</label>
                  <input type="text" name="mainContact.title" value={siteData.mainContact.title} onChange={handleInputChange} />
                </div>

                <div className={styles.formGroup}>
                  <label>Texto Descriptivo</label>
                  <textarea name="mainContact.text" value={siteData.mainContact.text} onChange={handleInputChange} rows={3} />
                </div>

                <div className={styles.formGroup}>
                  <label>Texto del Botón</label>
                  <input type="text" name="mainContact.button.text" value={siteData.mainContact.button.text} onChange={handleInputChange} />
                </div>

                <div className={styles.formGroup}>
                  <label>Destino del Botón (Ruta)</label>
                  <input type="text" name="mainContact.button.link" value={siteData.mainContact.button.link} onChange={handleInputChange} placeholder="/contacto" />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="animate-in">
                <h2 className={styles.wizardTitle}>Servicios</h2>
                <p className={styles.wizardDescription}>Enumera los trámites y especialidades que ofreces.</p>
                
                <div className={styles.formGroup}>
                  <label>Título de la Página</label>
                  <input type="text" name="servicesPage.title" value={siteData.servicesPage.title} onChange={handleInputChange} className={styles.shadcnInput} />
                </div>

                <div style={{ marginTop: '2rem' }}>
                  {siteData.servicesPage.services.map((service, idx) => (
                    <div key={idx} className={styles.dynamicItem}>
                      <div className={styles.dynamicHeader}>
                        <span className={styles.dynamicTitle}>Servicio #{idx + 1}</span>
                        <button type="button" onClick={() => removeService(idx)} className={styles.removeButton}>
                          Eliminar
                        </button>
                      </div>
                      <input 
                        type="text" 
                        name="title" 
                        value={service.title} 
                        onChange={(e) => handleServiceChange(idx, e)} 
                        placeholder="Nombre del servicio (Ej: Escrituraciones)" 
                        className={styles.shadcnInput}
                      />
                      <textarea 
                        name="description" 
                        value={service.description} 
                        onChange={(e) => handleServiceChange(idx, e)} 
                        placeholder="Descripción breve de lo que incluye este servicio..." 
                        rows={3}
                        className={styles.shadcnTextarea}
                      />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addService} className={styles.addButton}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Añadir Nuevo Servicio
                </button>
              </div>
            )}

            {currentStep === 6 && (
              <div className="animate-in">
                <h2 className={styles.wizardTitle}>Ubicación</h2>
                <p className={styles.wizardDescription}>Ayuda a tus clientes a encontrarte fácilmente.</p>
                
                <div className={styles.formGroup}>
                  <label>Dirección Física</label>
                  <textarea name="locationPage.address" value={siteData.locationPage.address} onChange={handleInputChange} rows={3} />
                </div>

                <div className={styles.formGroup}>
                  <label>URL de Google Maps (Iframe)</label>
                  <input type="text" name="locationPage.mapIframeUrl" value={siteData.locationPage.mapIframeUrl} onChange={handleInputChange} placeholder="https://www.google.com/maps/embed?..." />
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="animate-in">
                <h2 className={styles.wizardTitle}>Conexión (Contacto)</h2>
                <p className={styles.wizardDescription}>Configura los canales de comunicación directa.</p>
                
                <div className={styles.formGroup}>
                  <label>Título de Contacto</label>
                  <input type="text" name="contactPage.title" value={siteData.contactPage.title} onChange={handleInputChange} className={styles.shadcnInput} />
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginBottom: '1rem', display: 'block' }}>Canales de Comunicación</label>
                  {siteData.contactPage.actions.map((action, idx) => (
                    <div key={idx} className={styles.dynamicItem} style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                          {action.text === 'WhatsApp' && <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.506-.173-.007-.371-.007-.57-.007-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.13.57-.074 1.758-.706 2.006-1.388.248-.682.248-1.265.174-1.388-.074-.124-.272-.198-.57-.347m-4.821 7.454c-1.893 0-3.748-.511-5.36-1.478l-.384-.227-3.982 1.044 1.063-3.885-.249-.396c-1.062-1.69-1.622-3.663-1.622-5.708 0-5.86 4.766-10.626 10.626-10.626 2.839 0 5.507 1.105 7.513 3.112 2.006 2.007 3.111 4.675 3.111 7.514 0 5.861-4.766 10.627-10.627 10.627m8.945-18.462C19.116 1.065 16.1 0 12.651 0 5.723 0 .083 5.64.083 12.567c0 2.212.578 4.371 1.676 6.304L0 24l5.122-1.343c1.867 1.02 3.976 1.558 6.123 1.558 6.928 0 12.569-5.64 12.569-12.568 0-3.356-1.306-6.511-3.678-8.883"/></svg>}
                          {action.text === 'Llamar Ahora' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                          {action.text === 'Enviar Email' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
                          {action.text === 'Guardar contacto' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '4px' }}>{action.text}</span>
                          <input 
                            type="text" 
                            name="link" 
                            value={action.link} 
                            onChange={(e) => handleContactActionChange(idx, e)} 
                            placeholder={action.text === 'WhatsApp' ? '52...' : 'Enlace o dato...'} 
                            className={styles.shadcnInput}
                            style={{ padding: '0.5rem 0.75rem' }}
                            disabled={action.text === 'Guardar contacto'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* New Wizard Bottom Bar */}
          <div className={styles.bottomBar}>
            <div className={styles.navButtons}>
              {currentStep > 1 && (
                <button onClick={() => setCurrentStep(s => s - 1)} className={styles.iconButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
              )}
            </div>

            <div className={styles.navButtons}>
              <button 
                onClick={async () => { 
                  await saveNow(); 
                  setMessage('¡Cambios guardados con éxito!'); 
                  setTimeout(() => setMessage(''), 3000);
                }} 
                disabled={isSaving || !hasUnsavedChanges} 
                className={`${styles.nextButton} ${styles.saveButton}`}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--admin-text)' }}
              >
                {isSaving ? 'Guardando...' : 'Solo Guardar'}
              </button>
              
              {currentStep < 7 ? (
                <button onClick={() => setCurrentStep(s => s + 1)} className={styles.nextButton}>
                  Continuar
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              ) : (
                <button onClick={async () => { await saveNow(); router.push('/admin'); }} disabled={isSaving} className={styles.nextButton}>
                  Finalizar Edición
                </button>
              )}
            </div>
          </div>

          <div style={{ padding: '0 3rem' }}>
            <StatusBar
              isSaving={isSaving}
              lastSaved={lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
              error={saveError}
              success={message}
            />
          </div>
        </div>

        <div className={styles.previewColumn}>
          <PreviewPanel
            siteData={livePreviewData} // Pass merged data with blob URLs
            slug={slug}
            subRoute={STEPS.find(s => s.id === currentStep)?.route} // Auto-navigate!
            currentSection={STEPS.find(s => s.id === currentStep)?.section} // Auto-scroll!
          />
        </div>
      </div>
    </div>
  );
}
