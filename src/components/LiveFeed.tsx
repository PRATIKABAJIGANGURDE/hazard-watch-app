import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  MessageSquare,
  Share
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FeedItem {
  id: string;
  type: 'report' | 'verification' | 'alert' | 'social';
  title: string;
  description: string;
  location?: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high';
  verified?: boolean;
  hazardType?: string;
  source?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

const sampleFeedItems: FeedItem[] = [
  {
    id: '1',
    type: 'report',
    title: 'Unusual Wave Activity Reported',
    description: 'Local fishermen report waves 3-4 meters higher than normal near Marina Beach, Chennai. Multiple boats returned early.',
    location: 'Chennai, Tamil Nadu',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    severity: 'high',
    verified: false,
    hazardType: 'tsunami'
  },
  {
    id: '2',
    type: 'verification',
    title: 'Coastal Flood Report Verified',
    description: 'INCOIS analysts have confirmed flooding in Goa coastal areas. Tide levels 2.1m above normal.',
    location: 'Panaji, Goa',
    timestamp: new Date(Date.now() - 32 * 60 * 1000),
    verified: true,
    hazardType: 'flood'
  },
  {
    id: '3',
    type: 'alert',
    title: 'High Wave Warning Issued',
    description: 'Official warning issued for Puducherry coast. Wave heights expected to reach 4-5 meters.',
    location: 'Puducherry',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    severity: 'high',
    verified: true,
    hazardType: 'waves'
  },
  {
    id: '4',
    type: 'social',
    title: 'Fisherman Safety Alert Trending',
    description: '#FishermanSafety trending as coastal communities share safety tips and weather updates.',
    timestamp: new Date(Date.now() - 62 * 60 * 1000),
    source: 'Social Media',
    engagement: {
      likes: 234,
      comments: 45,
      shares: 67
    }
  },
  {
    id: '5',
    type: 'report',
    title: 'Abnormal Tidal Behavior',
    description: 'Tide gauge stations recording irregular patterns. Water levels fluctuating beyond normal range.',
    location: 'Kochi, Kerala',
    timestamp: new Date(Date.now() - 95 * 60 * 1000),
    severity: 'medium',
    verified: false,
    hazardType: 'tide'
  }
];

interface LiveFeedProps {
  isOpen: boolean;
}

export function LiveFeed({ isOpen }: LiveFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>(sampleFeedItems);

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const getItemIcon = (item: FeedItem) => {
    switch (item.type) {
      case 'report':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'verification':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'alert':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'social':
        return <TrendingUp className="h-4 w-4 text-accent" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    
    const variants = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[severity as keyof typeof variants]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-96 bg-card border-l flex-shrink-0 flex flex-col"
    >
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          Live Feed
        </h2>
        <p className="text-sm text-muted-foreground">Real-time hazard reports and updates</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {feedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 hover:shadow-card transition-smooth cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-full">
                    {getItemIcon(item)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium leading-tight">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {getSeverityBadge(item.severity)}
                        {item.verified !== undefined && (
                          <Badge className={item.verified ? 'status-verified' : 'status-pending'}>
                            {item.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </span>
                        )}
                        {item.source && (
                          <span className="flex items-center gap-1">
                            <Share className="h-3 w-3" />
                            {item.source}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                    
                    {item.engagement && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-red-500"></span>
                          {item.engagement.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {item.engagement.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share className="h-3 w-3" />
                          {item.engagement.shares}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full text-xs">
          Load More Updates
        </Button>
      </div>
    </motion.div>
  );
}