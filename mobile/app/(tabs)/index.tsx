import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import * as Location from 'expo-location';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type LatLng = {
  latitude: number;
  longitude: number;
};

export default function HomeScreen() {
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setCoords(null);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to read location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setCoords(null);
        return;
      }

      await fetchLocation();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to request permission');
    } finally {
      setIsLoading(false);
    }
  }, [fetchLocation]);

  useEffect(() => {
    void fetchLocation();
  }, [fetchLocation]);

  const region = useMemo<Region>(() => {
    if (coords) {
      return {
        ...coords,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
    }

    // Fallback region before we have permission / a fix.
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    };
  }, [coords]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.topBar}>
        <ThemedText type="title">Parking Finder</ThemedText>
        {permissionStatus !== 'granted' ? (
          <ThemedText style={styles.subtext}>
            To show nearby parking, we need access to your location.
          </ThemedText>
        ) : coords ? (
          <ThemedText style={styles.subtext}>
            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </ThemedText>
        ) : null}

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        <ThemedView style={styles.actionsRow}>
          {permissionStatus !== 'granted' ? (
            <Pressable style={styles.button} onPress={requestPermission} disabled={isLoading}>
              <ThemedText style={styles.buttonText}>Enable Location</ThemedText>
            </Pressable>
          ) : (
            <Pressable style={styles.button} onPress={fetchLocation} disabled={isLoading}>
              <ThemedText style={styles.buttonText}>Refresh Location</ThemedText>
            </Pressable>
          )}

          {isLoading ? <ActivityIndicator /> : null}
        </ThemedView>
      </ThemedView>

      <MapView style={styles.map} region={region} showsUserLocation={permissionStatus === 'granted'}>
        {coords ? <Marker coordinate={coords} title="You are here" /> : null}
      </MapView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  subtext: {
    opacity: 0.8,
  },
  errorText: {
    color: '#B00020',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0A84FF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
});
