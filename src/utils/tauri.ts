/**
 * Tauri Utilities
 * 
 * Helpers to communicate with the Rust backend when running as a desktop app.
 */

// Check if running in Tauri environment
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;
};

/**
 * Dynamic Invoke
 * Only attempts to call Rust commands if in Tauri environment.
 */
export async function tauriInvoke<T>(command: string, args: any = {}): Promise<T | null> {
  if (!isTauri()) return null;
  
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(command, args);
  } catch (error) {
    console.error(`Tauri invoke error [${command}]:`, error);
    throw error;
  }
}

/**
 * Open Directory Picker
 */
export async function selectDirectory(): Promise<string | null> {
  if (!isTauri()) return null;
  
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Seleccionar carpeta de destino'
    });
    return selected as string;
  } catch (error) {
    console.error('Directory selection error:', error);
    return null;
  }
}
