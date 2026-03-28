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
import VCardModal from '@/components/admin/VCardModal';

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
      { iconUrl: "/card.png", text: "Guardar contacto", link: "" },
      { iconUrl: "/wh.svg", text: "WhatsApp", link: "" },
      { iconUrl: "/sm.webp", text: "Llamar Ahora", link: "" },
      { iconUrl: "/ml.webp", text: "Enviar Email", link: "" }
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

const getSafeUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('http')) return url;
  return `/qrs${url}`;
};

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

  // vCard Modal State
  const [showVCardModal, setShowVCardModal] = useState(false);
  const [vCardPreviewData, setVCardPreviewData] = useState<any>(null);
  const [tempVCardFile, setTempVCardFile] = useState<File | null>(null);

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

  const handleIconFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const blobUrl = URL.createObjectURL(file);
      
      // Update the file array for the final upload
      const newIconFiles = [...iconFiles];
      newIconFiles[index] = file;
      setIconFiles(newIconFiles);

      // Update the site data iconUrl with the blob for live preview
      setSiteData(prevData => {
        const newActions = [...prevData.contactPage.actions];
        newActions[index] = { ...newActions[index], iconUrl: blobUrl };
        return { ...prevData, contactPage: { ...prevData.contactPage, actions: newActions } };
      });
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

  const addContactAction = () => {
    setSiteData(prevData => ({
      ...prevData,
      contactPage: {
        ...prevData.contactPage,
        actions: [...prevData.contactPage.actions, { iconUrl: '/globe.svg', text: 'Nuevo Enlace', link: '' } as ContactAction]
      }
    }));
  };

  const removeContactAction = (index: number) => {
    if (index < 4) return; // Protect default templates
    setSiteData(prevData => ({
      ...prevData,
      contactPage: {
        ...prevData.contactPage,
        actions: prevData.contactPage.actions.filter((_, i) => i !== index)
      }
    }));
  };

  // vCard Generation Logic
  const generateVCard = async () => {
    try {
      setMessage('Generando vCard con logo...');
      
      const name = siteData.metadata.title || 'Contacto';
      const whatsappRaw = siteData.contactPage.actions.find(a => a.text === 'WhatsApp')?.link || '';
      // Clean WhatsApp to get only the number
      const whatsapp = whatsappRaw.replace(/https?:\/\/(wa\.me|wa\.ms)\//, '').replace(/\//g, '').trim();
      
      const phone = siteData.contactPage.actions.find(a => a.text === 'Llamar Ahora')?.link.replace('tel:', '') || '';
      const email = siteData.contactPage.actions.find(a => a.text === 'Enviar Email')?.link.replace('mailto:', '') || '';
      
      // Process Logo to 1:1 Canvas with Inversion (to make it black on white)
      let logoBase64 = '';
      const logoSource = localPreviews.logo || (siteData.hero.logoUrl ? `/qrs${siteData.hero.logoUrl}` : null);
      
      if (logoSource) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = logoSource;
        });

        const canvas = document.createElement('canvas');
        const size = Math.max(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = "#FFFFFF"; // Background white for vCard standard
          ctx.fillRect(0, 0, size, size);
          
          // Apply invert filter to make white logos black
          ctx.filter = 'invert(100%)';
          ctx.drawImage(img, (size - img.width) / 2, (size - img.height) / 2);
          
          logoBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        }
      }

      const vCardContent = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        `ORG:${name}`,
        phone ? `TEL;TYPE=WORK,VOICE:${phone}` : '',
        whatsapp ? `TEL;TYPE=CELL,VOICE:${whatsapp}` : '',
        email ? `EMAIL;TYPE=PREF,INTERNET:${email}` : '',
        logoBase64 ? `PHOTO;ENCODING=b;TYPE=JPEG:${logoBase64}` : '',
        'END:VCARD'
      ].filter(line => line !== '').join('\n');

      const blob = new Blob([vCardContent], { type: 'text/vcard' });
      const file = new File([blob], 'contacto.vcf', { type: 'text/vcard' });
      
      // Open modal for review
      setTempVCardFile(file);
      setVCardPreviewData({
        name,
        phone,
        whatsapp,
        email,
        logoPreview: logoSource
      });
      setShowVCardModal(true);
      setMessage('');
    } catch (err) {
      setError('Error al generar vCard: El logo debe estar en un formato válido.');
    }
  };

  const finalizeVCard = async () => {
    if (tempVCardFile) {
      // 1. Assign to state
      setVCardFile(tempVCardFile);
      
      // 2. Update site data URL
      const newSiteData = {
        ...siteData,
        contactPage: { ...siteData.contactPage, vCardUrl: `/uploads/${slug}/contacto.vcf` }
      };
      setSiteData(newSiteData);
      
      setShowVCardModal(false);
      setMessage('¡vCard generada! Guardando cambios...');

      // 3. Auto-trigger save immediately
      setTimeout(async () => {
        try {
          await handleSave(newSiteData);
          setMessage('¡vCard guardada y asignada con éxito!');
          setTimeout(() => setMessage(''), 3000);
        } catch (e) {
          setError('vCard generada pero hubo un error al persistir los datos.');
        }
      }, 100);
    }
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
                  <label>Dirección Física (Texto que verán los clientes)</label>
                  <textarea 
                    name="locationPage.address" 
                    value={siteData.locationPage.address} 
                    onChange={handleInputChange} 
                    rows={3} 
                    className={styles.shadcnTextarea}
                    placeholder="Ej: Av. Independencia 123, Col. Centro..."
                  />
                </div>

                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--admin-container-border)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--admin-accent)' }}>Buscador de Mapa</h3>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                    <input 
                      type="text" 
                      id="map-search-input"
                      placeholder="Busca un lugar (Ej: Notaría 178 CDMX)" 
                      className={styles.shadcnInput}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const query = (e.target as HTMLInputElement).value;
                          if (query) {
                            const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                            setSiteData(prev => ({
                              ...prev,
                              locationPage: { ...prev.locationPage, mapIframeUrl: embedUrl }
                            }));
                          }
                        }
                      }}
                    />
                    <button 
                      type="button"
                      className={styles.nextButton}
                      style={{ padding: '0 1rem', width: 'auto' }}
                      onClick={() => {
                        const input = document.getElementById('map-search-input') as HTMLInputElement;
                        if (input.value) {
                          const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(input.value)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                          setSiteData(prev => ({
                            ...prev,
                            locationPage: { ...prev.locationPage, mapIframeUrl: embedUrl }
                          }));
                        }
                      }}
                    >
                      Buscar
                    </button>
                  </div>
                  
                  <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '1rem' }}>
                    Escribe el nombre del lugar o la dirección y presiona Buscar. El mapa de abajo y la vista previa se actualizarán automáticamente.
                  </p>

                  {siteData.locationPage.mapIframeUrl && (
                    <div style={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <iframe
                        src={siteData.locationPage.mapIframeUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                      ></iframe>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                  <label>URL del Iframe (Auto-generado)</label>
                  <input 
                    type="text" 
                    name="locationPage.mapIframeUrl" 
                    value={siteData.locationPage.mapIframeUrl} 
                    onChange={handleInputChange} 
                    className={styles.shadcnInput}
                    style={{ fontSize: '0.8rem', opacity: 0.8 }}
                    placeholder="https://www.google.com/maps/embed?..." 
                  />
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="animate-in">
                <h2 className={styles.wizardTitle}>Conexión (Contacto)</h2>
                <p className={styles.wizardDescription}>Configura los canales de comunicación y genera tu vCard digital.</p>
                
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0, 122, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 122, 255, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>Tarjeta de Contacto (vCard)</h3>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Genera el archivo que los clientes descargarán en sus celulares.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={generateVCard}
                    className={styles.nextButton}
                    style={{ background: 'var(--admin-accent)', padding: '0.6rem 1.2rem' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                    Generar vCard
                  </button>
                </div>

                <div className={styles.formGroup}>
                  <label>Título de Contacto en Pantalla</label>
                  <input type="text" name="contactPage.title" value={siteData.contactPage.title} onChange={handleInputChange} className={styles.shadcnInput} />
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontWeight: '600' }}>BOTONES DE ACCIÓN</label>
                  </div>
                  
                  {siteData.contactPage.actions.map((action, idx) => (
                    <div key={idx} className={styles.dynamicItem} style={{ padding: '1.2rem' }}>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        {/* Icon Slot */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '10px' }}>
                            <img src={getSafeUrl(action.iconUrl)} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                          {idx >= 4 && (
                            <label className={styles.editButton} style={{ padding: '4px 8px', fontSize: '0.65rem', cursor: 'pointer' }}>
                              Cambiar
                              <input type="file" accept=".svg" style={{ display: 'none' }} onChange={(e) => handleIconFileChange(idx, e)} />
                            </label>
                          )}
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.6, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Etiqueta</span>
                              <input 
                                type="text" 
                                name="text" 
                                value={action.text} 
                                onChange={(e) => handleContactActionChange(idx, e)} 
                                readOnly={idx < 4 && action.text !== 'Guardar contacto'}
                                className={styles.shadcnInput}
                                style={{ padding: '0.5rem' }}
                              />
                            </div>
                            <div style={{ flex: 2 }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.6, textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Enlace / Dato</span>
                              <input 
                                type="text" 
                                name="link" 
                                value={action.link} 
                                onChange={(e) => handleContactActionChange(idx, e)} 
                                disabled={action.text === 'Guardar contacto'}
                                placeholder={action.text === 'WhatsApp' ? '52...' : action.text === 'Llamar Ahora' ? 'tel:...' : 'https://...'}
                                className={styles.shadcnInput}
                                style={{ padding: '0.5rem' }}
                              />
                            </div>
                          </div>
                        </div>

                        {idx >= 4 && (
                          <button type="button" onClick={() => removeContactAction(idx)} className={styles.removeButton}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addContactAction} className={styles.addButton}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Añadir Canal Personalizado (Instagram, LinkedIn, etc.)
                </button>
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

      {vCardPreviewData && (
        <VCardModal
          isOpen={showVCardModal}
          onClose={() => setShowVCardModal(false)}
          onSave={finalizeVCard}
          data={vCardPreviewData}
        />
      )}
    </div>
  );
}
