import db from '../../../db.json';
import ThemeInjector from './ThemeInjector';
import Header from '../../components/Header/Header';
import SplashScreen from '../../components/SplashScreen/SplashScreen';

async function getSite(slug: string) {
  const site = db.sites.find((site) => site.slug === slug);
  return site;
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode, params: { slug: string } }) {
  const site = await getSite(params.slug);

  if (!site) {
    return <>{children}</>; // Or a specific not-found layout
  }

  const theme = site.data.theme || {};
  const { color1, color2, angle, fontImportUrl, fontFamily } = theme;
  const splashScreenEnabled = site.data.splashScreen?.enabled || false;
  const splashScreenVideoUrl = site.data.splashScreen?.videoUrl;

  const dynamicStyles = `
    ${fontImportUrl ? `@import url('${fontImportUrl}');` : ''}
    body {
      background: linear-gradient(${angle}deg, ${color1}, ${color2});
      font-family: ${fontFamily || 'sans-serif'};
    }
  `;

  const navLinks = site.data.navigation.map(item => ({
    text: item.text,
    link: `/${site.slug}${item.link}`
  }));

  return (
    <html lang="es">
      <head>
        <ThemeInjector styles={dynamicStyles} />
      </head>
      <body>
        <SplashScreen enabled={splashScreenEnabled} videoUrl={splashScreenVideoUrl}>
          <Header links={navLinks} />
          {children}
        </SplashScreen>
      </body>
    </html>
  );
}