import { useEffect } from "react";
import { Alert, Linking } from "react-native";
import Constants from "expo-constants";

export default function UpdateCheck() {
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/jjohony/himnario-luterano/main/version.json")
      .then(res => res.json())
      .then(data => {
        // Compara la versión remota con la versión local de app.json
        if (data.latestVersion !== Constants.expoConfig.version) {
          Alert.alert(
            "Actualización disponible",
            "Hay una nueva versión del Himnario. ¿Deseas descargarla?",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Descargar", onPress: () => Linking.openURL(data.apkUrl) }
            ]
          );
        }
      })
      .catch(err => console.log("Error verificando versión", err));
  }, []);

  return null; // no renderiza nada, solo ejecuta la verificación
}
