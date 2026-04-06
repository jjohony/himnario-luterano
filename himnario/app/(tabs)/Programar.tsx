import React, { useState, useEffect } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import data from "../../himnos.json";

const MOMENTOS_PLANTILLA = [
  { nombreCampo: "ENTRADA", seleccionados: [] },
  { nombreCampo: "CONFESION DE PECADOS", seleccionados: [] },
  { nombreCampo: "LA PRIMERA LECTURA", seleccionados: [] },
  { nombreCampo: "EL SALMO DEL DÍA", seleccionados: [] },
  { nombreCampo: "LA SEGUNDA LECTURA", seleccionados: [] },
  { nombreCampo: "TERCERA LECTURA (EL EVANGELIO)", seleccionados: [] },
  { nombreCampo: "EL CREDO", seleccionados: [] },
  { nombreCampo: "EL OFERTORIO", seleccionados: [] },
  { nombreCampo: "ANUNCIOS Y BIENVENIDAS", seleccionados: [] },
  { nombreCampo: "EL SACRAMENTO", seleccionados: [] },
  { nombreCampo: "LA BENDICIÓN FINAL", seleccionados: [] },
];

const CustomAlert = ({ visible, title, message, buttons, onDismiss }) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
    <View style={styles.modalOverlay}>
      <View style={styles.alertContainer}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        <View style={styles.alertButtonRow}>
          {buttons.map((btn, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.alertBtn,
                btn.style === "destructive" && styles.alertBtnDangerous,
              ]}
              onPress={() => {
                btn.onPress();
                onDismiss();
              }}
            >
              <Text style={styles.alertBtnText}>{btn.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  </Modal>
);

const SuccessAlert = ({ visible, message, onDismiss }) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
    <View style={styles.modalOverlay}>
      <View style={styles.alertContainer}>
        <Text style={styles.alertTitle}>✅ Éxito</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        <TouchableOpacity style={styles.alertBtn} onPress={onDismiss}>
          <Text style={styles.alertBtnText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function Programar() {
  const [cultos, setCultos] = useState<string[]>(["Culto Dominical", "Culto de Jóvenes"]);
  const [programaSeleccionado, setProgramaSeleccionado] = useState<string>("Culto Dominical");
  const [liturgia, setLiturgia] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState<number | null>(null);
  const [mostrarNuevoCulto, setMostrarNuevoCulto] = useState<boolean>(false);
  const [nombreNuevoCulto, setNombreNuevoCulto] = useState<string>("");
  const [cargandoInicial, setCargandoInicial] = useState<boolean>(true);
  
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "", buttons: [] });
  const [successAlert, setSuccessAlert] = useState({ visible: false, message: "" });

  useEffect(() => {
    const inicializar = async () => {
      try {
        const savedCultos = await AsyncStorage.getItem("cultos_disponibles_v3");
        
        let cultosAUsar: string[] = [];
        
        if (savedCultos) {
          const parsed = JSON.parse(savedCultos);
          cultosAUsar = parsed.filter((c: string) => c && typeof c === "string" && c.trim().length > 0);
        }
        
        if (cultosAUsar.length === 0) {
          cultosAUsar = ["Culto Dominical", "Culto de Jóvenes"];
          await AsyncStorage.setItem("cultos_disponibles_v3", JSON.stringify(cultosAUsar));
        }
        
        setCultos(cultosAUsar);
        setProgramaSeleccionado(cultosAUsar[0]);
        await cargarProgramaDelCulto(cultosAUsar[0]);
      } catch (error) {
        console.error("Error en inicialización:", error);
        const cultosDefault = ["Culto Dominical", "Culto de Jóvenes"];
        setCultos(cultosDefault);
        setProgramaSeleccionado(cultosDefault[0]);
        await AsyncStorage.setItem("cultos_disponibles_v3", JSON.stringify(cultosDefault));
        await cargarProgramaDelCulto(cultosDefault[0]);
      } finally {
        setCargandoInicial(false);
      }
    };
    inicializar();
  }, []);

  const cargarProgramaDelCulto = async (nombre: string) => {
    try {
      const guardado = await AsyncStorage.getItem(`programa_v3_${nombre}`);
      if (guardado) {
        setLiturgia(JSON.parse(guardado));
      } else {
        const plantillaDefault = JSON.parse(JSON.stringify(MOMENTOS_PLANTILLA));
        setLiturgia(plantillaDefault);
        await AsyncStorage.setItem(`programa_v3_${nombre}`, JSON.stringify(plantillaDefault));
      }
    } catch (error) {
      console.error("Error cargando programa:", error);
      const plantillaDefault = JSON.parse(JSON.stringify(MOMENTOS_PLANTILLA));
      setLiturgia(plantillaDefault);
    }
  };

  const handleAgregarCulto = async () => {
    if (!nombreNuevoCulto.trim()) return;
    
    try {
      const nuevoNombre = nombreNuevoCulto.trim();
      const nuevaLista = [...cultos, nuevoNombre];
      
      await AsyncStorage.setItem("cultos_disponibles_v3", JSON.stringify(nuevaLista));
      setCultos(nuevaLista);
      
      const plantillaDefault = JSON.parse(JSON.stringify(MOMENTOS_PLANTILLA));
      await AsyncStorage.setItem(`programa_v3_${nuevoNombre}`, JSON.stringify(plantillaDefault));
      
      setProgramaSeleccionado(nuevoNombre);
      setLiturgia(plantillaDefault);
      setNombreNuevoCulto("");
      setMostrarNuevoCulto(false);
    } catch (error) {
      console.error("Error agregando culto:", error);
    }
  };

  // ✅ ELIMINAR CULTO - CON CUSTOM ALERT
  const handleEliminarCulto = (nombre: string) => {
    if (cultos.length <= 1) {
      setAlertConfig({
        visible: true,
        title: "Error",
        message: "Debe haber al menos un programa en la lista.",
        buttons: [{ text: "OK", onPress: () => {} }]
      });
      return;
    }

    setAlertConfig({
      visible: true,
      title: "Eliminar Culto",
      message: `¿Deseas eliminar "${nombre}" y toda su programación?`,
      buttons: [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        { 
          text: "Eliminar", 
          onPress: async () => {
            try {
              const filtrados = cultos.filter(c => c !== nombre);
              
              await AsyncStorage.setItem("cultos_disponibles_v3", JSON.stringify(filtrados));
              await AsyncStorage.removeItem(`programa_v3_${nombre}`);
              
              setCultos(filtrados);
              
              if (programaSeleccionado === nombre && filtrados.length > 0) {
                const siguiente = filtrados[0];
                setProgramaSeleccionado(siguiente);
                
                setTimeout(async () => {
                  await cargarProgramaDelCulto(siguiente);
                }, 100);
              }
              
              setSuccessAlert({
                visible: true,
                message: `"${nombre}" ha sido eliminado correctamente.`
              });
            } catch (error) {
              console.error("Error eliminando culto:", error);
            }
          },
          style: "destructive" 
        }
      ]
    });
  };

  const guardarPrograma = async () => {
    try {
      await AsyncStorage.setItem(`programa_v3_${programaSeleccionado}`, JSON.stringify(liturgia));
      setSuccessAlert({
        visible: true,
        message: "Programa guardado correctamente."
      });
    } catch (error) {
      console.error("Error guardando programa:", error);
    }
  };

  // ✅ RESET PLANTILLA - CON CUSTOM ALERT
  const handleResetPlantilla = () => {
    setAlertConfig({
      visible: true,
      title: "Reiniciar",
      message: "¿Restaurar plantilla original?",
      buttons: [
        { text: "No", onPress: () => {}, style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              const plantillaDefault = JSON.parse(JSON.stringify(MOMENTOS_PLANTILLA));
              setLiturgia(plantillaDefault);
              
              await AsyncStorage.setItem(
                `programa_v3_${programaSeleccionado}`, 
                JSON.stringify(plantillaDefault)
              );
              
              setSuccessAlert({
                visible: true,
                message: "Plantilla restaurada correctamente."
              });
            } catch (error) {
              console.error("Error al resetear plantilla:", error);
            }
          },
          style: "destructive"
        }
      ]
    });
  };

  const asignarElemento = (item: any) => {
    if (campoSeleccionado === null) return;
    
    const nuevaLiturgia = [...liturgia];
    if (!nuevaLiturgia[campoSeleccionado].seleccionados) {
      nuevaLiturgia[campoSeleccionado].seleccionados = [];
    }
    
    nuevaLiturgia[campoSeleccionado].seleccionados.push({ 
      id: item.id, 
      titulo: item.titulo 
    });
    
    setLiturgia(nuevaLiturgia);
    setCampoSeleccionado(null);
    setBusqueda("");
    setResultados([]);
  };

  const eliminarElemento = (mIdx: number, hIdx: number) => {
    const nuevaLiturgia = [...liturgia];
    const nuevosSeleccionados = nuevaLiturgia[mIdx].seleccionados.filter((_, i) => i !== hIdx);
    nuevaLiturgia[mIdx] = { ...nuevaLiturgia[mIdx], seleccionados: nuevosSeleccionados };
    setLiturgia(nuevaLiturgia);
  };

  const eliminarSeccion = (idx: number) => {
    const nueva = liturgia.filter((_, i) => i !== idx);
    setLiturgia(nueva);
  };

  const buscar = (texto: string) => {
    setBusqueda(texto);
    if (!texto.trim()) { 
      setResultados([]); 
      return; 
    }
    const query = texto.toLowerCase();
    const h = (data.himnos || []).filter((x: any) => 
      x.id?.toString().includes(query) || x.titulo?.toLowerCase().includes(query)
    );
    const c = (data.canticos || []).filter((x: any) => 
      x.id?.toString().includes(query) || x.titulo?.toLowerCase().includes(query)
    );
    setResultados([...h, ...c].slice(0, 10));
  };

  if (cargandoInicial) return null;

  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{flex: 1}}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📖 Programar</Text>
        </View>

        <View style={styles.selectorWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight: 20}}>
            {cultos.map((item) => (
              <View key={item} style={styles.chipContainer}>
                <TouchableOpacity
                  style={[styles.chip, programaSeleccionado === item && styles.chipActive]}
                  onPress={() => { 
                    setProgramaSeleccionado(item); 
                    cargarProgramaDelCulto(item); 
                  }}
                >
                  <Text style={[styles.chipText, programaSeleccionado === item && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.chipDelete} 
                  onPress={() => handleEliminarCulto(item)}
                >
                  <Ionicons name="close-circle" size={18} color="#ff5252" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setMostrarNuevoCulto(true)} style={styles.btnAddMain}>
              <Ionicons name="add-circle" size={34} color="#4db6ac" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {mostrarNuevoCulto && (
          <View style={styles.inputNuevoCultoArea}>
            <TextInput 
              style={styles.inputNuevoCulto} 
              placeholder="Nombre del Culto" 
              placeholderTextColor="#888" 
              value={nombreNuevoCulto}
              onChangeText={setNombreNuevoCulto}
              autoFocus
            />
            <TouchableOpacity onPress={handleAgregarCulto} style={styles.btnConfirmCulto}>
              <Ionicons name="checkmark" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMostrarNuevoCulto(false)} style={styles.btnCancelCulto}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={liturgia}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ paddingBottom: 150 }}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <TextInput
                  style={styles.campoNombre}
                  value={item.nombreCampo}
                  onChangeText={(t) => {
                    const n = [...liturgia]; 
                    n[index].nombreCampo = t; 
                    setLiturgia(n);
                  }}
                />
                <TouchableOpacity onPress={() => eliminarSeccion(index)}>
                  <Ionicons name="trash-outline" size={20} color="#ff5252" />
                </TouchableOpacity>
              </View>

              {item.seleccionados && item.seleccionados.map((h: any, hIdx: number) => (
                <View key={hIdx} style={styles.himnoItem}>
                  <Text style={styles.himnoText}>
                    <Text style={{color: '#4db6ac', fontWeight: 'bold'}}>{h.id}</Text> - {h.titulo}
                  </Text>
                  <TouchableOpacity onPress={() => eliminarElemento(index, hIdx)}>
                    <Ionicons name="remove-circle" size={22} color="#ffab40" />
                  </TouchableOpacity>
                </View>
              ))}

              {campoSeleccionado === index ? (
                <View style={styles.searchBox}>
                  <TextInput 
                    style={styles.searchInput} 
                    placeholder="Buscar por número o título..." 
                    placeholderTextColor="#666" 
                    value={busqueda} 
                    onChangeText={buscar} 
                    autoFocus 
                  />
                  {resultados.map((res: any) => (
                    <TouchableOpacity 
                      key={res.id} 
                      style={styles.resItem} 
                      onPress={() => asignarElemento(res)}
                    >
                      <Text style={{color: '#ddd'}}>{res.id} - {res.titulo}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => {
                    setCampoSeleccionado(null); 
                    setBusqueda("");
                  }}>
                    <Text style={styles.cancelText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.btnAdd} 
                  onPress={() => setCampoSeleccionado(index)}
                >
                  <Ionicons name="search" size={14} color="#4db6ac" />
                  <Text style={styles.btnAddText}> BUSCAR HIMNO</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity 
              style={styles.btnFooterAdd} 
              onPress={() => setLiturgia([...liturgia, { nombreCampo: "NUEVO MOMENTO", seleccionados: [] }])}
            >
              <Ionicons name="add" size={20} color="#4db6ac" />
              <Text style={{color: '#4db6ac', fontWeight: 'bold'}}> AÑADIR SECCIÓN</Text>
            </TouchableOpacity>
          }
        />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnSave} onPress={guardarPrograma}>
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.btnText}> GUARDAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnClear} onPress={handleResetPlantilla}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.btnText}> PLANTILLA</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
      />

      <SuccessAlert
        visible={successAlert.visible}
        message={successAlert.message}
        onDismiss={() => setSuccessAlert({ ...successAlert, visible: false })}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginTop: 60, paddingHorizontal: 25, marginBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: "#E0E0E0" },
  
  selectorWrapper: { height: 70, marginBottom: 10 },
  chipContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 20 },
  chip: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: "#ffffff12", borderWidth: 1, borderColor: '#ffffff20' },
  chipActive: { backgroundColor: "#4db6ac", borderColor: '#4db6ac' },
  chipText: { color: "#888", fontSize: 13 },
  chipTextActive: { color: "white", fontWeight: "bold" },
  chipDelete: { marginLeft: -12, marginTop: -20, backgroundColor: 'white', borderRadius: 10 },
  btnAddMain: { marginLeft: 15, justifyContent: 'center' },

  inputNuevoCultoArea: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 8 },
  inputNuevoCulto: { flex: 1, backgroundColor: '#000', color: 'white', borderRadius: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#4db6ac' },
  btnConfirmCulto: { backgroundColor: '#2e7d32', padding: 10, borderRadius: 10 },
  btnCancelCulto: { backgroundColor: '#c62828', padding: 10, borderRadius: 10 },

  card: { backgroundColor: "#ffffff08", marginHorizontal: 20, borderRadius: 18, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: "#ffffff10" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center', marginBottom: 15 },
  campoNombre: { fontSize: 16, color: "#4db6ac", fontWeight: "bold", flex: 1, borderBottomWidth: 0.5, borderBottomColor: '#4db6ac33' },
  himnoItem: { flexDirection: "row", backgroundColor: "#00000040", padding: 12, borderRadius: 12, marginBottom: 8, alignItems: "center", justifyContent: 'space-between' },
  himnoText: { color: "#eee", fontSize: 14, flex: 1 },
  btnAdd: { flexDirection: "row", justifyContent: "center", alignItems: 'center', marginTop: 10 },
  btnAddText: { color: "#4db6ac", fontSize: 12, fontWeight: 'bold' },
  
  searchBox: { backgroundColor: "#000", borderRadius: 12, padding: 15, marginTop: 10 },
  searchInput: { color: "white", borderBottomWidth: 1, borderColor: "#4db6ac", marginBottom: 12, paddingVertical: 5 },
  resItem: { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#333" },
  cancelText: { color: '#ff5252', textAlign: 'center', marginTop: 10, fontSize: 12, fontWeight: 'bold' },
  
  btnFooterAdd: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 20, padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#4db6ac', marginHorizontal: 20, borderRadius: 15 },
  
  footer: { position: "absolute", bottom: 30, left: 20, right: 20, flexDirection: 'row', gap: 12 },
  btnSave: { flex: 2, backgroundColor: "#2e7d32", flexDirection: "row", padding: 18, borderRadius: 18, justifyContent: "center", alignItems: 'center', elevation: 5 },
  btnClear: { flex: 1, backgroundColor: "#455a64", flexDirection: "row", padding: 18, borderRadius: 18, justifyContent: "center", alignItems: 'center' },
  btnText: { color: "white", fontWeight: "bold", marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
  alertContainer: { backgroundColor: "#1A1A1A", borderRadius: 20, padding: 25, width: "85%", borderWidth: 1, borderColor: "#333" },
  alertTitle: { fontSize: 20, color: "#4db6ac", fontWeight: "bold", marginBottom: 10 },
  alertMessage: { color: "#bbb", marginBottom: 25, fontSize: 16 },
  alertButtonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 15 },
  alertBtn: { backgroundColor: "#2e7d32", paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
  alertBtnDangerous: { backgroundColor: "#c62828" },
  alertBtnText: { color: "white", fontWeight: "bold" }
});