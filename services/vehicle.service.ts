import { apiService } from './api';
import { Vehicle } from '@/types';

class VehicleService {
  async getVehicles(): Promise<Vehicle[]> {
    return await apiService.get<Vehicle[]>('/vehicles');
  }

  async getVehicle(id: string): Promise<Vehicle> {
    return await apiService.get<Vehicle>(`/vehicles/${id}`);
  }

  async addVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    return await apiService.post<Vehicle>('/vehicles', vehicleData);
  }

  async updateVehicle(id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    return await apiService.put<Vehicle>(`/vehicles/${id}`, vehicleData);
  }

  async deleteVehicle(id: string): Promise<void> {
    await apiService.delete(`/vehicles/${id}`);
  }

  async uploadVehicleImage(vehicleId: string, image: FormData): Promise<string> {
    return await apiService.uploadFile<string>(`/vehicles/${vehicleId}/images`, image);
  }

  async setDefaultVehicle(id: string): Promise<Vehicle> {
    return await apiService.patch<Vehicle>(`/vehicles/${id}/set-default`);
  }

  async getServiceHistory(vehicleId: string): Promise<unknown[]> {
    return await apiService.get<unknown[]>(`/vehicles/${vehicleId}/service-history`);
  }
}

export const vehicleService = new VehicleService();
