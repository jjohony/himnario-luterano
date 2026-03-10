import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // 👈 para resetear al volver
import data from '../../himnos.json';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors, Fonts, GlobalStyles } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../context/FavoritesContext';

export default function HomeScreen() {
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

  // 👇 Combina himnos y cánticos
  const allItems = [...data.himnos, ...data.canticos];

  // 🔎 Filtro avanzado para múltiples palabras
  const filteredItems = allItems.filter((h) => {
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={GlobalStyles.input(colors, Fonts.sans)}
        placeholder="Buscar himno o cántico..."
        placeholderTextColor={colors.icon}
        value={query} // 👈 vinculado al estado
        onChangeText={(text) => setQuery(text.trim())}
      />

      <FlatList
        ref={listRef}
        key={refreshKey} // 👈 fuerza reconstrucción al volver
        data={filteredItems}
        keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
        initialScrollIndex={0}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => router.push({ pathname: '/modal', params: { id: item.id } })}
            >
              <Text style={[styles.titulo, { color: colors.text, fontFamily: Fonts.serif }]}>
                {item.id}. {item.titulo}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                isFavorite(item.id) ? removeFavorite(item.id) : addFavorite(item)
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
            ❌ No se encontraron himnos o cánticos
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  titulo: { fontWeight: '600', fontSize: 18 },
});
