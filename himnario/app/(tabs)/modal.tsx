import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import data from '../../himnos.json'; // ✅ contiene { himnos: [...], canticos: [...] }
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors, Fonts, GlobalStyles } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../context/FavoritesContext';

export default function ModalScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const [fontSize, setFontSize] = useState(16);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // ✅ Buscar himno o cántico según el id
  const himno =
    data.himnos.find((h) => h.id === id) ||
    data.canticos?.find((c) => c.id === id);

  if (!himno) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.tint, fontFamily: Fonts.serif }]}>
          Himno/Cántico no encontrado
        </Text>
        <TouchableOpacity style={GlobalStyles.button(colors)} onPress={() => router.back()}>
          <Text style={GlobalStyles.buttonText(colors, Fonts.serif)}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/lutero-fondo.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        {/* Header fijo con título y controles */}
        <View style={styles.headerRow}>
          <Text style={[styles.header, { color: colors.tint, fontFamily: Fonts.serif }]}>
            {himno.id}. {himno.titulo}
          </Text>

          <View style={styles.controls}>
            <TouchableOpacity onPress={() => setFontSize((prev) => prev + 2)}>
              <Ionicons name="add-circle-outline" size={28} color={colors.tint} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSize((prev) => Math.max(12, prev - 2))}>
              <Ionicons name="remove-circle-outline" size={28} color={colors.tint} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                isFavorite(himno.id) ? removeFavorite(himno.id) : addFavorite(himno)
              }
            >
              <Ionicons
                name={isFavorite(himno.id) ? 'star' : 'star-outline'}
                size={28}
                color={colors.tint}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenido desplazable */}
        <ScrollView style={{ flex: 1 }}>
          {himno.estrofas?.map((estrofa, index) => (
            <View key={index} style={styles.estrofaBlock}>
              {estrofa.split(/\n/).map((linea, i) => (
                <Text
                  key={i}
                  style={[
                    styles.estrofaLine,
                    { color: colors.text, fontFamily: Fonts.sans, fontSize: fontSize },
                  ]}
                >
                  {linea.trim()}
                </Text>
              ))}
            </View>
          ))}

          {himno.coro && (
            <Text
              style={[
                styles.coro,
                { color: colors.icon, fontFamily: Fonts.rounded, fontSize: fontSize },
              ]}
            >
              Coro: {himno.coro}
            </Text>
          )}

          <TouchableOpacity style={GlobalStyles.button(colors)} onPress={() => router.back()}>
            <Text style={GlobalStyles.buttonText(colors, Fonts.serif)}>Volver</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, padding: 20 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  header: { fontSize: 22, fontWeight: 'bold' },
  controls: { flexDirection: 'row', gap: 12 },
  estrofaBlock: { marginBottom: 20 },
  estrofaLine: { lineHeight: 22, textAlign: 'left' },
  coro: { marginTop: 15, fontWeight: '600', fontStyle: 'italic' },
});
