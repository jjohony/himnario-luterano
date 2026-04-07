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
  Platform,
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

  

const abrirCamara = async () => {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitas permitir acceso a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    console.log('launchCamera result', result);
    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const imageUri = result.assets[0].uri;
    await procesarImagen(imageUri);
  } catch (error) {
    console.error('abrirCamara error', error);
    Alert.alert('Error', 'No se pudo abrir la cámara');
  }
};

const abrirGaleria = async () => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitas permitir acceso a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    console.log('launchImageLibrary result', result);
    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const imageUri = result.assets[0].uri;
    await procesarImagen(imageUri);
  } catch (error) {
    console.error('abrirGaleria error', error);
    Alert.alert('Error', 'No se pudo abrir la galería');
  }
};


  const procesarImagen = async (imageUri: string) => {
  setLoading(true);
  try {
    console.log('Procesando imagen:', imageUri);
    const resultado = await extractTextFromImage(imageUri);
    console.log('OCR resultado', resultado);

    if (resultado && resultado.success && resultado.text) {
      setEstrofas(resultado.text);
      setEscanedado(true);
      Alert.alert('Éxito', 'Texto extraído correctamente.');
    } else {
      const msg = resultado?.error || 'No se pudo extraer el texto';
      Alert.alert('Error', msg);
    }
  } catch (error) {
    console.error('procesarImagen error', error);
    Alert.alert('Error', 'Error al procesar la imagen');
  } finally {
    setLoading(false);
  }
};


  const guardarHimno = async () => {
    if (!titulo.trim() || !estrofas.trim()) {
      Alert.alert('Error', 'Título y Estrofas son obligatorios');
      return;
    }

    const nuevoHimno: Himno = {
      id: `nuevo_${Date.now()}`,
      titulo: titulo.trim(),
      estrofas: estrofas.split('\n\n').map(e => e.trim()).filter(e => e),
      coro: coro.trim() || undefined,
      escanedado,
      fechaCreacion: new Date().toISOString(),
    };

    setLoading(true);
    try {
      const guardado = await guardarHimnoNuevo(nuevoHimno);
      if (guardado) {
        Alert.alert('Éxito', 'Himno guardado');
        onHimnoGuardado(guardado); // ahora recibes el himno con id real
        limpiarFormulario();
        onClose();
      }

    } catch (error) {
      Alert.alert('Error', 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setTitulo('');
    setEstrofas('');
    setCoro('');
    setEscanedado(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar Himno</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.seccionTitulo}>Escanear desde foto</Text>
          <View style={styles.botonesEscaneo}>
            <TouchableOpacity style={styles.botonEscaneo} onPress={abrirCamara} disabled={loading}>
              <MaterialIcons name="camera-alt" size={24} color="#fff" />
              <Text style={styles.textoBoton}>Cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botonEscaneo} onPress={abrirGaleria} disabled={loading}>
              <MaterialIcons name="image" size={24} color="#fff" />
              <Text style={styles.textoBoton}>Galería</Text>
            </TouchableOpacity>
          </View>

          {escanedado && (
            <View style={styles.indicadorEscaneo}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.textoEscaneo}>Texto extraído con éxito</Text>
            </View>
          )}

          <Text style={styles.seccionTitulo}>Datos del Himno</Text>
          
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: POR TU SENDA MARCHARÉ"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>Estrofas *</Text>
          <TextInput
            style={[styles.input, styles.inputGrande]}
            placeholder="Separa estrofas con doble espacio"
            value={estrofas}
            onChangeText={setEstrofas}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>Coro (opcional)</Text>
          <TextInput
            style={[styles.input, styles.inputMedio]}
            placeholder="Texto del coro..."
            value={coro}
            onChangeText={setCoro}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.botonesBajo}>
            <TouchableOpacity style={[styles.botonAccion, styles.botonCancelar]} onPress={onClose}>
              <Text style={styles.textoBotonAccion}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.botonAccion, styles.botonGuardar]} onPress={guardarHimno} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBotonAccion}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { padding: 20 },
  seccionTitulo: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10, textTransform: 'uppercase' },
  botonesEscaneo: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  botonEscaneo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 10,
  },
  textoBoton: { color: '#fff', marginLeft: 8, fontWeight: 'bold' },
  indicadorEscaneo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', padding: 10, borderRadius: 8, marginBottom: 15 },
  textoEscaneo: { marginLeft: 8, color: '#2e7d32', fontSize: 13 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputGrande: { height: 150 },
  inputMedio: { height: 80 },
  botonesBajo: { flexDirection: 'row', gap: 10, marginTop: 30, marginBottom: 50 },
  botonAccion: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
  botonCancelar: { backgroundColor: '#f5f5f5' },
  botonGuardar: { backgroundColor: '#4CAF50' },
  textoBotonAccion: { fontWeight: 'bold', fontSize: 16, color: '#333' },
});