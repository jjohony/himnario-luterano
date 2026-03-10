import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors, Fonts } from '../../constants/theme';
import { useFavorites } from '../../context/FavoritesContext';
import { useRouter } from 'expo-router';

export default function FavoritosScreen() {
  const { favorites, removeFavorite } = useFavorites();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.tint, fontFamily: Fonts.serif }]}>
        Himnos Favoritos
      </Text>

      {favorites.length === 0 ? (
        <Text style={{ color: colors.text, fontFamily: Fonts.sans, marginTop: 20 }}>
          No tienes himnos favoritos aún.
        </Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
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
              <TouchableOpacity onPress={() => removeFavorite(item.id)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  titulo: { fontSize: 18 },
});
