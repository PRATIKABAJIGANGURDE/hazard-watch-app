import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "./Navigation";
import { FilterSidebar } from "./FilterSidebar";
import { HazardMap } from "./HazardMap";
import { LiveFeed } from "./LiveFeed";
import { ReportModal } from "./ReportModal";

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [feedOpen, setFeedOpen] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  // Filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navigation 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleFeed={() => setFeedOpen(!feedOpen)}
        sidebarOpen={sidebarOpen}
        feedOpen={feedOpen}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Filters */}
        <FilterSidebar 
          selectedTypes={selectedTypes}
          onTypeChange={setSelectedTypes}
          showVerifiedOnly={showVerifiedOnly}
          onVerifiedChange={setShowVerifiedOnly}
          isOpen={sidebarOpen}
        />
        
        {/* Main Map Area */}
        <main className="flex-1 relative">
          <HazardMap 
            selectedTypes={selectedTypes}
            showVerifiedOnly={showVerifiedOnly}
          />
          
          {/* Floating Report Button */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute bottom-6 right-6"
          >
            <Button
              size="lg"
              onClick={() => setReportModalOpen(true)}
              className="gradient-ocean text-primary-foreground shadow-ocean hover:shadow-float transition-smooth hover:scale-105 h-14 px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Report Hazard
            </Button>
          </motion.div>
        </main>
        
        {/* Right Sidebar - Live Feed */}
        <LiveFeed isOpen={feedOpen} />
      </div>
      
      {/* Report Modal */}
      <ReportModal 
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
      />
    </div>
  );
}