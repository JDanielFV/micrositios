import { siteQueries } from '@/lib/db';
import ThemeInjector from './ThemeInjector';
import Header from '../../components/Header/Header';
import SplashScreen from '../../components/SplashScreen/SplashScreen';
import { getContrastColor } from '../../utils/colorUtils';

export default async function SiteLayout({ children, params }: { children: React.ReactNode, params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await siteQueries.getBySlug(slug);

  if (!site) {
    return <>{children}</>; // Or a specific not-found layout
  }

  // ... (existing imports)

  // ... (inside SiteLayout)
  const theme = site.data.theme || {};
  const { color1, color2, angle, fontImportUrl, fontFamily } = theme;
  const splashScreenEnabled = site.data.splashScreen?.enabled || false;
  const splashScreenVideoUrl = site.data.splashScreen?.videoUrl;

  const textColor = getContrastColor(color1 || '#ffffff', color2 || '#f0f0f0');
  const buttonTextColor = textColor === '#ffffff' ? '#000000' : '#ffffff';

  const dynamicStyles = `
    ${fontImportUrl ? `@import url('${fontImportUrl}');` : ''}
    body {
      background: linear-gradient(${angle}deg, ${color1}, ${color2});
      font-family: ${fontFamily || 'sans-serif'};
      --text-color: ${textColor};
      --button-text-color: ${buttonTextColor};
    }
  `;

  const navLinks = (site.data.navigation as any[]).map((item: { text: string, link: string }) => ({
    text: item.text,
    link: `/${site.slug}${item.link}`
  }));

  return (
    <>
      <ThemeInjector styles={dynamicStyles} />
      <SplashScreen enabled={splashScreenEnabled} videoUrl={splashScreenVideoUrl} />
      <Header links={navLinks} />
      {children}
    </>
  );
}