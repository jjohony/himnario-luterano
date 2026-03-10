import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import data from '../../himnos.json';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors, Fonts, GlobalStyles } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../context/FavoritesContext';

export default function IndexHimnosScreen() {
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // 👈 fuerza refresco
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const listRef = useRef(null);

  // 🔄 cada vez que vuelves a esta pantalla, reinicia búsqueda, scroll y refresco
  useFocusEffect(
    useCallback(() => {
      setQuery('');
      setRefreshKey((prev) => prev + 1); // 👈 cambia la key → fuerza render
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );


// 🔎 Filtro avanzado para himnos
const filteredHimnos = data.himnos.filter((h) => {
  if (!query.trim()) return true;

  const words = query.toLowerCase().trim().split(/\s+/);

  return words.every((word) =>
    h.id?.toString().toLowerCase().includes(word) ||
    h.titulo?.toLowerCase().includes(word) ||
    h.estrofas?.some((estrofa) => estrofa?.toLowerCase().includes(word)) ||
    h.coro?.toLowerCase().includes(word)
  );
});



  return (
    <ImageBackground
      source={require('../../assets/images/lutero-fondo.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <TextInput
          style={GlobalStyles.input(colors, Fonts.sans)}
          placeholder="Buscar himno..."
          placeholderTextColor={colors.icon}
          value={query}
          onChangeText={(text) => setQuery(text.trim())}
        />

        <FlatList
          ref={listRef}
          key={refreshKey} // 👈 fuerza que se reconstruya al volver
          data={filteredHimnos}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          extraData={query}
          initialScrollIndex={0}
          renderItem={({ item }) => (
            <View style={styles.himnoRow}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() =>
                  router.push({ pathname: '/modal', params: { id: item.id } })
                }
              >
                <Text
                  style={[
                    styles.titulo,
                    { color: colors.text, fontFamily: Fonts.serif },
                  ]}
                >
                  {item.id}. {item.titulo}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  isFavorite(item.id)
                    ? removeFavorite(item.id)
                    : addFavorite(item)
                }
              >
                <Ionicons
                  name={isFavorite(item.id) ? 'star' : 'star-outline'}
                  size={24}
                  color={colors.tint}
                />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}>
              ❌ No se encontraron himnos
            </Text>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  himnoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  titulo: { fontWeight: '600', fontSize: 18 },
});
