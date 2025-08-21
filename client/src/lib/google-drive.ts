// Google Drive API integration for photo gallery
export interface DrivePhoto {
  id: string;
  name: string;
  thumbnailLink: string;
  webViewLink: string;
  webContentLink: string;
  mimeType: string;
}

class GoogleDriveClient {
  private accessToken: string | null = null;

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch('/api/drive/auth');
      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Drive authentication failed:', error);
      return false;
    }
  }

  async getPhotosFromFolder(folderId: string): Promise<DrivePhoto[]> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Failed to authenticate with Google Drive');
      }
    }

    try {
      const response = await fetch(`/api/drive/photos/${folderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch photos from Google Drive');
      }
      
      const photos = await response.json();
      return photos;
    } catch (error) {
      console.error('Error fetching Drive photos:', error);
      throw error;
    }
  }

  async getSharedFolderPhotos(shareUrl: string): Promise<DrivePhoto[]> {
    try {
      const response = await fetch('/api/drive/shared-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch shared folder photos');
      }
      
      const photos = await response.json();
      return photos;
    } catch (error) {
      console.error('Error fetching shared photos:', error);
      throw error;
    }
  }
}

export const googleDriveClient = new GoogleDriveClient();