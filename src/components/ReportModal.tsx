import { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  MapPin, 
  Camera, 
  Upload, 
  AlertTriangle,
  Loader2,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const hazardTypes = [
  { value: 'tsunami', label: 'Tsunami / Unusual Waves', icon: '🌊' },
  { value: 'flood', label: 'Coastal Flooding', icon: '💧' },
  { value: 'waves', label: 'High Waves', icon: '🌪️' },
  { value: 'tide', label: 'Unusual Tide Patterns', icon: '🔄' }
];

const severityLevels = [
  { value: 'low', label: 'Low - Minor concern', color: 'text-blue-600' },
  { value: 'medium', label: 'Medium - Moderate risk', color: 'text-yellow-600' },
  { value: 'high', label: 'High - Immediate danger', color: 'text-red-600' }
];

export function ReportModal({ open, onOpenChange }: ReportModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    severity: '',
    title: '',
    description: '',
    location: '',
    coordinates: null as { lat: number; lng: number } | null,
    media: null as File | null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
          setIsGettingLocation(false);
          toast({
            title: "Location captured",
            description: "Your current location has been recorded.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          toast({
            title: "Location access denied",
            description: "Please enter your location manually or enable GPS.",
            variant: "destructive"
          });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setIsGettingLocation(false);
      toast({
        title: "Geolocation not supported",
        description: "Please enter your location manually.",
        variant: "destructive"
      });
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
      setFormData(prev => ({ ...prev, media: file }));
      toast({
        title: "Media attached",
        description: `${file.name} has been attached to your report.`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call with offline storage fallback
    try {
      // In a real app, this would attempt to send to the server
      // If offline, store in IndexedDB for later sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store locally (offline-first approach)
      const report = {
        ...formData,
        id: Date.now().toString(),
        timestamp: new Date(),
        status: 'pending',
        synced: navigator.onLine
      };
      
      // Store in localStorage for demo (would use IndexedDB in production)
      const existingReports = JSON.parse(localStorage.getItem('pendingReports') || '[]');
      existingReports.push(report);
      localStorage.setItem('pendingReports', JSON.stringify(existingReports));
      
      toast({
        title: "Report submitted successfully",
        description: navigator.onLine 
          ? "Your report has been sent to INCOIS for verification."
          : "Report saved offline. Will sync when connection is restored.",
      });
      
      // Reset form
      setFormData({
        type: '',
        severity: '',
        title: '',
        description: '',
        location: '',
        coordinates: null,
        media: null
      });
      
      onOpenChange(false);
      
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Report saved locally. Will retry when online.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Report Hazard Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Event Type *
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hazard type" />
              </SelectTrigger>
              <SelectContent>
                {hazardTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity" className="text-sm font-medium">
              Severity Level
            </Label>
            <Select 
              value={formData.severity} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    <span className={level.color}>{level.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Brief Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Unusual wave activity at Marina Beach"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Detailed Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what you observed, when it started, current conditions, and any safety concerns..."
              className="min-h-[100px] resize-none"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter location or use GPS"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="px-3"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formData.coordinates && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-success" />
                GPS coordinates captured: {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Photo/Video Evidence</Label>
            <Card className="border-dashed border-2 p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                {formData.media ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-8 w-8 text-success mx-auto" />
                    <p className="text-sm font-medium">Media attached</p>
                    <p className="text-xs text-muted-foreground">{formData.media.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm font-medium">Click to upload photo or video</p>
                    <p className="text-xs text-muted-foreground">Max file size: 10MB</p>
                  </div>
                )}
              </label>
            </Card>
          </div>

          {/* Offline Notice */}
          {!navigator.onLine && (
            <Card className="p-3 bg-warning/10 border-warning/20">
              <div className="flex items-center gap-2 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" />
                <span>You're offline. Report will be saved locally and synced when connection is restored.</span>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.type || !formData.description}
              className="gradient-ocean text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}