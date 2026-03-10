import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors, Fonts } from '../../constants/theme';

export default function CredoScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <ImageBackground
      source={require('../../assets/images/lutero-fondo.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          {/* Credo de los Apóstoles */}
          <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.serif }]}>
            Credo de los Apóstoles
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Creo en Dios Padre todopoderoso, creador del cielo y de la tierra.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Y en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra del Espíritu Santo,
            nació de la Virgen María, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos
            y está sentado a la derecha de Dios Padre todopoderoso.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Desde allí ha de venir a juzgar a vivos y muertos.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Creo en el Espíritu Santo, la santa Iglesia cristiana, la comunión de los santos,
            el perdón de los pecados, la resurrección de la carne y la vida perdurable. Amén.
          </Text>

          {/* Credo Niceno */}
          <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.serif, marginTop: 30 }]}>
            Credo Niceno
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Creo en un solo Dios, Padre todopoderoso, creador del cielo y de la tierra, de todo lo visible y lo invisible.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Creo en un solo Señor, Jesucristo, Hijo único de Dios, nacido del Padre antes de todos los siglos:
            Dios de Dios, Luz de Luz, Dios verdadero de Dios verdadero, engendrado, no creado,
            de la misma naturaleza que el Padre, por quien todo fue hecho.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Que por nosotros los hombres y por nuestra salvación bajó del cielo,
            y por obra del Espíritu Santo se encarnó de María, la Virgen, y se hizo hombre.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Y por nuestra causa fue crucificado en tiempos de Poncio Pilato; padeció y fue sepultado,
            y resucitó al tercer día, según las Escrituras, y subió al cielo,
            y está sentado a la derecha del Padre.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Y de nuevo vendrá con gloria para juzgar a vivos y muertos, y su reino no tendrá fin.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Creo en el Espíritu Santo, Señor y dador de vida, que procede del Padre y del Hijo,
            que con el Padre y el Hijo recibe una misma adoración y gloria, y que habló por los profetas.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Creo en la Iglesia, que es una, santa, católica y apostólica.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Confieso que hay un solo bautismo para el perdón de los pecados.
          </Text>
          <Text style={[styles.text, { color: colors.text, fontFamily: Fonts.sans }]}>
            Espero la resurrección de los muertos y la vida del mundo futuro. Amén.
          </Text>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  text: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 12,
  },
});
