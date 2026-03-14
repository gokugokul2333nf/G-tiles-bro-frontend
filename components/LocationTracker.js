'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function LocationTracker() {
  const { user } = useAuth();
  const lastUpdateRef = useRef(0);
  const UPDATE_INTERVAL = 5000; 

  useEffect(() => {
    if (!user || user.role !== 'marketing') return;

    if (!("geolocation" in navigator)) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    const updateLocation = async (position) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < UPDATE_INTERVAL) return;

      try {
        await api.put('auth/location', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        lastUpdateRef.current = now;
      } catch (err) {
        console.error('Failed to update location', err);
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => console.error('Geolocation error:', err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user]);

  return null;
}
