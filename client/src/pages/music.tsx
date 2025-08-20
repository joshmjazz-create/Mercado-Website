import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Music as MusicIcon, ExternalLink, Edit, Trash2 } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const musicRecordingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  description: z.string().optional(),
  platform: z.enum(["youtube", "spotify", "apple"]),
  url: z.string().url("Please enter a valid URL"),
  releaseDate: z.string().optional(),
  albumTitle: z.string().optional(),
});

type MusicRecordingData = z.infer<typeof musicRecordingSchema>;

const platformIcons = {
  youtube: FaYoutube,
  spotify: FaSpotify,
  apple: FaApple,
};

const platformColors = {
  youtube: "text-[#FF0000]",
  spotify: "text-[#1DB954]",
  apple: "text-[#000000]",
};

export default function Music() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MusicRecordingData>({
    resolver: zodResolver(musicRecordingSchema),
    defaultValues: {
      title: "",
      artist: "",
      description: "",
      platform: "youtube",
      url: "",
      releaseDate: "",
      albumTitle: "",
    },
  });

  const { data: recordings = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/music-recordings'],
  });

  const addRecordingMutation = useMutation({
    mutationFn: async (data: MusicRecordingData) => {
      return apiRequest('POST', '/api/music-recordings', data);
    },
    onSuccess: () => {
      toast({
        title: "Recording Added",
        description: "Your music recording has been added successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/music-recordings'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add recording. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteRecordingMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/music-recordings/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Recording Deleted",
        description: "The recording has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/music-recordings'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete recording. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MusicRecordingData) => {
    addRecordingMutation.mutate(data);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.reset(record);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this recording?")) {
      deleteRecordingMutation.mutate(id);
    }
  };

  const openDialog = () => {
    setEditingRecord(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-jazz-cream via-white to-jazz-cream">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-purple-800 mb-6">Music</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover my musical journey through recordings available on various platforms.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-purple-800">My Recordings</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openDialog} className="bg-purple-800 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recording
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecord ? "Edit Recording" : "Add New Recording"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Song title" />
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
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="spotify">Spotify</SelectItem>
                              <SelectItem value="apple">Apple Music</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="albumTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Album (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Album name" />
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
                            <Textarea {...field} placeholder="About this recording..." rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={addRecordingMutation.isPending}
                      className="w-full bg-purple-800 hover:bg-purple-700"
                    >
                      {addRecordingMutation.isPending ? "Adding..." : (editingRecord ? "Update Recording" : "Add Recording")}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <MusicIcon className="w-12 h-12 mx-auto mb-4 text-purple-800 animate-pulse" />
              <p className="text-gray-600">Loading recordings...</p>
            </div>
          ) : recordings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MusicIcon className="w-16 h-16 mx-auto mb-4 text-purple-800" />
                <h3 className="text-xl font-semibold text-purple-800 mb-2">No Recordings Yet</h3>
                <p className="text-gray-600 mb-4">Start building your music collection by adding your first recording.</p>
                <Button onClick={openDialog} className="bg-purple-800 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Recording
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recordings.map((recording: any) => {
                const PlatformIcon = platformIcons[recording.platform as keyof typeof platformIcons];
                const platformColor = platformColors[recording.platform as keyof typeof platformColors];
                
                return (
                  <Card key={recording.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <PlatformIcon className={`w-5 h-5 ${platformColor}`} />
                          <span className="text-sm text-gray-500 capitalize">{recording.platform}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(recording)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(recording.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight">{recording.title}</CardTitle>
                      <p className="text-sm text-purple-800 font-medium">{recording.artist}</p>
                      {recording.albumTitle && (
                        <p className="text-sm text-gray-600">Album: {recording.albumTitle}</p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      {recording.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{recording.description}</p>
                      )}
                      {recording.releaseDate && (
                        <p className="text-xs text-gray-500 mb-4">Released: {new Date(recording.releaseDate).toLocaleDateString()}</p>
                      )}
                      <a
                        href={recording.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-purple-800 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Listen Now
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}