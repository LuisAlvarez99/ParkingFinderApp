import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapViewProps = {
  style?: StyleProp<ViewStyle>;
  region: Region;
  showsUserLocation?: boolean;
  children?: React.ReactNode;
};

export default function MapView({ style, region, children }: MapViewProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Map preview is not available on web.</Text>
      <Text style={styles.subtitle}>
        Center: {region.latitude.toFixed(5)}, {region.longitude.toFixed(5)}
      </Text>
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
