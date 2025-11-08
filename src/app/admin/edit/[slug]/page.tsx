'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HexColorPicker } from 'react-colorful';
import styles from '../../Admin.module.css';
import Link from 'next/link';



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
  hero: { title: "", subtitle: "", videoUrl: "", logoUrl: "", button: { text: "", link: "" } },
  about: { title: "", text: "", imageUrl: "" },
  mainContact: { title: "", text: "", button: { text: "", link: "" } },
  locationPage: { address: "", mapIframeUrl: "" },
  contactPage: { title: "", vCardUrl: "", actions: [
    { iconUrl: "/file.svg", text: "Guardar contacto", link: "" },
    { iconUrl: "/whatsapp.svg", text: "WhatsApp", link: "" },
    { iconUrl: "/phone.svg", text: "Llamar Ahora", link: "" },
    { iconUrl: "/mail.svg", text: "Enviar Email", link: "" }
  ] },
  servicesPage: { title: "", services: [] as Service[] },
  splashScreen: { enabled: false, videoUrl: "" }
};

export default function EditSitePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [siteData, setSiteData] = useState(defaultSiteData);
  const [id, setId] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
    const [heroLogoFile, setHeroLogoFile] = useState<File | null>(null);
    const [vCardFile, setVCardFile] = useState<File | null>(null);
  const [splashVideoFile, setSplashVideoFile] = useState<File | null>(null);
  const [iconFiles, setIconFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      const fetchSiteData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/qr/api/sites/${slug}`);
          if (response.ok) {
            const data = await response.json();
            setSiteData(data.data);
            setId(data.id);
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
      } else if (name === 'heroLogoFile') {
        setHeroLogoFile(file);
      } else if (name === 'vCardFile') {
        setVCardFile(file);
      } else if (name === 'splashVideoFile') {
        setSplashVideoFile(file);
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

    const formData = new FormData();

    // Create a deep copy to modify
    const updatedSiteData = JSON.parse(JSON.stringify(siteData));

    if (vCardFile) {
      updatedSiteData.contactPage.vCardUrl = `/uploads/${slug}/${vCardFile.name}`;
    }

    formData.append('siteData', JSON.stringify(updatedSiteData));
    
    if (imageFile) formData.append('imageFile', imageFile);
    if (heroVideoFile) formData.append('heroVideoFile', heroVideoFile);
    if (heroLogoFile) formData.append('heroLogoFile', heroLogoFile);
    if (vCardFile) formData.append('vCardFile', vCardFile);
    if (splashVideoFile) formData.append('splashVideoFile', splashVideoFile);
    iconFiles.forEach((file, index) => {
      if (file) formData.append(`iconFile-${index}`, file);
    });

    try {
      const response = await fetch(`/qr/api/sites/${slug}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        // Optionally redirect or update UI
        router.push('/admin'); // Redirect to admin list after successful update
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Ocurrió un error al enviar el formulario.');
    }
  };

  if (loading) {
    return <div className={styles.container}>Cargando...</div>;
  }

  if (error) {
    return <div className={styles.container}><p className={styles.errorMessage}>{error}</p></div>;
  }

  return (
    <div className={styles.container}>
      <Link href="/admin" className={styles.backLink}>&larr; Volver a la lista</Link>
      <h1 className={styles.title}>Editando Sitio: {id}</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Form sections copied from AdminPage */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Datos Generales</h2>
          <div className={styles.formGroup}>
            <label>ID</label>
            <input type="text" value={id} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label>Slug (URL)</label>
            <input type="text" value={slug} readOnly />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Tema y Estilo</h2>
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
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Metadatos (SEO)</h2>
          <div className={styles.formGroup}>
            <label htmlFor="metadata.title">Título del Sitio</label>
            <input type="text" id="metadata.title" name="metadata.title" value={siteData.metadata.title} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="metadata.description">Descripción del Sitio</label>
            <input type="text" id="metadata.description" name="metadata.description" value={siteData.metadata.description} onChange={handleInputChange} />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Sección Principal (Hero)</h2>
          <div className={styles.formGroup}>
            <label htmlFor="heroLogoFile">Logo (opcional)</label>
            <input
              type="file"
              id="heroLogoFile"
              name="heroLogoFile"
              accept="image/*"
              onChange={handleFileChange}
            />
            {siteData.hero.logoUrl && <p>Logo actual: {siteData.hero.logoUrl}</p>}
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
            {siteData.hero.videoUrl && <p>Video actual: {siteData.hero.videoUrl}</p>}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Sección "Acerca de"</h2>
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
            {siteData.about.imageUrl && <p>Imagen actual: {siteData.about.imageUrl}</p>}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Sección Contacto Principal</h2>
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
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Página de Ubicación</h2>
          <div className={styles.formGroup}>
            <label htmlFor="locationPage.address">Dirección</label>
            <input type="text" id="locationPage.address" name="locationPage.address" value={siteData.locationPage.address} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="locationPage.mapIframeUrl">URL del Iframe de Google Maps</label>
            <input type="text" id="locationPage.mapIframeUrl" name="locationPage.mapIframeUrl" value={siteData.locationPage.mapIframeUrl} onChange={handleInputChange} />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Página de Servicios</h2>
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
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Página de Contacto</h2>
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
              readOnly // This will be auto-generated
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
              <p>Archivo actual: <a href={`/qr${siteData.contactPage.vCardUrl}`} target="_blank" rel="noopener noreferrer">{siteData.contactPage.vCardUrl}</a></p>
            )}
          </div>

          <h3 className={styles.subSectionTitle}>Acciones de Contacto</h3>
          {siteData.contactPage.actions.map((action, index) => (
            <div key={index} className={styles.dynamicItem}>
              <div className={styles.formGroup}>
                <label>Icono (SVG)</label>
                <input
                  type="file"
                  name={`iconFile-${index}`} // Unique name for each file input
                  accept=".svg"
                  onChange={(e) => handleIconFileChange(index, e)}
                  disabled={index < 4} // Disable file input for fixed icons
                  title={index < 4 ? 'Icono fijo para acciones básicas' : ''}
                />
                {action.iconUrl && (
                  <div className={styles.iconPreview}>
                    <img src={`/qr${action.iconUrl}`} alt="Icono actual" width={24} height={24} />
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
                  readOnly={index < 4 && action.text !== 'Guardar contacto'} // Make first 4 texts read-only unless it's the vCard button
                  title={index < 4 && action.text !== 'Guardar contacto' ? 'Texto fijo para acciones básicas' : ''}
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
                  title={action.text === 'Guardar contacto' ? 'El enlace se genera automáticamente para la vCard' : ''}
                />
              </div>
              {index >= 4 && ( // Only show remove button for actions beyond the first 4
                <button type="button" onClick={() => removeContactAction(index)} className={styles.removeButton}>
                  Eliminar Acción
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addContactAction} className={styles.addButton}>
            Añadir Acción de Contacto
          </button>
        </div>


        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Pantalla de Bienvenida (Splash Screen)</h2>
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
            <label htmlFor="splashVideoFile">Video de Fondo para Splash (Opcional)</label>
            <input
              type="file"
              id="splashVideoFile"
              name="splashVideoFile"
              accept="video/*"
              onChange={handleFileChange}
            />
            {siteData.splashScreen.videoUrl && <p>Video actual: {siteData.splashScreen.videoUrl}</p>}
          </div>
        </div>

        <button type="submit" className={styles.button}>Guardar Cambios</button>
      </form>
      {message && <p className={styles.successMessage}>{message}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}