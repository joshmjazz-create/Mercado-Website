import { google } from 'googleapis';
import type { drive_v3 } from 'googleapis';

interface DrivePhoto {
  id: string;
  name: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  mimeType: string;
  createdTime?: string;
  size?: string;
}

interface AlbumMetadata {
  title: string;
  artist: string;
  year: string;
  links: {
    spotify?: string;
    apple?: string;
    youtube?: string;
  };
}

export class GoogleDriveService {
  private drive: drive_v3.Drive | null = null;
  private albumsCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  private async initializeDrive() {
    if (this.drive) return;

    try {
      const credentials = JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS || '');
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

      this.drive = google.drive({ version: 'v3', auth });
    } catch (error) {
      console.error('Error initializing Google Drive:', error);
      throw error;
    }
  }

  async searchFoldersRecursively(parentFolderId: string, searchTerm: string): Promise<DrivePhoto[]> {
    let results: DrivePhoto[] = [];
    
    try {
      await this.initializeDrive();
      
      // Search for folders that contain the search term
      const response = await this.drive!.files.list({
        q: `'${parentFolderId}' in parents and name contains '${searchTerm}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id,name)',
      });

      if (response.data.files) {
        results = results.concat(response.data.files as DrivePhoto[]);
      }
      
      // Also search within subfolders
      const subfolders = await this.getFoldersInFolder(parentFolderId);
      for (const subfolder of subfolders) {
        const subResults = await this.searchFoldersRecursively(subfolder.id, searchTerm);
        results = results.concat(subResults);
      }

      return results;
    } catch (error) {
      console.error('Error searching folders recursively:', error);
      return results;
    }
  }

  async getFoldersInFolder(parentFolderId: string): Promise<DrivePhoto[]> {
    try {
      await this.initializeDrive();
      
      const response = await this.drive!.files.list({
        q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id,name,createdTime)',
        orderBy: 'name',
        pageSize: 1000, // Increased for better performance
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error fetching folders from Drive folder:', error);
      throw error;
    }
  }

  async getFilesFromFolder(folderId: string, query?: string): Promise<DrivePhoto[]> {
    try {
      await this.initializeDrive();
      
      const baseQuery = `'${folderId}' in parents`;
      const fullQuery = query ? `${baseQuery} and ${query}` : baseQuery;
      
      const response = await this.drive!.files.list({
        q: fullQuery,
        fields: 'files(id,name,thumbnailLink,webViewLink,webContentLink,mimeType,createdTime,size)',
        orderBy: 'createdTime desc',
        pageSize: 1000, // Increased for better performance
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error fetching files from Drive folder:', error);
      throw error;
    }
  }

  async getFoldersFromShareableLink(shareUrl: string): Promise<DrivePhoto[]> {
    try {
      const folderId = this.extractFolderIdFromUrl(shareUrl);
      if (!folderId) {
        throw new Error('Invalid Google Drive folder URL');
      }

      return await this.getFilesFromFolder(folderId, "mimeType contains 'image'");
    } catch (error) {
      console.error('Error fetching folders from Drive:', error);
      throw error;
    }
  }

  extractFolderIdFromUrl(url: string): string | null {
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  // For backward compatibility
  async extractFolderIdFromShareUrl(shareUrl: string): Promise<string | null> {
    return this.extractFolderIdFromUrl(shareUrl);
  }

  // Method for getting photos from folder (for compatibility)
  async getPhotosFromFolder(folderId: string): Promise<DrivePhoto[]> {
    return this.getFilesFromFolder(folderId, "mimeType contains 'image'");
  }

  // For direct image URLs
  getHighQualityImageUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}`;
  }

  getThumbnailFromDrive(photo: DrivePhoto, size: 'medium' | 'large' = 'medium'): string {
    if (photo.thumbnailLink) {
      return photo.thumbnailLink.replace('=s220', size === 'large' ? '=s800' : '=s400');
    }
    return this.getDirectImageUrl(photo.id, size);
  }

  getDirectImageUrl(fileId: string, size: 'medium' | 'large' = 'medium'): string {
    const sizeParam = size === 'large' ? '800' : '400';
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${sizeParam}`;
  }

  // Method for getting public photos (for compatibility)
  async getPublicPhotos(shareUrl: string): Promise<DrivePhoto[]> {
    const folderId = this.extractFolderIdFromUrl(shareUrl);
    if (!folderId) {
      throw new Error('Invalid share URL');
    }
    return this.getPhotosFromFolder(folderId);
  }

  async getDocContent(docId: string): Promise<string> {
    try {
      await this.initializeDrive();
      
      const response = await this.drive!.files.export({
        fileId: docId,
        mimeType: 'text/plain'
      });

      return response.data as string;
    } catch (error) {
      console.error('Error fetching Google Doc content:', error);
      throw error;
    }
  }

  parseAlbumMetadata(docContent: string): AlbumMetadata {
    const lines = docContent.split('\n');
    let inLinksSection = false;

    const metadata: AlbumMetadata = {
      title: '',
      artist: '',
      year: '',
      links: {}
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('TITLE:')) {
        metadata.title = trimmedLine.replace('TITLE:', '').trim();
      } else if (trimmedLine.startsWith('ARTIST:')) {
        metadata.artist = trimmedLine.replace('ARTIST:', '').trim();
      } else if (trimmedLine.startsWith('YEAR:')) {
        metadata.year = trimmedLine.replace('YEAR:', '').trim();
      } else if (trimmedLine.startsWith('LINKS:')) {
        inLinksSection = true;
      } else if (inLinksSection && trimmedLine.length > 0) {
        if (trimmedLine.toLowerCase().includes('spotify')) {
          metadata.links.spotify = trimmedLine;
        } else if (trimmedLine.toLowerCase().includes('apple')) {
          metadata.links.apple = trimmedLine;
        } else if (trimmedLine.toLowerCase().includes('youtube')) {
          metadata.links.youtube = trimmedLine;
        }
      }
    }

    return metadata;
  }

  async getMusicAlbums(musicFolderId: string): Promise<{ [key: string]: any[] }> {
    // Check cache first
    const cached = this.albumsCache.get(musicFolderId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      await this.initializeDrive();
      
      const categories: { [key: string]: any[] } = {
        original: [],
        featured: [],
        upcoming: []
      };

      // Get the three main folders
      const mainFolders = await this.getFoldersInFolder(musicFolderId);
      
      for (const folder of mainFolders) {
        let categoryKey = '';
        
        if (folder.name === 'My Music') {
          categoryKey = 'original';
        } else if (folder.name === 'Featured On') {
          categoryKey = 'featured';
        } else if (folder.name === 'Upcoming') {
          categoryKey = 'upcoming';
        }

        if (categoryKey) {
          // Get album folders from this category folder
          const albumFolders = await this.getFoldersInFolder(folder.id);
          
          for (const albumFolder of albumFolders) {
            try {
              if (categoryKey === 'upcoming') {
                // Handle upcoming albums differently
                const files = await this.getFilesFromFolder(albumFolder.id);
                const docs = files.filter(f => f.mimeType === 'application/vnd.google-apps.document');
                const audioFiles = files.filter(f => f.mimeType?.startsWith('audio/'));
                const imageFiles = files.filter(f => f.mimeType?.startsWith('image/'));
                
                for (const docFile of docs) {
                  try {
                    const docContent = await this.getDocContent(docFile.id);
                    const metadata = this.parseAlbumMetadata(docContent);
                    
                    if (metadata.title) {
                      const customImage = imageFiles.length > 0 ? imageFiles[0] : null;
                      const audioFile = audioFiles.length > 0 ? audioFiles[0] : null;
                      
                      const album = {
                        id: docFile.id,
                        title: metadata.title,
                        artist: metadata.artist,
                        year: metadata.year,
                        links: metadata.links,
                        category: categoryKey,
                        spotifyId: null,
                        coverImageUrl: customImage ? `/api/image/${customImage.id}` : null,
                        customImageFile: customImage,
                        audioFile: audioFile,
                        audioFileId: audioFile?.id || null,
                        createdTime: docFile.createdTime
                      };
                      
                      categories[categoryKey].push(album);
                    }
                  } catch (error) {
                    console.error(`Error processing upcoming document ${docFile.name}:`, error);
                  }
                }
              } else {
                // Handle released albums
                const files = await this.getFilesFromFolder(albumFolder.id, "mimeType='application/vnd.google-apps.document'");
                
                for (const file of files) {
                  try {
                    const docContent = await this.getDocContent(file.id);
                    const metadata = this.parseAlbumMetadata(docContent);
                    
                    if (metadata.title) {
                      const spotifyImageUrl = await this.getSpotifyAlbumCover(metadata.links.spotify || '');
                      
                      const album = {
                        id: file.id,
                        title: metadata.title,
                        artist: metadata.artist,
                        year: metadata.year,
                        links: metadata.links,
                        category: categoryKey,
                        spotifyId: this.extractSpotifyId(metadata.links.spotify || ''),
                        coverImageUrl: spotifyImageUrl,
                        createdTime: file.createdTime
                      };
                      
                      categories[categoryKey].push(album);
                    }
                  } catch (error) {
                    console.error(`Error processing document ${file.name} in folder ${albumFolder.name}:`, error);
                  }
                }
              }
            } catch (error) {
              console.error(`Error processing album folder ${albumFolder.name}:`, error);
            }
          }
        }
      }

      // Cache the result
      this.albumsCache.set(musicFolderId, {
        data: categories,
        timestamp: Date.now()
      });

      return categories;
    } catch (error) {
      console.error('Error fetching music albums:', error);
      throw error;
    }
  }

  // Extract Spotify album ID from URL
  extractSpotifyId(spotifyUrl: string): string | null {
    if (!spotifyUrl) return null;
    const match = spotifyUrl.match(/album\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  // Get file stream for streaming audio files
  async getFileStream(fileId: string) {
    const res = await this.drive!.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });
    return res.data;
  }

  // Get file metadata
  async getFile(fileId: string) {
    const res = await this.drive!.files.get({
      fileId: fileId,
      fields: 'id,name,mimeType,size,createdTime'
    });
    return res.data;
  }

  async getSpotifyAlbumCover(spotifyUrl: string): Promise<string | null> {
    if (!spotifyUrl || !spotifyUrl.includes('spotify.com/album/')) {
      return null;
    }

    try {
      const oEmbedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
      const response = await fetch(oEmbedUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail_url) {
          return data.thumbnail_url;
        }
      }

      // Fallback to direct Spotify image URL construction
      const albumId = this.extractSpotifyId(spotifyUrl);
      return `https://i.scdn.co/image/ab67616d0000b273${albumId}`;
    } catch (error) {
      console.error('Error fetching Spotify album cover:', error);
      return null;
    }
  }

  // Extract folder ID from URL (synchronous method)
  extractFolderIdFromUrl(shareUrl: string): string {
    if (!shareUrl) {
      throw new Error('Share URL is required');
    }
    
    const folderMatch = shareUrl.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    if (folderMatch) {
      return folderMatch[1];
    }
    
    throw new Error('Invalid Google Drive folder URL');
  }

  // High quality image URL helper methods
  getHighQualityImageUrl(fileId: string): string {
    return `/api/image/${fileId}`;
  }

  getThumbnailFromDrive(photo: DrivePhoto, size: 'small' | 'medium' | 'large'): string {
    if (photo.thumbnailLink) {
      const sizeMap = { small: 's220', medium: 's512', large: 's1024' };
      return photo.thumbnailLink.replace('s220', sizeMap[size]);
    }
    return `/api/image/${photo.id}`;
  }

  getDirectImageUrl(fileId: string, size: 'small' | 'medium' | 'large'): string {
    return `/api/image/${fileId}`;
  }

  // New method to get biography content
  async getBiographyContent(biographyFolderId: string): Promise<string> {
    try {
      await this.initializeDrive();
      
      // Get all documents in the biography folder
      const files = await this.getFilesFromFolder(biographyFolderId, "mimeType='application/vnd.google-apps.document'");
      
      if (files.length === 0) {
        return '';
      }

      // Get the first document (assuming there's only one biography doc)
      const biographyDoc = files[0];
      const docContent = await this.getDocContent(biographyDoc.id);
      
      return docContent;
    } catch (error) {
      console.error('Error fetching biography content:', error);
      return '';
    }
  }
}