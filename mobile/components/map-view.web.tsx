import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

// Keep the public surface area similar to `react-native-maps` so existing imports keep working.
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapViewProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
  region?: Region;
  initialRegion?: Region;
  showsUserLocation?: boolean;
  children?: React.ReactNode;
};

export default function MapView({ style, region, initialRegion, children, ...rest }: MapViewProps) {
  const center = region ?? initialRegion;

  return (
    <View style={[styles.container, style]} {...rest}>
      <Text style={styles.title}>Map is not available in the web build yet.</Text>
      {center ? (
        <Text style={styles.subtitle}>
          Center: {center.latitude.toFixed(5)}, {center.longitude.toFixed(5)}
        </Text>
      ) : (
        <Text style={styles.subtitle}>Open via Expo Go (native) to see the interactive map.</Text>
      )}
      {children}
    </View>
  );
}

type LatLng = {
  latitude: number;
  longitude: number;
};

type MarkerProps = {
  coordinate: LatLng;
  title?: string;
};

export function Marker(_props: MarkerProps) {
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.75,
  },
});
