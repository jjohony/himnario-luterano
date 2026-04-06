import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Modal, Share, Alert, Platform } from 'react-native';
import Slider from '@react-native-community/slider'; 
import { useLocalSearchParams, useRouter } from 'expo-router';
import data from '../../himnos.json';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../context/FavoritesContext';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ LISTA DE FUENTES AMPLIADA Y CORREGIDA
const FONT_TYPES = [
    { id: 'sans-serif', name: 'Estándar', fontFamily: 'sans-serif' },
    { id: 'serif', name: 'Clásico Libro', fontFamily: 'serif' },
    { id: 'monospace', name: 'Máquina Escribir', fontFamily: 'monospace' },
    { id: 'sans-serif-medium', name: 'Moderno Bold', fontFamily: 'sans-serif-medium' },
    { id: 'sans-serif-light', name: 'Fino Elegante', fontFamily: 'sans-serif-light' },
    { id: 'sans-serif-condensed', name: 'Condensado', fontFamily: 'sans-serif-condensed' },
    { id: 'opendyslexic', name: 'Lectura Fácil', fontFamily: 'sans-serif' }, // Si no tienes la fuente instalada, usa sans-serif por defecto
];

const BACKGROUNDS = [
    { id: 'dark', name: 'Noche Profunda', overlay: 'rgba(0,0,0,0.92)', textColor: '#E0E0E0', isImage: false },
    { id: 'lutero', name: 'Lutero (Fondo)', overlay: 'rgba(0,0,0,0.65)', textColor: '#E0E0E0', image: require('../../assets/images/lutero-fondo.jpg'), isImage: true },
    { id: 'sepia', name: 'Papel Antiguo', overlay: 'rgba(50,30,10,0.88)', textColor: '#F5DEB3', isImage: false },
    { id: 'blue', name: 'Azul Noche', overlay: 'rgba(10,25,45,0.92)', textColor: '#E8F4F8', isImage: false },
];

// ✅ COMPONENTE: MENÚ DE OPCIONES (COMPARTIR)
const OptionsModal = ({ visible, onClose, onShare }) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.darkOptionsSheet}>
        <Text style={styles.darkModalTitle}>Opciones del Himno</Text>
        
        <TouchableOpacity style={styles.optionItem} onPress={() => { onShare(); onClose(); }}>
          <Ionicons name="share-social" size={24} color="#4db6ac" />
          <Text style={styles.optionText}>Compartir por WhatsApp / Redes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionItem, {marginTop: 15}]} onPress={onClose}>
          <Text style={{color: '#ff5252', fontWeight: 'bold', textAlign: 'center', width: '100%'}}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

