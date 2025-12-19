import * as React from 'react';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { GoogleMap, Marker as GoogleMarker, useJsApiLoader } from '@react-google-maps/api';

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

type LatLng = {
  latitude: number;
  longitude: number;
};

type MarkerProps = {
  coordinate: LatLng;
  title?: string;
};

function regionToZoom(region: Region) {
  // Approximate conversion from latitudeDelta to zoom.
  // zoom ~ log2(360 / latDelta)
  const zoom = Math.log2(360 / Math.max(region.latitudeDelta, 0.000001));
  return Math.max(1, Math.min(20, Math.round(zoom)));
}

export default function MapView({ style, region, initialRegion, children, ...rest }: MapViewProps) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const centerRegion = region ?? initialRegion;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey ?? '',
  });

  const center = useMemo(() => {
    if (!centerRegion) return null;
    return { lat: centerRegion.latitude, lng: centerRegion.longitude };
  }, [centerRegion]);

  const zoom = useMemo(() => {
    if (!centerRegion) return 12;
    return regionToZoom(centerRegion);
  }, [centerRegion]);

  const markers = useMemo(() => {
    const nodes = React.Children.toArray(children);
    return nodes
      .filter((node): node is React.ReactElement<MarkerProps> =>
        React.isValidElement(node) && node.type === Marker,
      )
      .map((node) => node.props);
  }, [children]);

  if (!apiKey) {
    return (
      <View style={[styles.container, style]} {...rest}>
        <Text style={styles.title}>Missing Google Maps API key.</Text>
        <Text style={styles.subtitle}>
          Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your environment, then restart the dev server.
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.container, style]} {...rest}>
        <Text style={styles.title}>Failed to load Google Maps.</Text>
        <Text style={styles.subtitle}>{String(loadError)}</Text>
      </View>
    );
  }

  if (!isLoaded || !center) {
    return (
      <View style={[styles.loadingContainer, style]} {...rest}>
        <ActivityIndicator />
        <Text style={styles.subtitle}>Loading map…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.mapContainer, style]} {...rest}>
      <GoogleMap mapContainerStyle={styles.map} center={center} zoom={zoom}>
        {markers.map((m, idx) => (
          <GoogleMarker
            key={`${m.coordinate.latitude},${m.coordinate.longitude},${idx}`}
            position={{ lat: m.coordinate.latitude, lng: m.coordinate.longitude }}
            title={m.title}
          />
        ))}
      </GoogleMap>
    </View>
  );
}

export function Marker(_props: MarkerProps) {
  // This is a marker *descriptor* for MapView.web. The actual Google markers are rendered by MapView.
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  mapContainer: {
    flex: 1,
  },
  // react-google-maps/api expects a plain style object (not a RN StyleSheet id), but on web this
  // resolves to a normal object with width/height.
  map: {
    width: '100%',
    height: '100%',
  } as unknown as { width: string; height: string },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.75,
    textAlign: 'center',
  },
});
