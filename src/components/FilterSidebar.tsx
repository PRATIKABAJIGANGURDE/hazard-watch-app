import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, RefreshCw, Calendar, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface FilterSidebarProps {
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  showVerifiedOnly: boolean;
  onVerifiedChange: (verified: boolean) => void;
  isOpen: boolean;
}

const hazardTypes = [
  { id: 'tsunami', label: 'Tsunami', color: 'hazard-tsunami', count: 1 },
  { id: 'flood', label: 'Coastal Flood', color: 'hazard-flood', count: 1 },
  { id: 'waves', label: 'High Waves', color: 'hazard-waves', count: 1 },
  { id: 'tide', label: 'Unusual Tide', color: 'hazard-tide', count: 1 }
];

const timeRanges = [
  { id: 'all', label: 'All Time' },
  { id: '1h', label: 'Last Hour' },
  { id: '6h', label: 'Last 6 Hours' },
  { id: '24h', label: 'Last 24 Hours' },
  { id: '7d', label: 'Last 7 Days' }
];

export function FilterSidebar({ 
  selectedTypes, 
  onTypeChange, 
  showVerifiedOnly, 
  onVerifiedChange,
  isOpen 
}: FilterSidebarProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  
  const handleTypeToggle = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onTypeChange(selectedTypes.filter(t => t !== typeId));
    } else {
      onTypeChange([...selectedTypes, typeId]);
    }
  };

  const clearAllFilters = () => {
    onTypeChange([]);
    onVerifiedChange(false);
    setSelectedTimeRange('all');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="w-80 bg-card border-r flex-shrink-0 overflow-y-auto"
    >
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>

        {/* Quick Stats */}
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-3">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Total Reports</span>
              <Badge variant="secondary">24</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Verified</span>
              <Badge className="status-verified">16</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Pending</span>
              <Badge className="status-pending">8</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>High Priority</span>
              <Badge className="status-alert">3</Badge>
            </div>
          </div>
        </Card>

        {/* Hazard Types */}
        <div>
          <h3 className="text-sm font-medium mb-3">Hazard Types</h3>
          <div className="space-y-2">
            {hazardTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-3">
                <Checkbox
                  id={type.id}
                  checked={selectedTypes.includes(type.id)}
                  onCheckedChange={() => handleTypeToggle(type.id)}
                />
                <Label 
                  htmlFor={type.id} 
                  className="flex-1 cursor-pointer flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                    {type.label}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {type.count}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Verification Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <Label htmlFor="verified-only">Verified Only</Label>
          </div>
          <Switch
            id="verified-only"
            checked={showVerifiedOnly}
            onCheckedChange={onVerifiedChange}
          />
        </div>

        <Separator />

        {/* Time Range */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Time Range
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.id}
                variant={selectedTimeRange === range.id ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => setSelectedTimeRange(range.id)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Refresh Data */}
        <Button 
          className="w-full gradient-ocean text-white" 
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>

        {/* Alert Notice */}
        <Card className="p-3 bg-warning/10 border-warning/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-warning mb-1">High Activity Alert</p>
              <p className="text-muted-foreground">
                Increased tsunami activity detected in the Bay of Bengal. 
                Monitor coastal areas closely.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}