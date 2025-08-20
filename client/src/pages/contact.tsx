import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, Music, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertContactSchema } from "@shared/schema";

const contactFormSchema = insertContactSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Please provide more details about your event"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: null,
      eventType: null,
      eventDate: null,
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest('POST', '/api/contacts', data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully!",
        description: "Thank you for your inquiry. I'll get back to you within 24 hours.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-jazz-dark mb-4">Get In Touch</h2>
          <p className="text-xl text-gray-600 mb-8">Ready to bring jazz magic to your event? Let's connect!</p>
          <div className="w-24 h-1 bg-jazz-teal mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-gray-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-jazz-dark mb-6 flex items-center gap-3">
                <Mail className="text-jazz-green" />
                Send a Message
              </h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-jazz-dark font-semibold">First Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="focus:ring-jazz-teal" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-jazz-dark font-semibold">Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="focus:ring-jazz-teal" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-jazz-dark font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} className="focus:ring-jazz-teal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-jazz-dark font-semibold">Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} className="focus:ring-jazz-teal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-jazz-dark font-semibold">Event Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus:ring-jazz-teal">
                              <SelectValue placeholder="Select an event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="wedding">Wedding</SelectItem>
                            <SelectItem value="corporate">Corporate Event</SelectItem>
                            <SelectItem value="private-party">Private Party</SelectItem>
                            <SelectItem value="jazz-club">Jazz Club Booking</SelectItem>
                            <SelectItem value="festival">Festival</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-jazz-dark font-semibold">Preferred Event Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="focus:ring-jazz-teal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-jazz-dark font-semibold">Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={4} 
                            placeholder="Tell me more about your event..."
                            className="focus:ring-jazz-teal"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={contactMutation.isPending}
                    className="w-full bg-jazz-teal hover:bg-jazz-blue text-white font-semibold py-4"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-jazz-dark mb-6 flex items-center gap-3">
                  <Mail className="text-jazz-blue" />
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-jazz-green text-white p-3 rounded-lg mr-4">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-jazz-dark">Email</p>
                      <p className="text-gray-600">joshua.mercado@jazzmusic.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-jazz-blue text-white p-3 rounded-lg mr-4">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-jazz-dark">Phone</p>
                      <p className="text-gray-600">(555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-jazz-teal text-white p-3 rounded-lg mr-4">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-jazz-dark">Based in</p>
                      <p className="text-gray-600">New York City, NY</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-jazz-dark mb-6 flex items-center gap-3">
                  <Music className="text-jazz-green" />
                  Follow Me
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href="#" 
                    className="flex items-center justify-center bg-jazz-dark hover:bg-jazz-teal text-white p-4 rounded-lg transition-colors duration-300"
                  >
                    <Instagram className="w-5 h-5 mr-2" />
                    Instagram
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center bg-jazz-dark hover:bg-jazz-blue text-white p-4 rounded-lg transition-colors duration-300"
                  >
                    <Music className="w-5 h-5 mr-2" />
                    Spotify
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center bg-jazz-dark hover:bg-jazz-green text-white p-4 rounded-lg transition-colors duration-300"
                  >
                    <Youtube className="w-5 h-5 mr-2" />
                    YouTube
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center justify-center bg-jazz-dark hover:bg-jazz-teal text-white p-4 rounded-lg transition-colors duration-300"
                  >
                    <Music className="w-5 h-5 mr-2" />
                    SoundCloud
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-jazz-green text-white rounded-xl p-8 text-center">
              <Music className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Ready to Book?</h4>
              <p className="mb-4">Let's create an unforgettable musical experience together.</p>
              <p className="text-lg font-semibold">Response within 24 hours guaranteed!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
