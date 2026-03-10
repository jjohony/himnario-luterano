import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text } from "react-native";
import data from "../../himnos.json";

export default function Detalle() {
  const { referencia, titulo } = useLocalSearchParams();

  const himno = data.himnos.find(h => h.id === referencia);
  const cantico = data.canticos.find(c => c.id === referencia);
  const contenido = himno || cantico;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 15 }}>
        {contenido?.titulo || titulo}
      </Text>
      {contenido?.estrofas.map((estrofa, index) => (
        <Text key={index} style={{ fontSize: 18, marginBottom: 12 }}>
          {estrofa}
        </Text>
      ))}
      {contenido?.coro && (
        <Text style={{ fontSize: 18, marginTop: 20 }}>
          Coro: {contenido.coro}
        </Text>
      )}
    </ScrollView>
  );
}
