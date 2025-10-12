import { supabase } from './supabase';
import * as ImagePicker from 'expo-image-picker';

const BUCKET_NAME = 'foamy';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Request permission to access the device's media library
 */
export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Pick an image from the device's media library
 */
export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const hasPermission = await requestMediaLibraryPermissions();

  if (!hasPermission) {
    throw new Error('Permission to access media library was denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}

/**
 * Upload an image to Supabase storage
 * @param fileUri - Local file URI from ImagePicker
 * @param folder - Folder in the bucket ('profile_pics', 'vehicles', 'gallery', or 'services')
 * @param fileName - Optional custom file name (will generate UUID if not provided)
 */
export async function uploadImage(
  fileUri: string,
  folder: 'profile_pics' | 'vehicles' | 'gallery' | 'services',
  fileName?: string
): Promise<UploadResult> {
  try {
    // Generate file name if not provided
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const finalFileName = fileName || `${timestamp}_${randomString}.jpg`;

    // Build the storage path
    const filePath = `${folder}/${finalFileName}`;

    // Fetch the image and convert to ArrayBuffer
    const response = await fetch(fileUri);
    const arrayBuffer = await response.arrayBuffer();

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase storage
 * @param path - The storage path of the file to delete
 */
export async function deleteImage(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Upload profile picture
 * Convenience wrapper around uploadImage for profile pictures
 */
export async function uploadProfilePicture(
  fileUri: string,
  userId: string
): Promise<UploadResult> {
  const fileName = `profile_${userId}_${Date.now()}.jpg`;
  return uploadImage(fileUri, 'profile_pics', fileName);
}

/**
 * Upload vehicle image
 * Convenience wrapper around uploadImage for vehicle images
 */
export async function uploadVehicleImage(
  fileUri: string,
  vehicleId: string
): Promise<UploadResult> {
  const fileName = `vehicle_${vehicleId}_${Date.now()}.jpg`;
  return uploadImage(fileUri, 'vehicles', fileName);
}
