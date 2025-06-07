import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, Calendar, Users, Settings, BookOpen, BarChart3, Menu, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/UserContext";
import { promptInstall, isAppInstalled } from "@/lib/pwa";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const [location] = useLocation();
  const { user } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isAppInstalled());
    
    const showInstall = () => setShowInstallButton(true);
    const hideInstall = () => setShowInstallButton(false);
    
    window.addEventListener('show-install-button', showInstall);
    window.addEventListener('hide-install-button', hideInstall);
    
    return () => {
      window.removeEventListener('show-install-button', showInstall);
      window.removeEventListener('hide-install-button', hideInstall);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowInstallButton(false);
      setIsInstalled(true);
    }
  };

  const navigationItems = user?.role === "parent" ? [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Calendar, label: "Planner", path: "/planner" },
    { icon: Users, label: "Students", path: "/students" },
    { icon: BookOpen, label: "Classes", path: "/classes" },
    { icon: BookOpen, label: "Assignments", path: "/assignments" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ] : [
    { icon: Home, label: "My Tasks", path: "/student" },
    { icon: BookOpen, label: "Assignments", path: "/student/tasks" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#8BA88E] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">🍃</span>
          </div>
          <h1 className="font-bold text-lg text-[#8BA88E]">Pebble Track</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {showInstallButton && !isInstalled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInstall}
              className="flex items-center space-x-1 text-xs"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Mobile Side Menu */}
      <div className={cn(
        "md:hidden fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out",
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Menu</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(false)}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {user && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {user.fullName} ({user.role})
            </p>
          )}
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left p-3 h-auto",
                        isActive && "bg-[#8BA88E] text-white hover:bg-[#7A9A7D]"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-2 py-1 z-30">
        <div className="flex justify-around">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center p-2 h-auto min-w-0 space-y-1",
                    isActive && "text-[#8BA88E]"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "text-[#8BA88E]")} />
                  <span className="text-xs truncate max-w-12">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;