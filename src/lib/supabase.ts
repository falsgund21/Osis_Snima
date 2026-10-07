import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dtwrkjevzrhzkpnhwopz.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0d3JramV2enJoemtwbmh3b3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNjM4NzksImV4cCI6MjEwNjczOTg3OX0.5IQfeC5czDDMZJOMTaG_heHJ1mQ7E6q-9odm0UZlF6s';

/**
 * Modular Supabase Client Instance
 * Configured for client-side authentication and real-time operations
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper to convert and compress File to lightweight base64 Data URL
 * Automatically downscales large camera/phone photos to max 800px to prevent
 * localStorage QuotaExceededError and database payload limits.
 */
export function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    // Jika bukan gambar, fallback ke standard reader
    if (!file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Hasilkan JPEG yang sangat ringkas (~60-120KB)
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Modular Supabase Storage Utility
 * Uploads assets to 'eosis_assets' bucket with automatic lightweight Base64 fallback.
 */
export async function uploadAsset(file: File, folder = 'uploads'): Promise<string> {
  // Selalu kompres gambar terlebih dahulu agar ringkas dan tidak memakan kuota
  const compressedDataUrl = await compressImage(file, 800, 800, 0.82);

  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanFolder = folder.replace(/\/+$/, '');
  const fileName = `${cleanFolder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  try {
    const { data, error } = await supabase.storage
      .from('eosis_assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase Storage notice, using compressed image fallback:', error.message);
      return compressedDataUrl;
    }

    const { data: publicData } = supabase.storage
      .from('eosis_assets')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (err) {
    console.warn('Storage fallback to compressed Data URL', err);
    return compressedDataUrl;
  }
}

/**
 * Helper to convert File to base64 Data URL (compressed)
 */
export function fileToBase64(file: File): Promise<string> {
  return compressImage(file);
}

export default supabase;
