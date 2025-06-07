import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNetworkStatus, getCacheSize, clearCache, registerBackgroundSync } from "@/lib/pwa";
import { useToast } from "@/hooks/use-toast";

const PWAOfflineManager = () => {
  const [isOnline, setIsOnline] = useState(getNetworkStatus());
  const [cacheSize, setCacheSize] = useState(0);
  const [pendingUpdates, setPendingUpdates] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateNetworkStatus = () => setIsOnline(getNetworkStatus());
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Load cache information
    loadCacheInfo();
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  const loadCacheInfo = async () => {
    try {
      const size = await getCacheSize();
      setCacheSize(size);
    } catch (error) {
      console.error('Failed to get cache size:', error);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearCache();
      await loadCacheInfo();
      toast({
        title: "Cache Cleared",
        description: "All offline data has been removed. The app will reload fresh data.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleSyncData = async () => {
    if (!isOnline) {
      toast({
        title: "No Connection",
        description: "Connect to the internet to sync your data.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      await registerBackgroundSync('sync-assignments');
      toast({
        title: "Sync Started",
        description: "Your data is being synchronized with the server.",
      });
      setPendingUpdates(0);
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span>Offline Status</span>
        </CardTitle>
        <CardDescription>
          Manage your offline data and synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="font-medium">
              {isOnline ? "Connected" : "Offline"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isOnline 
                ? "Your data is syncing automatically" 
                : "Working with cached data only"}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>

        {/* Cache Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Cached Data</span>
            <span className="text-sm text-gray-600">{formatBytes(cacheSize)}</span>
          </div>
          
          {pendingUpdates > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                {pendingUpdates} updates pending sync
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncData}
            disabled={!isOnline || isSyncing}
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            disabled={isClearing}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear Cache'}
          </Button>
        </div>

        {/* Offline Capabilities */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Available Offline:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• View student assignments and progress</li>
            <li>• Mark assignments as complete</li>
            <li>• Access weekly planner</li>
            <li>• Browse family settings</li>
          </ul>
          <p className="text-xs text-gray-500">
            Changes made offline will sync when you reconnect
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAOfflineManager;