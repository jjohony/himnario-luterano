import AsyncStorage from '@react-native-async-storage/async-storage';
import { Himno } from '../types/himno';

const HIMNOS_STORAGE_KEY = 'himnos_nuevos';

/**
 * Obtener todos los himnos nuevos del AsyncStorage
 */
export const getHimnosNuevos = async (): Promise<Himno[]> => {
  try {
    const data = await AsyncStorage.getItem(HIMNOS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener himnos:', error);
    return [];
  }
};

/**
 * Guardar un nuevo himno
 */
export const guardarHimnoNuevo = async (himno: Himno): Promise<boolean> => {
  try {
    const himnos = await getHimnosNuevos();
    himnos.push({
      ...himno,
      id: `nuevo_${Date.now()}`, // ID único basado en timestamp
      fechaCreacion: new Date().toISOString(),
    });
    await AsyncStorage.setItem(HIMNOS_STORAGE_KEY, JSON.stringify(himnos));
    return true;
  } catch (error) {
    console.error('Error al guardar himno:', error);
    return false;
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