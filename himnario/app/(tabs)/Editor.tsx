import { View, Text, FlatList, TextInput, Button } from "react-native";
import { useState } from "react";
import data from "../../himnos.json";

export default function Editor() {
  const [liturgia, setLiturgia] = useState(data.programas[0].liturgia);

  const cambiarTitulo = (index, nuevoTitulo) => {
    const nuevaLiturgia = [...liturgia];
    nuevaLiturgia[index].titulo = nuevoTitulo;
    setLiturgia(nuevaLiturgia);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        Editor de Programa
      </Text>
      <FlatList
        data={liturgia}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18 }}>{item.orden}</Text>
            <TextInput
              value={item.titulo}
              onChangeText={(text) => cambiarTitulo(index, text)}
              style={{ borderWidth: 1, padding: 8, marginTop: 5 }}
            />
          </View>
        )}
      />
      <Button title="Guardar cambios" onPress={() => console.log("Liturgia guardada", liturgia)} />
    </View>
  );
}
