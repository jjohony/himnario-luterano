import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";   // 👈 importar router
import data from "../../himnos.json";

export default function Programar() {
  const [programaSeleccionado, setProgramaSeleccionado] = useState("Culto Dominical");
  const [liturgia, setLiturgia] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState<number | null>(null);

  const router = useRouter(); // 👈 inicializar router

  // Cargar programa guardado
  useEffect(() => {
    const cargarPrograma = async () => {
      const guardado = await AsyncStorage.getItem(`programa_${programaSeleccionado}`);
      if (guardado) {
        setLiturgia(JSON.parse(guardado));
      } else {
        setLiturgia([]);
      }
    };
    cargarPrograma();
  }, [programaSeleccionado]);

  // Guardar programa
  const guardarPrograma = async () => {
    await AsyncStorage.setItem(`programa_${programaSeleccionado}`, JSON.stringify(liturgia));
    alert("✅ Programa guardado en el dispositivo");
  };

  // Limpiar programa
  const limpiarPrograma = async () => {
    setLiturgia([]);
    await AsyncStorage.removeItem(`programa_${programaSeleccionado}`);
    alert("🧹 Programa limpiado, liturgia en blanco");
  };
// Buscar himnos/cánticos
const buscar = (texto: string) => {
  setBusqueda(texto);
  if (texto.trim() === "") {
    setResultados([]);
    return;
  }
  const query = texto.toLowerCase();

  const himnos = data.himnos.filter(
    (h) =>
      h.id?.toString().toLowerCase().includes(query) ||
      h.titulo?.toLowerCase().includes(query) ||
      h.estrofas?.some((e) => e?.toLowerCase().includes(query))
  );

  const canticos = data.canticos.filter(
    (c) =>
      c.id?.toString().toLowerCase().includes(query) ||
      c.titulo?.toLowerCase().includes(query) ||
      c.estrofas?.some((e) => e?.toLowerCase().includes(query))
  );

  setResultados([...himnos, ...canticos]);
};


  // Asignar himno/cántico (máximo 4)
  const asignarElemento = (item) => {
    if (campoSeleccionado !== null) {
      const nuevaLiturgia = [...liturgia];
      const campo = nuevaLiturgia[campoSeleccionado];

      if (campo.seleccionados.length < 4) {
        campo.seleccionados.push({ id: item.id, titulo: item.titulo });
        setLiturgia(nuevaLiturgia);
      }
      setBusqueda("");
      setResultados([]);
      setCampoSeleccionado(null);
    }
  };

  // Eliminar himno
  const eliminarElemento = (campoIndex, himnoIndex) => {
    const nuevaLiturgia = [...liturgia];
    nuevaLiturgia[campoIndex].seleccionados.splice(himnoIndex, 1);
    setLiturgia(nuevaLiturgia);
  };

  // Agregar campo
  const agregarCampo = () => {
    const nuevaLiturgia = [...liturgia, { nombreCampo: "Nuevo Campo", seleccionados: [] }];
    setLiturgia(nuevaLiturgia);
  };

  // Eliminar campo
  const eliminarCampo = (index) => {
    const nuevaLiturgia = [...liturgia];
    nuevaLiturgia.splice(index, 1);
    setLiturgia(nuevaLiturgia);
  };

  // Renombrar campo
  const renombrarCampo = (index, nuevoNombre) => {
    const nuevaLiturgia = [...liturgia];
    nuevaLiturgia[index].nombreCampo = nuevoNombre;
    setLiturgia(nuevaLiturgia);
  };

  // 👇 función para abrir modal con himno

const abrirModal = (id) => {
  router.push({ pathname: "/modal", params: { id } });
};

 


  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>📖 Programar Liturgia</Text>

      {/* Selector de tipo de programa */}
      <View style={styles.selector}>
        {["Culto Dominical", "Culto de Jóvenes", "Culto de Vigilia"].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.button,
              programaSeleccionado === tipo && { backgroundColor: "#4CAF50" },
            ]}
            onPress={() => setProgramaSeleccionado(tipo)}
          >
            <Text style={styles.buttonText}>{tipo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista editable de liturgia */}
      <FlatList
        data={liturgia}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            {/* Nombre editable del campo */}
            <TextInput
              style={styles.campoNombre}
              value={item.nombreCampo}
              onChangeText={(texto) => renombrarCampo(index, texto)}
            />

            {/* Himnos seleccionados */}
            {item.seleccionados.length === 0 ? (
              <Text style={styles.titulo}>[Sin himnos]</Text>
            ) : (
              item.seleccionados.map((h, i) => (
                <View key={i} style={styles.himnoRow}>
                  {/* 👇 al tocar el himno, abrir modal */}
                  <TouchableOpacity onPress={() => abrirModal(h.id)} style={{ flex: 1 }}>
                    <Text style={styles.titulo}>
                      {h.titulo} (ID: {h.id})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => eliminarElemento(index, i)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Buscador en la misma fila */}
            {campoSeleccionado === index && (
              <View style={styles.searchInline}>
                <TextInput
                  style={styles.input}
                  placeholder="Buscar ID, nombre o palabra..."
                  value={busqueda}
                  onChangeText={buscar}
                  autoFocus={true}
                  editable={true}
                />

                {/* Botón cancelar búsqueda */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setCampoSeleccionado(null);
                    setBusqueda("");
                    setResultados([]);
                  }}
                >
                  <Ionicons name="close-outline" size={20} color="red" />
                  <Text style={{ color: "red", marginLeft: 5 }}>Cancelar</Text>
                </TouchableOpacity>

                <FlatList
                  data={resultados}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.resultCard}
                      onPress={() => asignarElemento(item)}
                    >
                      <Ionicons name="musical-notes-outline" size={20} color="#333" />
                      <Text style={styles.resultText}>
                        {item.id} - {item.titulo}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Botón lupa */}
            <TouchableOpacity onPress={() => setCampoSeleccionado(index)}>
              <Ionicons name="search-outline" size={20} color="blue" />
            </TouchableOpacity>

            {/* Botón eliminar campo */}
            <TouchableOpacity onPress={() => eliminarCampo(index)}>
              <Ionicons name="close-circle-outline" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Botón añadir campo */}
      <TouchableOpacity style={styles.addButton} onPress={agregarCampo}>
        <Ionicons name="add-circle-outline" size={24} color="white" />
        <Text style={styles.addText}>Añadir Campo</Text>
      </TouchableOpacity>

      {/* Botones guardar y limpiar */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
        <TouchableOpacity style={styles.saveButton} onPress={guardarPrograma}>
          <Ionicons name="save-outline" size={24} color="white" />
          <Text style={styles.saveText}>Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={limpiarPrograma}>
          <Ionicons name="trash-outline" size={24} color="white" />
          <Text style={styles.clearText}>Limpiar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  selector: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  button: { padding: 10, borderRadius: 8, backgroundColor: "#ccc" },
  buttonText: { color: "white", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  campoNombre: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    elevation: 2,
  },
  orden: { fontWeight: "600", marginBottom: 5 },
  titulo: { flex: 1, marginLeft: 10 },
  himnoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  searchInline: { marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "white",
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  resultText: { marginLeft: 10, fontSize: 14 },
    saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,   // corregido
    justifyContent: "center",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 10,   // corregido
    justifyContent: "center",
  },
  saveText: { color: "white", fontSize: 18, fontWeight: "600", marginLeft: 8 },
  clearText: { color: "white", fontSize: 18, fontWeight: "600", marginLeft: 8 },
});
