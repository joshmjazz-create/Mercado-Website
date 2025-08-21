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

  async getFoldersInFolder(folderId: string): Promise<any[]> {
    try {
      await this.initializeDrive();
      
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id,name,createdTime)',
        orderBy: 'name asc',
        pageSize: 100,
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error fetching folders from Drive folder:', error);
      throw error;
    }
  }

  async getFilesFromFolder(folderId: string, mimeTypeFilter?: string): Promise<any[]> {
    try {
      await this.initializeDrive();
      
      let query = `'${folderId}' in parents`;
      if (mimeTypeFilter) {
        query += ` and ${mimeTypeFilter}`;
      }
      
      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,createdTime,size)',
        orderBy: 'name asc',
        pageSize: 100,
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error fetching files from Drive folder:', error);
      throw error;
    }
  }

  async searchFoldersRecursively(parentFolderId: string, searchTerm: string): Promise<any[]> {
    try {
      await this.initializeDrive();
      
      // Search for folders containing the search term within the parent folder
      const response = await this.drive.files.list({
        q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and name contains '${searchTerm}'`,
        fields: 'files(id,name,createdTime)',
        orderBy: 'name asc',
        pageSize: 100,
      });

      let results = response.data.files || [];
      
      // Also search within subfolders
      const subfolders = await this.getFoldersInFolder(parentFolderId);
      for (const subfolder of subfolders) {
        const subResults = await this.searchFoldersRecursively(subfolder.id, searchTerm);
        results = results.concat(subResults);
      }

      return results;
    } catch (error) {
      console.error('Error searching folders recursively:', error);
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

  // Get content from Google Docs
  async getDocContent(fileId: string): Promise<string> {
    try {
      await this.initializeDrive();
      
      // Export Google Doc as plain text
      const response = await this.drive.files.export({
        fileId: fileId,
        mimeType: 'text/plain',
      });

      return response.data || '';
    } catch (error) {
      console.error('Error fetching Google Doc content:', error);
      throw error;
    }
  }

  // Parse album metadata from Google Doc content
  parseAlbumMetadata(docContent: string): any {
    const metadata: any = {
      title: '',
      artist: '',
      year: '',
      links: {}
    };

    const lines = docContent.split('\n');
    let inLinksSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('TITLE:')) {
        metadata.title = trimmedLine.replace('TITLE:', '').trim();
      } else if (trimmedLine.startsWith('ARTIST:')) {
        metadata.artist = trimmedLine.replace('ARTIST:', '').trim();
      } else if (trimmedLine.startsWith('YEAR:')) {
        metadata.year = trimmedLine.replace('YEAR:', '').trim();
      } else if (trimmedLine === 'LINKS:') {
        inLinksSection = true;
      } else if (inLinksSection && trimmedLine.includes(' - ')) {
        const [platform, url] = trimmedLine.split(' - ');
        if (platform && url) {
          const platformKey = platform.toLowerCase().replace(/\s+/g, '');
          metadata.links[platformKey] = url.trim();
        }
      }
    }

    return metadata;
  }

  // Cache for albums data
  private albumsCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // Get albums from music folders structure
  async getMusicAlbums(musicFolderId: string): Promise<any> {
    // Check cache first
    const cached = this.albumsCache.get(musicFolderId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
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
          // Get album folders from this category folder (My Music, Featured On, Upcoming)
          const albumFolders = await this.getFoldersInFolder(folder.id);
          
          // Process albums in parallel for this category
          const albumPromises = albumFolders.map(async (albumFolder) => {
            try {
              if (categoryKey === 'upcoming') {
                // Handle upcoming albums differently - look for audio files and custom images
                const files = await this.getFilesFromFolder(albumFolder.id);
                const docs = files.filter(f => f.mimeType === 'application/vnd.google-apps.document');
                const audioFiles = files.filter(f => f.mimeType?.startsWith('audio/'));
                const imageFiles = files.filter(f => f.mimeType?.startsWith('image/'));
                
                if (docs.length > 0) {
                  // Process documents in parallel
                  const docPromises = docs.map(async (docFile) => {
                    try {
                      const docContent = await this.getDocContent(docFile.id);
                      const metadata = this.parseAlbumMetadata(docContent);
                      
                      if (metadata.title) {
                        // Use custom image from folder if available
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
                  });

                  await Promise.all(docPromises);
                }
              } else {
                // Handle released albums (My Music, Featured On) - existing logic
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
          });

          // Wait for all album processing to complete
          await Promise.all(albumPromises);
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
    const res = await this.drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });
    return res.data;
  }

  // Get file metadata
  async getFile(fileId: string) {
    const res = await this.drive.files.get({
      fileId: fileId,
      fields: 'id,name,mimeType,size,createdTime'
    });
    return res.data;
  }

  // Get Spotify album cover using public OEmbed API
  async getSpotifyAlbumCover(spotifyUrl: string): Promise<string | null> {
    try {
      if (!spotifyUrl) return null;
      
      const albumId = this.extractSpotifyId(spotifyUrl);
      if (!albumId) return null;
      
      // Use Spotify's oEmbed API which is public and doesn't require authentication
      const oEmbedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
      const response = await fetch(oEmbedUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail_url) {
          // Convert thumbnail to higher resolution
          return data.thumbnail_url.replace('cover-size', '640');
        }
      }
      
      // Fallback: construct direct Spotify image URL
      // This works for many albums and doesn't require API key
      return `https://i.scdn.co/image/ab67616d0000b273${albumId}`;
    } catch (error) {
      console.error('Error fetching Spotify album cover:', error);
      return null;
    }
  }
}

export const googleDriveService = new GoogleDriveService();