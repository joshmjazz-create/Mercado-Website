import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, ExternalLink, Edit, Trash2 } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const albumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  description: z.string().optional(),
  coverImageUrl: z.string().url("Please enter a valid cover image URL"),
  spotifyUrl: z.string().url().optional().or(z.literal("")),
  appleMusicUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  releaseDate: z.string().optional(),
  isOriginal: z.boolean().default(true),
});

type AlbumData = z.infer<typeof albumSchema>;

interface Album extends AlbumData {
  id: string;
  createdAt: Date;
}

export default function Music() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AlbumData>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: "",
      artist: "",
      description: "",
      coverImageUrl: "",
      spotifyUrl: "",
      appleMusicUrl: "",
      youtubeUrl: "",
      releaseDate: "",
      isOriginal: true,
    },
  });

  const { data: albums = [], isLoading } = useQuery<Album[]>({
    queryKey: ['/api/albums'],
  });

  const addAlbumMutation = useMutation({
    mutationFn: async (data: AlbumData) => {
      if (editingAlbum) {
        return apiRequest('PUT', `/api/albums/${editingAlbum.id}`, data);
      }
      return apiRequest('POST', '/api/albums', data);
    },
    onSuccess: () => {
      toast({
        title: editingAlbum ? "Album Updated" : "Album Added",
        description: editingAlbum 
          ? "Your album has been updated successfully." 
          : "Your album has been added successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
      setEditingAlbum(null);
      queryClient.invalidateQueries({ queryKey: ['/api/albums'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${editingAlbum ? 'update' : 'add'} album. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/albums/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Album Deleted",
        description: "The album has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/albums'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete album. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AlbumData) => {
    addAlbumMutation.mutate(data);
  };

  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
    form.reset(album);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this album?")) {
      deleteAlbumMutation.mutate(id);
    }
  };

  const openDialog = () => {
    setEditingAlbum(null);
    form.reset({
      title: "",
      artist: "",
      description: "",
      coverImageUrl: "",
      spotifyUrl: "",
      appleMusicUrl: "",
      youtubeUrl: "",
      releaseDate: "",
      isOriginal: true,
    });
    setIsDialogOpen(true);
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    setShowPlatforms(true);
  };

  const openPlatform = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
    }
    setShowPlatforms(false);
  };

  const originalAlbums = albums.filter(album => album.isOriginal);
  const featuredAlbums = albums.filter(album => !album.isOriginal);

  return (
    <section className="min-h-screen bg-gradient-to-br from-jazz-cream via-white to-jazz-cream">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-purple-800 mb-6">Music</h1>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Add Album Button for Admin */}
          <div className="flex justify-end mb-8">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openDialog} className="bg-purple-800 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Album
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingAlbum ? "Edit Album" : "Add New Album"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Album Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Album title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="artist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Artist</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Artist name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="coverImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Image URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isOriginal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Original Music</SelectItem>
                              <SelectItem value="false">Featured On</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="spotifyUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spotify URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://open.spotify.com/..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="appleMusicUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apple Music URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://music.apple.com/..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="youtubeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://youtube.com/..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="releaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Date (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="About this album..." rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={addAlbumMutation.isPending}
                      className="w-full bg-purple-800 hover:bg-purple-700"
                    >
                      {addAlbumMutation.isPending ? "Adding..." : (editingAlbum ? "Update Album" : "Add Album")}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Original Music Section */}
          <div className="mb-16">
            {originalAlbums.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {originalAlbums.map((album) => (
                  <div key={album.id} className="relative group">
                    <div 
                      className="cursor-pointer transform transition-transform hover:scale-105"
                      onClick={() => handleAlbumClick(album)}
                    >
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-semibold text-purple-800">{album.title}</h3>
                      <p className="text-sm text-gray-600">{album.artist}</p>
                      {album.releaseDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(album.releaseDate).getFullYear()}
                        </p>
                      )}
                    </div>
                    {/* Admin controls */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(album);
                          }}
                          className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(album.id);
                          }}
                          className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured On Section */}
          {featuredAlbums.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-purple-800 text-center mb-8">Featured On</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredAlbums.map((album) => (
                  <div key={album.id} className="relative group">
                    <div 
                      className="cursor-pointer transform transition-transform hover:scale-105"
                      onClick={() => handleAlbumClick(album)}
                    >
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-semibold text-purple-800">{album.title}</h3>
                      <p className="text-sm text-gray-600">{album.artist}</p>
                      {album.releaseDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(album.releaseDate).getFullYear()}
                        </p>
                      )}
                    </div>
                    {/* Admin controls */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(album);
                          }}
                          className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(album.id);
                          }}
                          className="h-8 w-8 p-0 bg-black bg-opacity-50 hover:bg-opacity-70"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Selection Modal */}
          {showPlatforms && selectedAlbum && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPlatforms(false)}
            >
              <div 
                className="bg-white rounded-lg p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-center mb-4">Listen to {selectedAlbum.title}</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => openPlatform(selectedAlbum.spotifyUrl)}
                    disabled={!selectedAlbum.spotifyUrl}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <FaSpotify className="w-6 h-6 text-[#1DB954]" />
                      <span>Spotify</span>
                    </div>
                    {!selectedAlbum.spotifyUrl && <span className="text-sm text-gray-500">Not available</span>}
                  </button>
                  
                  <button
                    onClick={() => openPlatform(selectedAlbum.appleMusicUrl)}
                    disabled={!selectedAlbum.appleMusicUrl}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <FaApple className="w-6 h-6 text-[#000000]" />
                      <span>Apple Music</span>
                    </div>
                    {!selectedAlbum.appleMusicUrl && <span className="text-sm text-gray-500">Not available</span>}
                  </button>
                  
                  <button
                    onClick={() => openPlatform(selectedAlbum.youtubeUrl)}
                    disabled={!selectedAlbum.youtubeUrl}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <FaYoutube className="w-6 h-6 text-[#FF0000]" />
                      <span>YouTube</span>
                    </div>
                    {!selectedAlbum.youtubeUrl && <span className="text-sm text-gray-500">Not available</span>}
                  </button>
                </div>
                <button
                  onClick={() => setShowPlatforms(false)}
                  className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}