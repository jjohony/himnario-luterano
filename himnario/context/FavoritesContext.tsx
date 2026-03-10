import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import Storage from './Storage'; // wrapper para AsyncStorage

type Hymn = {
  id: string;
  titulo: string;
  estrofas: string[];
  coro?: string;
};

type FavoritesContextType = {
  favorites: Hymn[];
  addFavorite: (hymn: Hymn) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState(true);

  // cargar favoritos al inicio (no bloquea el render)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await Storage.getItem('favorites');
        if (saved && mounted) {
          setFavorites(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error cargando favoritos:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // guardar favoritos cada vez que cambian (con debounce)
  useEffect(() => {
    if (loading) return; // evita guardar mientras se está cargando
    const timeout = setTimeout(() => {
      (async () => {
        try {
          await Storage.setItem('favorites', JSON.stringify(favorites));
        } catch (error) {
          console.error('Error guardando favoritos:', error);
        }
      })();
    }, 300);
    return () => clearTimeout(timeout);
  }, [favorites, loading]);

  const addFavorite = (hymn: Hymn) => {
    setFavorites((prev) =>
      prev.find((f) => f.id === hymn.id) ? prev : [...prev, hymn]
    );
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  }
  return context;
};
0