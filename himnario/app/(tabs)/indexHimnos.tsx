import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import data from '../../himnos.json';
import { useFavorites } from '../../context/FavoritesContext';

export default function IndexHimnosScreen() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites() || {};
  const listRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setQuery('');
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [])
  );

  const filteredHimnos = useMemo(() => {
    const himnos = data.himnos || [];
    if (!query.trim()) return himnos;
    const words = query.toLowerCase().trim().split(/\s+/);
    return himnos.filter((h) =>
      words.every((word) =>
        h.id?.toString().toLowerCase().includes(word) ||
        h.titulo?.toLowerCase().includes(word)
      )
    );
  }, [query]);

  return (
    <LinearGradient colors={['#141E30', '#243B55']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Solo Himnos</Text>
        <Text style={styles.headerSubtitle}>{filteredHimnos.length} Himnos para cantar</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="filter" size={20} color="#4db6ac" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busca en el himnario..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        ref={listRef}
        data={filteredHimnos}
        // ✅ CORRECCIÓN DE ERROR toString():
        keyExtractor={(item, index) => (item && item.id ? item.id.toString() : `h-${index}`)}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => {
          const favorited = isFavorite ? isFavorite(item.id) : false;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/modal', params: { id: item.id } })}
              style={styles.card}
            >
              <View style={[styles.idBadge, { backgroundColor: '#4db6ac30' }]}><Text style={styles.idText}>{item.id}</Text></View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.titulo}>{item.titulo}</Text>
              </View>
              <TouchableOpacity onPress={() => favorited ? removeFavorite(item.id) : addFavorite(item)} style={{ padding: 5 }}>
                <Ionicons name={favorited ? 'star' : 'star-outline'} size={24} color={favorited ? '#FFD700' : '#4db6ac'} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </LinearGradient>
  );
}

// ✅ ESTILOS COMPARTIDOS PARA AMBOS (Sophisticated Design)
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 15 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#E0E0E0' },
  headerSubtitle: { fontSize: 13, color: '#4db6ac', marginTop: 2, fontWeight: '500' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff08',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#ffffff15',
    marginBottom: 10,
  },
  searchInput: { flex: 1, color: 'white', fontSize: 15 },
  listPadding: { paddingHorizontal: 20, paddingBottom: 50 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  idBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff10',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4db6ac40',
  },
  idText: { color: '#4db6ac', fontWeight: 'bold', fontSize: 14 },
  typeLabel: { fontSize: 9, fontWeight: 'bold', color: '#888', marginBottom: 2 },
  titulo: { fontSize: 16, fontWeight: '600', color: '#E0E0E0' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50, fontSize: 16 }
});