'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoSaveOptions {
  data: any;
  saveInterval?: number;
  onSave: (data: any) => Promise<void>;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveNow: () => Promise<void>;
  error: string | null;
}

export function useAutoSave({
  data,
  saveInterval = 30000, // 30 seconds
  onSave,
  enabled = true
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const savedDataRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if data has changed
  useEffect(() => {
    const currentData = JSON.stringify(data);
    const savedData = JSON.stringify(savedDataRef.current);
    setHasUnsavedChanges(currentData !== savedData);
  }, [data]);

  const saveNow = useCallback(async () => {
    if (!enabled || !hasUnsavedChanges || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(data);
      savedDataRef.current = JSON.parse(JSON.stringify(data));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [data, enabled, hasUnsavedChanges, isSaving, onSave]);

  // Auto-save timer
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return;

    timerRef.current = setTimeout(() => {
      saveNow();
    }, saveInterval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, saveInterval, enabled, hasUnsavedChanges, saveNow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Initialize saved data
  useEffect(() => {
    if (data && !savedDataRef.current) {
      savedDataRef.current = JSON.parse(JSON.stringify(data));
    }
  }, [data]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
    error
  };
}

// Validation utilities
export interface ValidationError {
  field: string;
  message: string;
}

export function validateSiteData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.metadata?.title?.trim()) {
    errors.push({ field: 'metadata.title', message: 'El título del sitio es requerido' });
  }

  if (!data.metadata?.description?.trim()) {
    errors.push({ field: 'metadata.description', message: 'La descripción del sitio es requerida' });
  }

  // Hero validation
  if (!data.hero?.title?.trim() && !data.hero?.subtitle?.trim()) {
    errors.push({ field: 'hero', message: 'El hero debe tener al menos un título o subtítulo' });
  }

  // Theme validation
  if (data.theme?.color1 && !/^#[0-9A-Fa-f]{6}$/.test(data.theme.color1)) {
    errors.push({ field: 'theme.color1', message: 'Color 1 debe ser un hex válido (ej: #FFFFFF)' });
  }

  if (data.theme?.color2 && !/^#[0-9A-Fa-f]{6}$/.test(data.theme.color2)) {
    errors.push({ field: 'theme.color2', message: 'Color 2 debe ser un hex válido (ej: #FFFFFF)' });
  }

  // Navigation validation
  if (!data.navigation || data.navigation.length === 0) {
    errors.push({ field: 'navigation', message: 'Al menos un elemento de navegación es requerido' });
  }

  // Contact actions validation
  data.contactPage?.actions?.forEach((action: any, index: number) => {
    if (action.link && !isValidUrl(action.link) && !action.link.startsWith('tel:') && !action.link.startsWith('mailto:') && !action.link.startsWith('http')) {
      errors.push({ field: `contactPage.actions[${index}].link`, message: `Enlace inválido en la acción ${index + 1}` });
    }
  });

  return errors;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Undo/Redo hook
export function useHistory<T>(initialValue: T, maxHistory: number = 20) {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const set = useCallback((newValue: T) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newValue);
      
      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      
      return newHistory;
    });
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    value: history[currentIndex],
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    historyPosition: currentIndex + 1,
    historySize: history.length
  };
}
