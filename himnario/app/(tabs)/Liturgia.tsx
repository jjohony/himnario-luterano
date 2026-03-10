import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import data from "../../himnos.json"; // tu JSON

export default function Liturgia() {
  const { programa } = useLocalSearchParams();
  const router = useRouter();

  const programaData = data.programas.find(p => p.nombre === programa);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        {programa}
      </Text>
      <FlatList
        data={programaData?.liturgia || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/Detalle?referencia=${item.referencia}&titulo=${item.titulo}`)
            }
          >
            <Text style={{ fontSize: 18, marginVertical: 8 }}>
              {item.orden}: {item.titulo}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
