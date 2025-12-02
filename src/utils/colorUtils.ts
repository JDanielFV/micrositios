export function getContrastColor(hex1: string, hex2: string): string {
  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Helper to calculate relative luminance
  // Formula from WCAG 2.0
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return '#ffffff'; // Fallback

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  // Average luminance of the gradient
  const avgLum = (lum1 + lum2) / 2;

  // Threshold can be adjusted. 0.5 is standard middle gray.
  // If luminance is high (bright), return black text.
  // If luminance is low (dark), return white text.
  return avgLum > 0.5 ? '#000000' : '#ffffff';
}
