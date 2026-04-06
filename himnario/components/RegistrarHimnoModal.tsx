import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { extractTextFromImage } from '../services/ocrService';
import { guardarHimnoNuevo } from '../services/himnasService';
import { Himno } from '../types/himno';

interface RegistrarHimnoModalProps {
  visible: boolean;
  onClose: () => void;
  onHimnoGuardado: (himno: Himno) => void;
}

export const RegistrarHimnoModal: React.FC<RegistrarHimnoModalProps> = ({
  visible,
  onClose,
  onHimnoGuardado,
}) => {
  const [titulo, setTitulo] = useState('');
  const [estrofas, setEstrofas] = useState('');
  const [coro, setCoro] = useState('');
  const [loading, setLoading] = useState(false);
  const [escanedado, setEscanedado] = useState(false);

  /**
   * Abrir cámara para escanear
   */
  const abrirCamara = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso denegado', 'Necesitas permitir acceso a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;
      await procesarImagen(imageUri);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  /**
   * Abrir galería para seleccionar imagen
   */
  const abrirGaleria = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso denegado', 'Necesitas permitir acceso a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;
      await procesarImagen(imageUri);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  /**
   * Procesar imagen con OCR
   */
  const procesarImagen = async (imageUri: string) => {
    setLoading(true);
    try {
      const resultado = await extractTextFromImage(imageUri);

      if (resultado.success) {
        setEstrofas(resultado.text);
        setEscanedado(true);
        Alert.alert('Éxito', 'Texto extraído. Revisa y edita si es necesario.');
      } else {
        Alert.alert('Error', resultado.error || 'No se pudo extraer el texto');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al procesar la imagen');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guardar himno
   */
  const guardarHimno = async () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    if (!estrofas.trim()) {
      Alert.alert('Error', 'Al menos una estrofa es requerida');
      return;
    }

    const nuevoHimno: Himno = {
      id: `nuevo_${Date.now()}`,
      titulo: titulo.trim(),
      estrofas: estrofas
        .split('\n\n')
        .map((e) => e.trim())
        .filter((e) => e),
      coro: coro.trim() || undefined,
      escanedado,
      fechaCreacion: new Date().toISOString(),
    };

    setLoading(true);
    try {
      const guardado = await guardarHimnoNuevo(nuevoHimno);

      if (guardado) {
        Alert.alert('Éxito', 'Himno guardado correctamente');
        onHimnoGuardado(nuevoHimno);
        limpiarFormulario();
        onClose();
      } else {
        Alert.alert('Error', 'No se pudo guardar el himno');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar formulario
   */
  const limpiarFormulario = () => {
    setTitulo('');
    setEstrofas('');
    setCoro('');
    setEscanedado(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar Himno</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Botones de escaneo */}
          <Text style={styles.seccionTitulo}>Escanear desde foto</Text>
          <View style={styles.botonesEscaneo}>
            <TouchableOpacity
              style={styles.botonEscaneo}
              onPress={abrirCamara}
              disabled={loading}
            >
              <MaterialIcons name="camera-alt" size={24} color="#fff" />
              <Text style={styles.textoBoton}>Cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonEscaneo}
              onPress={abrirGaleria}
              disabled={loading}
            >
              <MaterialIcons name="image" size={24} color="#fff" />
              <Text style={styles.textoBoton}>Galería</Text>
            </TouchableOpacity>
          </View>

          {/* Indicador de escaneo */}
          {escanedado && (
            <View style={styles.indicadorEscaneo}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.textoEscaneo}>Texto extraído del escaneo</Text>
            </View>
          )}

          {/* Formulario */}
          <Text style={styles.seccionTitulo}>Datos del Himno</Text>

          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: PORTU SENDA MARCHARÉ"
            value={titulo}
            onChangeText={setTitulo}
            editable={!loading}
          />

          <Text style={styles.label}>Estrofas *</Text>
          <TextInput
            style={[styles.input, styles.inputGrande]}
            placeholder="Separa cada estrofa con una línea en blanco"
            value={estrofas}
            onChangeText={setEstrofas}
            multiline
            numberOfLines={8}
            editable={!loading}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Coro (opcional)</Text>
          <TextInput
            style={[styles.input, styles.inputMedio]}
            placeholder="Texto del coro"
            value={coro}
            onChangeText={setCoro}
            multiline
            numberOfLines={4}
            editable={!loading}
            textAlignVertical="top"
          />

          {/* Botones de acción */}
          <View style={styles.botonesBajo}>
            <TouchableOpacity
              style={[styles.botonAccion, styles.botonCancelar]}
              onPress={() => {
                limpiarFormulario();
                onClose();
              }}
              disabled={loading}
            >
              <Text style={styles.textoBotonAccion}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bo*
