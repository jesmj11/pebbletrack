import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { requestNotificationPermission } from "@/lib/pwa";

interface NotificationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionGranted?: () => void;
}

const NotificationPermissionDialog = ({ 
  open, 
  onOpenChange, 
  onPermissionGranted 
}: NotificationPermissionDialogProps) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        onPermissionGranted?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#8BA88E]" />
            <span>Assignment Reminders</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Stay on top of your homeschool schedule with gentle reminders for upcoming assignments and due dates.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-[#F5F2EA] p-4 rounded-lg">
            <h4 className="font-medium mb-2">You'll receive notifications for:</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Assignments due today</li>
              <li>• Upcoming due dates</li>
              <li>• Weekly planner updates</li>
              <li>• Achievement celebrations</li>
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="flex-1 bg-[#8BA88E] hover:bg-[#7A9A7D] text-white"
            >
              {isRequesting ? "Requesting..." : "Enable Notifications"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            You can always change this in your device settings later
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPermissionDialog;