import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNetworkStatus, initializeNetworkListener } from "@/lib/pwa";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(getNetworkStatus());
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    initializeNetworkListener((online) => {
      setIsOnline(online);
      if (!online) {
        setShowOfflineMessage(true);
      } else {
        // Hide offline message after a delay when coming back online
        setTimeout(() => setShowOfflineMessage(false), 3000);
      }
    });
  }, []);

  if (!showOfflineMessage && isOnline) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-sm text-center font-medium",
      "transition-transform duration-300",
      !isOnline ? "transform translate-y-0" : "transform -translate-y-full"
    )}>
      <div className="flex items-center justify-center space-x-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Back online - syncing data...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're offline - using cached data</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;