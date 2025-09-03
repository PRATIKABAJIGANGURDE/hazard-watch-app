import { useState } from "react";
import { Bell, User, AlertTriangle, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface NavigationProps {
  onToggleSidebar: () => void;
  onToggleFeed: () => void;
  sidebarOpen: boolean;
  feedOpen: boolean;
}

export function Navigation({ onToggleSidebar, onToggleFeed, sidebarOpen, feedOpen }: NavigationProps) {
  const [role, setRole] = useState<'citizen' | 'analyst'>('citizen');
  const unseenReports = 3;

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card border-b shadow-card sticky top-0 z-50"
    >
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-ocean flex items-center justify-center shadow-card">
              <AlertTriangle className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">INCOIS Hazard Monitor</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Indian National Centre for Ocean Information Services
              </p>
            </div>
          </div>
        </div>

        {/* Center stats */}
        <div className="hidden lg:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow"></div>
            <span>24 Active Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span>8 Pending Verification</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Role toggle */}
          <Button
            variant={role === 'analyst' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRole(role === 'citizen' ? 'analyst' : 'citizen')}
            className="hidden sm:flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {role === 'analyst' ? 'Analyst' : 'Citizen'}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unseenReports > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unseenReports}
              </Badge>
            )}
          </Button>

          {/* Feed toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFeed}
            className="md:hidden"
          >
            {feedOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Admin Panel</DropdownMenuItem>
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.nav>
  );
}