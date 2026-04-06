import * as FileSystem from 'expo-file-system';
import axios from 'axios';

interface OCRResult {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Envía una imagen a EasyOCR API y extrae el texto
 * @param imageUri - URI local de la imagen (ej: file://...)
 * @returns Objeto con éxito y texto extraído
 */
export const extractTextFromImage = async (imageUri: string): Promise<OCRResult> => {
  try {
    // Convertir imagen a base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Enviar a EasyOCR API
    const response = await axios.post(
      'https://api.easyocr.org/ocr',
      { file: `data:image/jpeg;base64,${base64}` },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      }
    );

    // Extraer texto de la respuesta
    const extractedText = response.data?.words?.join(' ') || '';

    if (!extractedText) {
      return {
        success: false,
        text: '',
        error: 'No se pudo extraer texto de la imagen',
      };
    }

    return {
      success: true,
      text: extractedText,
    };
  } catch (error: any) {
    console.error('Error en OCR:', error);
    return {
      success: false,
      text: '',
      error: error.message || 'Error al procesar la imagen',
    };
  }
};