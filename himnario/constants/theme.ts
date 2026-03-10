import { Platform } from 'react-native';

const tintColorLight = '#6b4226'; // marrón cálido estilo pergamino
const tintColorDark = '#d4af37'; // dorado para modo oscuro

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fdf6e3',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    overlay: 'rgba(255,255,255,0.85)',
    buttonBackground: '#e0d4b7',
    buttonText: '#11181C',
    inputBackground: '#fff',
    inputBorder: '#ccc',
  },
  dark: {
    text: '#ECEDEE',
    background: '#1c1c1c',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    overlay: 'rgba(0,0,0,0.7)',
    buttonBackground: '#333',
    buttonText: '#f5f5f5',
    inputBackground: '#2a2a2a',
    inputBorder: '#555',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// 🎨 Estilos globales reutilizables
export const GlobalStyles = {
  button: (colors: typeof Colors.light | typeof Colors.dark) => ({
    backgroundColor: colors.buttonBackground,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  }),
  buttonText: (colors: typeof Colors.light | typeof Colors.dark, fonts = Fonts.sans) => ({
    color: colors.buttonText,
    fontFamily: fonts,
    fontSize: 16,
    fontWeight: '600',
  }),
  input: (colors: typeof Colors.light | typeof Colors.dark, fonts = Fonts.sans) => ({
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    color: colors.text,
    fontFamily: fonts,
    fontSize: 14,
  }),
};

