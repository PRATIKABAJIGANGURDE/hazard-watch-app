import { useState } from 'react';
import { motion } from 'framer-motion';

interface HazardReport {
  id: string;
  type: 'tsunami' | 'flood' | 'waves' | 'tide';
  location: { lat: number; lng: number; name: string };
  title: string;
  description: string;
  verified: boolean;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

// Sample hazard data for demonstration
const sampleReports: HazardReport[] = [
  {
    id: '1',
    type: 'tsunami',
    location: { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu' },
    title: 'Unusual Wave Activity',
    description: 'Higher than normal waves observed near Marina Beach',
    verified: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'high'
  },
  {
    id: '2',
    type: 'flood',
    location: { lat: 15.2993, lng: 74.1240, name: 'Panaji, Goa' },
    title: 'Coastal Flooding',
    description: 'Streets flooded due to high tide',
    verified: false,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    severity: 'medium'
  },
  {
    id: '3',
    type: 'waves',
    location: { lat: 11.9416, lng: 79.8083, name: 'Puducherry' },
    title: 'High Wave Alert',
    description: 'Fishermen warned about rough sea conditions',
    verified: true,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    severity: 'medium'
  },
  {
    id: '4',
    type: 'tide',
    location: { lat: 9.9312, lng: 76.2673, name: 'Kochi, Kerala' },
    title: 'Abnormal Tide Pattern',
    description: 'Tidal levels 2 meters above normal',
    verified: false,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    severity: 'low'
  }
];

interface HazardMapProps {
  selectedTypes: string[];
  showVerifiedOnly: boolean;
}

export function HazardMap({ selectedTypes, showVerifiedOnly }: HazardMapProps) {
  const [reports] = useState<HazardReport[]>(sampleReports);

  const filteredReports = reports.filter(report => {
    if (selectedTypes.length > 0 && !selectedTypes.includes(report.type)) {
      return false;
    }
    if (showVerifiedOnly && !report.verified) {
      return false;
    }
    return true;
  });

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const getHazardColor = (type: string, verified: boolean) => {
    const colors = {
      tsunami: verified ? 'bg-red-500' : 'bg-red-300',
      flood: verified ? 'bg-blue-500' : 'bg-blue-300',
      waves: verified ? 'bg-indigo-500' : 'bg-indigo-300',
      tide: verified ? 'bg-teal-500' : 'bg-teal-300'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full w-full rounded-lg overflow-hidden shadow-card relative bg-gradient-depth"
    >
      {/* Placeholder Map Background */}
      <div className="h-full w-full gradient-depth flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"></div>
        
        {/* Simulated Map Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-primary/20"></div>
            ))}
          </div>
        </div>
        
        {/* Coast Line Simulation */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 800 600" fill="none">
            <path 
              d="M50 300 Q200 250 350 300 T650 350 L800 400 L800 600 L0 600 Z" 
              fill="hsl(var(--primary))" 
              fillOpacity="0.1"
            />
            <path 
              d="M50 300 Q200 250 350 300 T650 350" 
              stroke="hsl(var(--primary))" 
              strokeWidth="2"
              strokeOpacity="0.4"
            />
          </svg>
        </div>
        
        {/* Hazard Markers */}
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="absolute cursor-pointer group"
            style={{
              left: `${20 + (report.location.lng - 70) * 8}%`,
              top: `${60 - (report.location.lat - 8) * 8}%`
            }}
          >
            <div className={`
              w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-300
              ${getHazardColor(report.type, report.verified)}
              ${!report.verified ? 'animate-pulse' : ''}
              group-hover:scale-125 group-hover:shadow-xl
            `}></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="bg-card border shadow-card rounded-lg p-3 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full text-white ${getHazardColor(report.type, true)}`}>
                    {report.type.toUpperCase()}
                  </span>
                  {report.verified && (
                    <span className="status-verified px-2 py-1 text-xs rounded-full">
                      Verified
                    </span>
                  )}
                  {!report.verified && (
                    <span className="status-pending px-2 py-1 text-xs rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-1">{report.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {report.description}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>📍 {report.location.name}</span>
                  <span>{formatTimeAgo(report.timestamp)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Map Placeholder Text */}
        <div className="text-center text-muted-foreground z-0">
          <div className="text-lg font-semibold mb-2">INCOIS Hazard Map</div>
          <div className="text-sm">Interactive map integration ready</div>
          <div className="text-xs mt-1">Indian Ocean Region Coverage</div>
        </div>
      </div>
      
      {/* Map overlay with stats */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-card">
        <div className="text-xs text-muted-foreground mb-1">Live Reports</div>
        <div className="text-lg font-semibold">{filteredReports.length}</div>
        <div className="flex gap-2 mt-2">
          {filteredReports.filter(r => r.verified).length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              {filteredReports.filter(r => r.verified).length} Verified
            </div>
          )}
          {filteredReports.filter(r => !r.verified).length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              {filteredReports.filter(r => !r.verified).length} Pending
            </div>
          )}
        </div>
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-card">
        <div className="text-xs font-medium mb-2">Hazard Types</div>
        <div className="space-y-1">
          {[
            { type: 'tsunami', label: 'Tsunami', color: 'bg-red-500' },
            { type: 'flood', label: 'Flood', color: 'bg-blue-500' },
            { type: 'waves', label: 'High Waves', color: 'bg-indigo-500' },
            { type: 'tide', label: 'Unusual Tide', color: 'bg-teal-500' }
          ].map(item => (
            <div key={item.type} className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}