import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import data from '../../himnos.json';
import { useFavorites } from '../../context/FavoritesContext';
import { RegistrarHimnoModal } from '../../components/RegistrarHimnoModal';
import { getHimnosNuevos } from '../../services/himnasService';
import { Himno } from '../../types/himno';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [himnosNuevos, setHimnosNuevos] = useState<Himno[]>([]);
  const router = useRouter();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites() || {};
  const listRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setQuery('');
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
      
      // ✅ NUEVO: Cargar himnos nuevos del AsyncStorage
      const cargarHimnosNuevos = async () => {
        const nuevosList = await getHimnosNuevos();
        setHimnosNuevos(nuevosList);
      };
      cargarHimnosNuevos();
    }, [])
  );

  const allItems = useMemo(() => {
    const h = (data.himnos || []).map(item => ({ ...item, type: 'Himno' }));
    const c = (data.canticos || []).map(item => ({ ...item, type: 'Cántico' }));
    // ✅ NUEVO: Agregar himnos nuevos
    const nuevos = himnosNuevos.map(item => ({ ...item, type: 'Himno Nuevo' }));
    return [...h, ...c, ...nuevos];
  }, [himnosNuevos]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const words = query.toLowerCase().trim().split(/\s+/);
    return allItems.filter((h) =>
      words.every((word) =>
        h.id?.toString().toLowerCase().includes(word) ||
        h.titulo?.toLowerCase().includes(word)
      )
    );
  }, [query, allItems]);

  return (
    <LinearGradient colors={['#0F2027', '#203A43']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Himnario Digital</Text>
        <Text style={styles.headerSubtitle}>{filteredItems.length} Alabanzas disponibles</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#4db6ac" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busca por número o título..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        ref={listRef}
        data={filteredItems}
        keyExtractor={(item, index) => (item && item.id ? item.id.toString() : `item-${index}`)}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => {
          const favorited = isFavorite ? isFavorite(item.id) : false;
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/modal', params: { id: item.id } })}
              style={styles.card}
            >
              <View style={styles.idBadge}><Text style={styles.idText}>{item.id}</Text></View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.typeLabel}>{item.type.toUpperCase()}</Text>
                <Text style={styles.titulo} numberOfLines={1}>{item.titulo}</Text>
              </View>
              <TouchableOpacity onPress={() => favorited ? removeFavorite(item.id) : addFavorite(item)} style={{ padding: 10 }}>
                <Ionicons name={favorited ? 'star' : 'star-outline'} size={24} color={favorited ? '#FFD700' : '#4db6ac'} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron resultados</Text>}
      />

      {/* ✅ NUEVO: Botón flotante FAB para registrar himnos */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ✅ NUEVO: Modal de registro */}
      <RegistrarHimnoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onHimnoGuardado={(himno) => {
          setHimnosNuevos([...himnosNuevos, himno]);
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E0E0',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4db6ac',
    marginTop: 4,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff08',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#ffffff15',
    marginBottom: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffffff08',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
      android: { elevation: 3 },
    }),
  },
  idBadge: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#4db6ac20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4db6ac40',
  },
  idText: {
    color: '#4db6ac',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 2,
    letterSpacing: 1,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  favBtn: {
    padding: 10,
    marginRight: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#666',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});