import type { ColorSchemeName } from 'react-native';

// App now працює лише в темній темі, тому завжди повертаємо 'dark'.
export function useColorScheme(): ColorSchemeName {
  return 'dark';
}
