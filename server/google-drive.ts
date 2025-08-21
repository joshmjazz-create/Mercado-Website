import { google } from 'googleapis';

export interface DrivePhoto {
  id: string;
  name: string;
  thumbnailLink: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
  createdTime: string;
}

class GoogleDriveService {
  private drive: any;

  constructor() {
    // Initialize Drive service only when actually used
    this.drive = null;
  }

  private async initializeDrive() {
    if (this.drive) return;

    if (!process.env.GOOGLE_DRIVE_CREDENTIALS) {
      throw new Error('Google Drive credentials not configured');
    }

    try {
      const credentials = JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS);
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

      this.drive = google.drive({ version: 'v3', auth });
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      throw error;
    }
  }

  async getPhotosFromFolder(folderId: string): Promise<DrivePhoto[]> {
    try {
      await this.initializeDrive();
      
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/gif' or mimeType='image/webp')`,
        fields: 'files(id,name,thumbnailLink,webViewLink,webContentLink,mimeType,createdTime)',
        orderBy: 'createdTime desc',
        pageSize: 100,
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error fetching photos from Drive folder:', error);
      throw error;
    }
  }

  async extractFolderIdFromShareUrl(shareUrl: string): Promise<string | null> {
    // Extract folder ID from Google Drive share URLs
    // Format: https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing
    const match = shareUrl.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  async getPublicPhotos(shareUrl: string): Promise<DrivePhoto[]> {
    try {
      const folderId = await this.extractFolderIdFromShareUrl(shareUrl);
      if (!folderId) {
        throw new Error('Invalid Google Drive share URL');
      }

      return await this.getPhotosFromFolder(folderId);
    } catch (error) {
      console.error('Error fetching public photos:', error);
      throw error;
    }
  }

  // Generate direct image URLs for display using Google Drive's public sharing
  getDirectImageUrl(fileId: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizeMap = {
      small: 's600',
      medium: 's1200', 
      large: 's1920'
    };
    
    // Use Google Drive's public image serving endpoint
    return `https://lh3.googleusercontent.com/d/${fileId}=${sizeMap[size]}`;
  }

  // Get high quality direct download URL for full-size images
  getHighQualityImageUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }

  // Alternative method using Drive's native thumbnail if available
  getThumbnailFromDrive(photo: any, size: 'small' | 'medium' | 'large' = 'medium'): string {
    if (photo.thumbnailLink) {
      // Use the native thumbnail from Google Drive and modify size
      const sizeMap = {
        small: 's600',
        medium: 's1200', 
        large: 's1920'
      };
      
      // Replace the =s220 parameter in thumbnailLink with our desired size
      return photo.thumbnailLink.replace(/=s\d+/, `=${sizeMap[size]}`);
    }
    
    return this.getDirectImageUrl(photo.id, size);
  }
}

export const googleDriveService = new GoogleDriveService();