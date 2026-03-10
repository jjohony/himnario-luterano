import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "../../hooks/use-color-scheme";
import { Colors } from "../../constants/theme";
import { FavoritesProvider } from "../../context/FavoritesContext";

export default function Layout() {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? Colors.dark : Colors.light;

  return (
    <FavoritesProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          tabBarStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Todos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="indexHimnos"
          options={{
            title: "Himnos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="musical-notes-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="indexCanticos"
          options={{
            title: "Cánticos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="mic-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favoritos"
          options={{
            title: "Favoritos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="star-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="credo"
          options={{
            title: "Credo",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        />
        {/* Nueva pestaña visible llamada Programar */}
        <Tabs.Screen
          name="Programar"
          options={{
            title: "Programar",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        {/* Pantallas internas ocultas */}
        <Tabs.Screen name="Liturgia" options={{ href: null }} />
        <Tabs.Screen name="Detalle" options={{ href: null }} />
        <Tabs.Screen name="Editor" options={{ href: null }} />
        <Tabs.Screen name="modal" options={{ href: null }} />
      </Tabs>
    </FavoritesProvider>
  );
}
