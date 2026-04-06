import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import UpdateCheck from "../../components/UpdateCheck";

export default function App() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#e6f4fe", "#ffffff"]} style={styles.container}>
      {/* Verificación de actualización */}
      <UpdateCheck />

      {/* Logo */}
      <Image
        source={require("../../assets/images/splash-icon.png")}
        style={styles.logo}
      />

      {/* Título */}
      <Text style={styles.titulo}>Himnario Luterano</Text>
      <Text style={styles.subtitulo}>Una herramienta para las hermanas y hermanos luteranos</Text>

      {/* Texto introductorio */}
      <Text style={styles.texto}>
        Bienvenido al Himnario Luterano. Aquí encontrarás credos, himnos y liturgias
        que acompañan la vida espiritual de la comunidad.
      </Text>

      {/* Botones elegantes */}
      <View style={styles.botones}>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push("/indexHimnos")}
        >
          <Text style={styles.botonTexto}>Explorar Himnos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push("/credo")}
        >
          <Text style={styles.botonTexto}>Ver Credos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push("/Programar")}
        >
          <Text style={styles.botonTexto}>Liturgia</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
    elevation: 5,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#7f8c8d",
    marginBottom: 20,
  },
  texto: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    color: "#34495e",
    marginBottom: 30,
  },
  botones: {
    flexDirection: "column",
    gap: 15,
    width: "100%",
    alignItems: "center",
  },
  boton: {
    backgroundColor: "#2c3e50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    width: "80%",
    alignItems: "center",
  },
  botonTexto: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
