import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import Home from "@/pages/home";
import Bio from "@/pages/bio";
import Gallery from "@/pages/gallery";
import Music from "@/pages/music";
import Schedule from "@/pages/schedule";
import Contact from "@/pages/contact";
import FlexList from "@/pages/flexlist";
import Debug from "@/pages/debug";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/bio" component={Bio} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/music" component={Music} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/contact" component={Contact} />
          <Route path="/flexlist" component={FlexList} />
          <Route path="/debug" component={Debug} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
