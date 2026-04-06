export interface Himno {
  id: string;
  titulo: string;
  estrofas: string[];
  coro?: string;
  fechaCreacion?: string; // NUEVO - ISO 8601 format
  escanedado?: boolean;   // NUEVO - indica si fue escaneado
  imagenOriginal?: string; // NUEVO - URL o ruta de imagen
}
