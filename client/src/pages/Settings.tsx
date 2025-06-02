import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Profile Settings
    familyName: "Smith Family",
    email: "jesmj11@gmail.com",
    notifications: {
      email: true,
      assignments: true,
      progress: false,
      weekly: true
    },
    // Privacy Settings
    dataSharing: false,
    analytics: true,
    // App Settings
    theme: "light",
    language: "en",
    timezone: "America/New_York",
    // Backup Settings
    autoBackup: true,
    backupFrequency: "weekly"
  });

  // Get current authenticated user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Fetch family students for data overview
  const { data: students } = useQuery({
    queryKey: ["/api/auth/students"],
    enabled: !!currentUser && currentUser.role === "parent",
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Would save to backend API
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    // Would trigger data export
    toast({
      title: "Export started",
      description: "Your data export will be ready for download shortly.",
    });
  };

  const handleDeleteAllData = () => {
    if (confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
      // Would trigger data deletion
      toast({
        title: "Data deletion initiated",
        description: "All your data will be permanently deleted.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Settings
          </h2>
          <p className="text-[#7E8A97] mt-1">
            Manage your Pebble Track preferences and account settings
          </p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          className="bg-gradient-to-r from-[#7E8A97] to-[#8BA88E] hover:from-[#6E7A87] to-[#7B987E] text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="app">App Settings</TabsTrigger>
          <TabsTrigger value="data">Data & Backup</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-[#D9E5D1]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                <User className="h-5 w-5 mr-2" />
                Family Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName" className="text-[#3E4A59]">Family Name</Label>
                  <Input
                    id="familyName"
                    value={settings.familyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, familyName: e.target.value }))}
                    className="border-[#D9E5D1] focus:border-[#8BA88E]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#3E4A59]">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="border-[#D9E5D1] focus:border-[#8BA88E]"
                  />
                </div>
              </div>

              {/* Students Overview */}
              <div className="pt-4 border-t border-[#D9E5D1]">
                <h3 className="text-lg font-semibold text-[#3E4A59] mb-3">Family Students</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {students?.map((student: any) => (
                    <div key={student.id} className="flex items-center space-x-3 p-3 bg-[#F5F2EA] rounded-lg">
                      <div className="w-8 h-8 bg-[#A8C7DD] rounded-full flex items-center justify-center text-sm">
                        {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[#3E4A59]">{student.fullName}</p>
                        <p className="text-xs text-[#7E8A97]">{student.gradeLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-[#D9E5D1]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[#3E4A59]">Email Notifications</Label>
                  <p className="text-sm text-[#7E8A97]">Receive general updates via email</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[#3E4A59]">Assignment Notifications</Label>
                  <p className="text-sm text-[#7E8A97]">Get notified about assignment due dates</p>
                </div>
                <Switch
                  checked={settings.notifications.assignments}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'assignments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[#3E4A59]">Progress Reports</Label>
                  <p className="text-sm text-[#7E8A97]">Weekly progress summaries</p>
                </div>
                <Switch
                  checked={settings.notifications.progress}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'progress', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[#3E4A59]">Weekly Digest</Label>
                  <p className="text-sm text-[#7E8A97]">Summary of week's activities</p>
                </div>
                <Switch
                  checked={settings.notifications.weekly}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'weekly', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-[#D9E5D1]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[#3E4A59]">Data Sharing</Label>
                  <p className="text-sm text-[#7E8A97]">Allow sharing anonymized data for improvements</p>
                </div>
                <Switch
                  checked={settings.dataSharing}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dataSharing: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[#3E4A59]">Usage Analytics</Label>
                  <p className="text-sm text-[#7E8A97]">Help improve Pebble Track with usage data</p>
                </div>
                <Switch
                  checked={settings.analytics}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, analytics: checked }))}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#3E4A59]">Account Security</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-[#3E4A59]">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        className="border-[#D9E5D1] focus:border-[#8BA88E] pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="border-[#8BA88E] text-[#8BA88E] hover:bg-[#D9E5D1]"
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Settings */}
        <TabsContent value="app" className="space-y-6">
          <Card className="border-[#D9E5D1]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                <Palette className="h-5 w-5 mr-2" />
                App Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-[#3E4A59]">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-[#3E4A59]">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-[#3E4A59]">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Backup Settings */}
        <TabsContent value="data" className="space-y-6">
          <Card className="border-[#D9E5D1]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                <Database className="h-5 w-5 mr-2" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Backup Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#3E4A59]">Backup Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[#3E4A59]">Automatic Backup</Label>
                    <p className="text-sm text-[#7E8A97]">Automatically backup your data</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBackup: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupFrequency" className="text-[#3E4A59]">Backup Frequency</Label>
                  <Select 
                    value={settings.backupFrequency} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, backupFrequency: value }))}
                    disabled={!settings.autoBackup}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Data Export/Import */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#3E4A59]">Data Export & Import</h3>
                
                <div className="space-y-3">
                  <p className="text-sm text-[#7E8A97]">
                    Export your family's learning data or import from another platform.
                  </p>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleExportData}
                      variant="outline"
                      className="border-[#8BA88E] text-[#8BA88E] hover:bg-[#D9E5D1]"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-[#A8C7DD] text-[#7E8A97] hover:bg-[#F5F2EA]"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="space-y-3">
                    <p className="text-sm text-red-700">
                      <strong>Delete All Data:</strong> This will permanently delete all your family's data, including students, classes, assignments, and progress. This action cannot be undone.
                    </p>
                    
                    <Button 
                      onClick={handleDeleteAllData}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete All Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;