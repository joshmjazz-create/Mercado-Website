import { Switch, Route, useLocation } from "wouter";
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
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const isScrollablePage = location === '/gallery' || location === '/music';
  
  return (
    <div className={`min-h-screen flex flex-col ${!isScrollablePage ? 'md:h-screen md:overflow-hidden' : ''}`}>
      <Navigation />
      <main className={`flex-1 ${!isScrollablePage ? 'md:overflow-hidden' : ''}`}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/bio" component={Bio} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/music" component={Music} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/contact" component={Contact} />
          <Route path="/flexlist" component={FlexList} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <div className={isScrollablePage ? 'md:block' : 'hidden md:block'}>
        <Footer />
      </div>
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
