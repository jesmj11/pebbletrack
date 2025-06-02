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
  EyeOff,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle
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
import { getAvatarById } from "@/lib/avatars";
import { queryClient } from "@/lib/queryClient";

const Settings = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Profile Settings
    familyName: "Matthews Family",
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

  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const response = await fetch("/api/family/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settingsData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate family settings query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/family/settings"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
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
                  {students?.map((student: any) => {
                    const studentAvatar = getAvatarById(student.avatar);
                    return (
                      <div key={student.id} className="flex items-center space-x-3 p-3 bg-[#F5F2EA] rounded-lg">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                          style={{
                            backgroundColor: studentAvatar?.backgroundColor || '#A8C7DD'
                          }}
                        >
                          {studentAvatar?.emoji || student.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[#3E4A59]">{student.fullName}</p>
                          <p className="text-xs text-[#7E8A97]">{student.gradeLevel}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Settings */}
        <TabsContent value="subscription" className="space-y-6">
          <Card className="border-[#D9E5D1]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#3E4A59]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                <CreditCard className="h-5 w-5 mr-2" />
                Subscription & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="bg-gradient-to-r from-[#D9E5D1] to-[#F5F2EA] p-6 rounded-lg border border-[#8BA88E]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#3E4A59]">Family Pro Plan</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-[#7E8A97]">Active Subscription</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#3E4A59]">$19.99</div>
                    <div className="text-sm text-[#7E8A97]">per month</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-[#8BA88E]" />
                    <span className="text-sm text-[#7E8A97]">Renewal: March 15, 2025</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-[#7E8A97]">Up to 10 students</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="border-[#8BA88E] text-[#8BA88E] hover:bg-white"
                  >
                    Change Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-[#7E8A97] text-[#7E8A97] hover:bg-white"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-[#D9E5D1]">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-[#3E4A59] mb-1">6</div>
                    <div className="text-sm text-[#7E8A97]">Active Students</div>
                    <div className="text-xs text-green-600 mt-1">4 remaining</div>
                  </CardContent>
                </Card>
                
                <Card className="border-[#D9E5D1]">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-[#3E4A59] mb-1">248</div>
                    <div className="text-sm text-[#7E8A97]">Tasks This Month</div>
                    <div className="text-xs text-[#8BA88E] mt-1">Unlimited</div>
                  </CardContent>
                </Card>
                
                <Card className="border-[#D9E5D1]">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-[#3E4A59] mb-1">12</div>
                    <div className="text-sm text-[#7E8A97]">Active Classes</div>
                    <div className="text-xs text-[#8BA88E] mt-1">Unlimited</div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#3E4A59]">Payment Method</h3>
                <div className="flex items-center justify-between p-4 border border-[#D9E5D1] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VISA</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#3E4A59]">•••• •••• •••• 4532</div>
                      <div className="text-xs text-[#7E8A97]">Expires 03/27</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[#8BA88E] text-[#8BA88E] hover:bg-[#D9E5D1]"
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Billing History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#3E4A59]">Recent Billing History</h3>
                <div className="space-y-2">
                  {[
                    { date: "Feb 15, 2025", amount: "$19.99", status: "Paid" },
                    { date: "Jan 15, 2025", amount: "$19.99", status: "Paid" },
                    { date: "Dec 15, 2024", amount: "$19.99", status: "Paid" },
                  ].map((bill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#F5F2EA] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-[#3E4A59]">{bill.date}</div>
                          <div className="text-xs text-[#7E8A97]">Family Pro Plan</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-[#3E4A59]">{bill.amount}</div>
                        <div className="text-xs text-green-600">{bill.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-[#8BA88E] text-[#8BA88E] hover:bg-[#D9E5D1]"
                >
                  View All Invoices
                </Button>
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