// ✅ COMPONENTE: SELECTOR DE FONDO
const BackgroundSelector = ({ visible, onClose, onSelect, currentBackground }) => (
  <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.darkModalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.darkModalTitle}>Cambiar Fondo</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color="#4db6ac" /></TouchableOpacity>
        </View>
        <ScrollView style={{padding: 15}}>
          {BACKGROUNDS.map((bg) => (
            <TouchableOpacity
              key={bg.id}
              style={[styles.bgOption, currentBackground === bg.id && styles.bgOptionActive]}
              onPress={() => { onSelect(bg); onClose(); }}
            >
              <View style={[styles.bgPreview, { backgroundColor: bg.id === 'dark' ? '#000' : '#333' }]} />
              <Text style={styles.darkBgName}>{bg.name}</Text>
              {currentBackground === bg.id && <Ionicons name="checkmark-circle" size={24} color="#4db6ac" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// ✅ COMPONENTE: AJUSTES AVANZADOS
const SettingsModal = ({
  visible, onClose, fontSize, onFontSizeChange, lineHeight, onLineHeightChange,
  textAlignment, onTextAlignmentChange, fontType, onFontTypeChange, brightness, onBrightnessChange
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const selectedFont = FONT_TYPES.find((f) => f.id === fontType);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.darkSettingsModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.darkSettingsTitle}>Ajustes Visuales</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="chevron-down" size={30} color="#4db6ac" /></TouchableOpacity>
          </View>

          <View style={styles.darkTabsContainer}>
            {['basic', 'advanced'].map((tab) => (
              <TouchableOpacity key={tab} style={[styles.darkTab, activeTab === tab && styles.darkTabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.darkTabText, activeTab === tab && styles.darkTabTextActive]}>{tab === 'basic' ? 'LECTURA' : 'PANTALLA'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={{padding: 20}}>
            {activeTab === 'basic' ? (
              <>
                <Text style={styles.darkSectionLabel}>Tipo de Letra</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
                  {FONT_TYPES.map((f) => (
                    <TouchableOpacity key={f.id} style={[styles.darkFontBtn, fontType === f.id && styles.darkFontBtnActive]} onPress={() => onFontTypeChange(f.id)}>
                      <Text style={[styles.darkFontBtnText, { fontFamily: f.fontFamily }]}>{f.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.darkSectionLabel}>Tamaño: {fontSize}px</Text>
                <View style={styles.darkControlRow}>
                  <Slider 
                    style={{flex: 1, height: 40}} minimumValue={14} maximumValue={32} step={1}
                    value={fontSize} onValueChange={onFontSizeChange}
                    minimumTrackTintColor="#4db6ac" maximumTrackTintColor="#333" thumbTintColor="#4db6ac"
                  />
                </View>
              </>
            ) : (
              <View>
                <Text style={styles.darkSectionLabel}>Brillo de Lectura</Text>
                <Slider 
                  style={{width: '100%', height: 40}} minimumValue={0.3} maximumValue={1}
                  value={brightness} onValueChange={onBrightnessChange}
                  minimumTrackTintColor="#4db6ac" thumbTintColor="#4db6ac"
                />
              </View>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.darkConfirmBtn} onPress={onClose}><Text style={{color: 'white', fontWeight: 'bold'}}>LISTO</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function ModalScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [fontSize, setFontSize] = useState(18);
  const [currentBackground, setCurrentBackground] = useState('dark');
  const [lineHeight, setLineHeight] = useState(1.6);
  const [textAlignment, setTextAlignment] = useState('left');
  const [fontType, setFontType] = useState('sans-serif');
  const [brightness, setBrightness] = useState(1);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const himno = data.himnos.find((h) => h.id === id) || data.canticos?.find((c) => c.id === id);
  const bgConfig = BACKGROUNDS.find((bg) => bg.id === currentBackground) || BACKGROUNDS[0];
  const selectedFont = FONT_TYPES.find((f) => f.id === fontType);

  // ✅ FUNCIÓN COMPARTIR CORREGIDA (NATIVA)
  const handleShare = async () => {
    try {
      const content = `📖 *${himno.id}. ${himno.titulo}*\n\n${himno.estrofas.map((e, i) => `${i + 1}. ${e}`).join('\n\n')}\n\n${himno.coro ? `🎵 *CORO:*\n${himno.coro}` : ''}`;
      await Share.share({ message: content });
    } catch (error) {
      Alert.alert("Error", "No se pudo compartir.");
    }
  };

  if (!himno) return null;

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={bgConfig.isImage ? bgConfig.image : null} style={{flex: 1}}>
        <View style={[styles.darkOverlay, { backgroundColor: bgConfig.overlay, opacity: brightness }]} />
        <View style={{flex: 1}}>
          <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={styles.headerGradient}>
            <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={28} color="#4db6ac" /></TouchableOpacity>
            <Text style={[styles.header, { color: bgConfig.textColor, fontFamily: selectedFont?.fontFamily, fontSize: Math.min(fontSize, 20) }]}>{himno.id}. {himno.titulo}</Text>
          </LinearGradient>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{paddingTop: 10, paddingBottom: 120}}>
            {himno.estrofas?.map((e, i) => (
              <View key={i} style={styles.estrofaBlock}>
                <Text style={[styles.estrofaNumber, { color: '#4db6ac', fontSize: fontSize - 4 }]}>{i + 1}</Text>
                <Text style={[styles.estrofaLine, { color: bgConfig.textColor, fontFamily: selectedFont?.fontFamily, fontSize, lineHeight: fontSize * lineHeight, textAlign: textAlignment }]}>{e}</Text>
              </View>
            ))}
            {himno.coro && (
              <View style={styles.coroBlock}><Text style={[styles.coro, { color: bgConfig.textColor, fontFamily: selectedFont?.fontFamily, fontSize, textAlign: textAlignment }]}>{himno.coro}</Text></View>
            )}
          </ScrollView>

          <View style={styles.darkFloatingBar}>
            <TouchableOpacity onPress={() => setShowSettingsModal(true)}><Ionicons name="settings" size={24} color="white" /></TouchableOpacity>
            <TouchableOpacity onPress={() => setShowBackgroundSelector(true)}><Ionicons name="color-palette" size={24} color="white" /></TouchableOpacity>
            <TouchableOpacity onPress={() => isFavorite(himno.id) ? removeFavorite(himno.id) : addFavorite(himno)}><Ionicons name={isFavorite(himno.id) ? 'star' : 'star-outline'} size={24} color={isFavorite(himno.id) ? '#FFD700' : 'white'} /></TouchableOpacity>
            <TouchableOpacity onPress={() => setShowOptionsModal(true)}><Ionicons name="share-social" size={24} color="white" /></TouchableOpacity>
          </View>
        </View>

        <BackgroundSelector visible={showBackgroundSelector} onClose={() => setShowBackgroundSelector(false)} onSelect={(bg) => setCurrentBackground(bg.id)} currentBackground={currentBackground} />
        <SettingsModal visible={showSettingsModal} onClose={() => setShowSettingsModal(false)} fontSize={fontSize} onFontSizeChange={setFontSize} lineHeight={lineHeight} onLineHeightChange={setLineHeight} textAlignment={textAlignment} onTextAlignmentChange={setTextAlignment} fontType={fontType} onFontTypeChange={setFontType} brightness={brightness} onBrightnessChange={setBrightness} />
        <OptionsModal visible={showOptionsModal} onClose={() => setShowOptionsModal(false)} onShare={handleShare} />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  darkOverlay: { ...StyleSheet.absoluteFillObject },
  headerGradient: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  header: { fontWeight: 'bold', flex: 1 },
  estrofaBlock: { paddingHorizontal: 25, marginBottom: 25, flexDirection: 'row' },
  estrofaNumber: { fontWeight: 'bold', marginRight: 15, width: 25, marginTop: 5 },
  estrofaLine: { flex: 1 },
  coroBlock: { marginHorizontal: 25, padding: 20, backgroundColor: 'rgba(77,182,172,0.15)', borderRadius: 15, borderLeftWidth: 5, borderLeftColor: '#4db6ac' },
  coro: { fontStyle: 'italic', fontWeight: '600' },
  darkFloatingBar: { position: 'absolute', bottom: 30, left: 30, right: 30, backgroundColor: 'rgba(20,20,20,0.95)', flexDirection: 'row', justifyContent: 'space-around', padding: 15, borderRadius: 30, elevation: 10 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  darkModalContent: { backgroundColor: '#121212', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 20, maxHeight: '80%' },
  darkOptionsSheet: { backgroundColor: '#1A1A1A', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  darkModalTitle: { color: '#E0E0E0', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  optionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252525', padding: 18, borderRadius: 15, gap: 15 },
  optionText: { color: 'white', fontSize: 15 },
  
  darkSettingsModalContent: { backgroundColor: '#121212', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 20, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  darkSettingsTitle: { color: '#4db6ac', fontSize: 20, fontWeight: 'bold' },
  darkTabsContainer: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#333' },
  darkTab: { paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  darkTabActive: { borderBottomColor: '#4db6ac' },
  darkTabText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  darkTabTextActive: { color: '#4db6ac' },
  darkSectionLabel: { color: '#888', fontSize: 14, marginBottom: 15, fontWeight: 'bold', textTransform: 'uppercase' },
  darkFontBtn: { padding: 12, backgroundColor: '#252525', borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: '#333' },
  darkFontBtnActive: { backgroundColor: '#4db6ac', borderColor: '#4db6ac' },
  darkFontBtnText: { color: 'white' },
  darkControlRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  darkConfirmBtn: { backgroundColor: '#4db6ac', margin: 20, padding: 16, borderRadius: 15, alignItems: 'center' },
  
  bgOption: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10, borderRadius: 12, backgroundColor: '#1A1A1A' },
  bgOptionActive: { backgroundColor: '#222', borderWidth: 1, borderColor: '#4db6ac' },
  bgPreview: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
  darkBgName: { color: '#E0E0E0', flex: 1 }
});