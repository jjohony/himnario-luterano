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
import { useFocusEffect } from '@react-navigation/native'; // 👈 para resetear al volver
import data from '../../himnos.json'; // 👈 Importa el archivo único
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors, Fonts, GlobalStyles } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../context/FavoritesContext';

export default function IndexCanticosScreen() {
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // 👈 fuerza refresco
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const listRef = useRef(null);

  // 🔄 cada vez que vuelves a esta pantalla, reinicia búsqueda y scroll
  useFocusEffect(
    useCallback(() => {
      setQuery('');
      setRefreshKey((prev) => prev + 1); // 👈 fuerza reconstrucción del FlatList
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );

  // 🔎 Filtro avanzado para cánticos
  const filteredCanticos = data.canticos.filter((c) => {
    if (!query.trim()) return true;

    const words = query.toLowerCase().trim().split(/\s+/);

    return words.every((word) =>
      c.id?.toString().toLowerCase().includes(word) ||
      c.titulo?.toLowerCase().includes(word) ||
      c.estrofas?.some((estrofa) => estrofa?.toLowerCase().includes(word)) ||
      (c.coro && c.coro.toLowerCase().includes(word))
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
          placeholder="Buscar cántico..."
          placeholderTextColor={colors.icon}
          value={query} // 👈 vinculado al estado
          onChangeText={(text) => setQuery(text.trim())}
        />

        <FlatList
          ref={listRef}
          key={refreshKey} // 👈 fuerza reconstrucción al volver
          data={filteredCanticos}
          keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
          initialScrollIndex={0}
          renderItem={({ item }) => (
            <View style={styles.canticoRow}>
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
              ❌ No se encontraron cánticos
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
  canticoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  titulo: { fontWeight: '600', fontSize: 18 },
});
