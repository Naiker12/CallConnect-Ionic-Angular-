import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async uploadImage(file: File, path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('multimedia')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error subiendo imagen a Supabase:', error.message);
      throw error;
    }

    console.log('Imagen subida. Ruta:', data.path);
  
    const publicUrl = this.getImageUrl(data.path);
    console.log('URL pública:', publicUrl);

    return publicUrl;
  }

  getImageUrl(path: string): string {
    const { data } = this.supabase.storage
      .from('multimedia')
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}