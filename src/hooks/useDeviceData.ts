import { useEffect, useState } from 'react';
import { DeviceDataService } from '../services/DeviceData';
import { MaybeDeviceData } from '../types/DeviceData.interface';

export function useDeviceData(): [
  MaybeDeviceData,
  (name: string) => void,
  () => void
] {
  const [deviceData, setDeviceData] = useState<MaybeDeviceData>(
    DeviceDataService.getDeviceData()
  );

  // ----------------------------------------
  // effects
  // ----------------------------------------
  useEffect(() => {
    DeviceDataService.onChange((deviceData) => {
      setDeviceData(deviceData);
    });
  }, []);

  // ----------------------------------------
  // helper functions
  // ----------------------------------------
  function setName(name: string) {
    DeviceDataService.setName(name);
  }

  function logout() {
    DeviceDataService.setDeviceData(null);
  }

  return [deviceData, setName, logout];
}
