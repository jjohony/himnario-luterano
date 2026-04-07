// services/himnasService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Himno } from '../types/himno';

const HIMNOS_STORAGE_KEY = 'himnos_nuevos';

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error('safeParse error', e);
    return fallback;
  }
};

const generateId = (): string => `nuevo_${Date.now()}`;

/**
 * Obtener todos los himnos nuevos del AsyncStorage
 */
export const getHimnosNuevos = async (): Promise<Himno[]> => {
  try {
    const data = await AsyncStorage.getItem(HIMNOS_STORAGE_KEY);
    return safeParse<Himno[]>(data, []);
  } catch (error) {
    console.error('Error al obtener himnos:', error);
    return [];
  }
};

/**
 * Obtener un himno por id
 */
export const obtenerHimnoPorId = async (id: string): Promise<Himno | undefined> => {
  try {
    const himnos = await getHimnosNuevos();
    return himnos.find(h => h.id === id);
  } catch (error) {
    console.error('Error al obtener himno por id:', error);
    return undefined;
  }
};

/**
 * Guardar un nuevo himno
 * Devuelve el himno guardado (con id y fechaCreacion)
 */
export const guardarHimnoNuevo = async (himno: Himno): Promise<Himno> => {
  try {
    const himnos = await getHimnosNuevos();

    // Normalizar estrofas si vienen como string
    let estrofasNormalizadas: string[] = [];
    if (Array.isArray(himno.estrofas)) {
      estrofasNormalizadas = himno.estrofas.map(s => (s || '').trim()).filter(Boolean);
    } else if (typeof himno.estrofas === 'string') {
      estrofasNormalizadas = himno.estrofas
        .replace(/\r/g, '')
        .split(/\n{1,2}/)
        .map(s => s.trim())
        .filter(Boolean);
    }

    const nuevo: Himno = {
      ...himno,
      id: himno.id && himno.id.trim() ? himno.id : generateId(),
      fechaCreacion: himno.fechaCreacion ? himno.fechaCreacion : new Date().toISOString(),
      estrofas: estrofasNormalizadas,
      coro: (himno.coro || '').trim(),
    };

    himnos.push(nuevo);
    await AsyncStorage.setItem(HIMNOS_STORAGE_KEY, JSON.stringify(himnos));
    console.log('Himno guardado', nuevo.id);
    return nuevo;
  } catch (error) {
    console.error('Error al guardar himno:', error);
    throw error;
  }
};

/**
 * Eliminar un himno nuevo por ID
 */
export const eliminarHimnoNuevo = async (id: string): Promise<boolean> => {
  try {
    const himnos = await getHimnosNuevos();
    const filtrados = himnos.filter((h) => h.id !== id);
    await AsyncStorage.setItem(HIMNOS_STORAGE_KEY, JSON.stringify(filtrados));
    console.log('Himno eliminado', id);
    return true;
  } catch (error) {
    console.error('Error al eliminar himno:', error);
    return false;
  }
};

/**
 * Exportar himnos nuevos a JSON (para guardar en archivo)
 */
export const exportarHimnosJSON = async (): Promise<string> => {
  try {
    const himnos = await getHimnosNuevos();
    return JSON.stringify({ himnos }, null, 2);
  } catch (error) {
    console.error('Error al exportar:', error);
    return '';
  }
};
