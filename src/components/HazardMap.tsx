import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, Waves, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface HazardReport {
  id: string;
  type: 'tsunami' | 'flood' | 'waves' | 'tide';
  location: string;
  coordinates: [number, number];
  title: string;
  description: string;
  verified: boolean;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reporter: string;
}

// Sample data with Indian Ocean coordinates
const sampleReports: HazardReport[] = [
  {
    id: '1',
    type: 'tsunami',
    location: 'Chennai Coast',
    coordinates: [13.0827, 80.2707],
    title: 'Unusual Wave Activity',
    description: 'Observed larger than normal waves approaching the coastline with rapid water recession.',
    verified: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'critical',
    reporter: 'Coastal Guard Station'
  },
  {
    id: '2',
    type: 'flood',
    location: 'Visakhapatnam',
    coordinates: [17.6868, 83.2185],
    title: 'Coastal Flooding',
    description: 'Heavy rainfall causing flooding in low-lying coastal areas.',
    verified: true,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    severity: 'high',
    reporter: 'Local Observer'
  },
  {
    id: '3',
    type: 'waves',
    location: 'Kochi Harbor',
    coordinates: [9.9312, 76.2673],
    title: 'High Wave Alert',
    description: 'Wave heights exceeding 3 meters observed near the harbor entrance.',
    verified: false,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    severity: 'medium',
    reporter: 'Harbor Master'
  },
  {
    id: '4',
    type: 'tide',
    location: 'Puducherry',
    coordinates: [11.9416, 79.8083],
    title: 'Abnormal Tide Pattern',
    description: 'Tidal levels 2 meters above normal observed at the harbor.',
    verified: false,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    severity: 'low',
    reporter: 'Port Authority'
  }
];

interface HazardMapProps {
  selectedTypes: string[];
  showVerifiedOnly: boolean;
}

// Custom map bounds adjuster
function MapBoundsUpdater({ reports }: { reports: HazardReport[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(reports.map(r => r.coordinates));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, reports]);
  
  return null;
}

export function HazardMap({ selectedTypes, showVerifiedOnly }: HazardMapProps) {
  const [reports] = useState<HazardReport[]>(sampleReports);

  // Filter reports based on props
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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    }
    return `${diffMins}m ago`;
  };

  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'tsunami': return '🌊';
      case 'flood': return '💧';
      case 'waves': return '〰️';
      case 'tide': return '🌀';
      default: return '⚠️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const createCustomIcon = (report: HazardReport) => {
    const color = report.verified ? '#22c55e' : '#f59e0b';
    const severityColor = getSeverityColor(report.severity);
    
    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          width: 24px;
          height: 24px;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            top: -6px;
            right: -6px;
            width: 12px;
            height: 12px;
            background: ${severityColor};
            border: 2px solid white;
            border-radius: 50%;
            font-size: 8px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
          ">!</div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden shadow-ocean">
      <MapContainer
        center={[13.0827, 80.2707]} // Chennai coordinates as default center
        zoom={6}
        className="h-full w-full z-0"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <MapBoundsUpdater reports={filteredReports} />
        
        {filteredReports.map((report) => (
          <Marker
            key={report.id}
            position={report.coordinates}
            icon={createCustomIcon(report)}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[220px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getHazardIcon(report.type)}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{report.title}</h3>
                    <p className="text-xs text-muted-foreground">{report.location}</p>
                  </div>
                </div>
                
                <p className="text-xs mb-3 text-foreground">{report.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {report.verified ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Clock className="h-3 w-3 text-yellow-500" />
                    )}
                    <span className="text-xs font-medium">
                      {report.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className="text-xs text-white"
                    style={{ backgroundColor: getSeverityColor(report.severity) }}
                  >
                    {report.severity.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(report.timestamp)}
                  </div>
                  <span className="text-xs">by {report.reporter}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map overlay info */}
      <div className="absolute top-4 left-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-card border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Waves className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Live Reports</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-card border"
        >
          <h4 className="font-semibold text-xs mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
              <span>Pending</span>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSeverityColor('critical') }}></div>
                <span className="text-xs">Critical</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSeverityColor('high') }}></div>
                <span className="text-xs">High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSeverityColor('medium') }}></div>
                <span className="text-xs">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSeverityColor('low') }}></div>
                <span className="text-xs">Low</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}