import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Camera, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFullName(user.fullName || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    // In demo mode, just simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been saved successfully.',
    });
    
    setIsLoading(false);
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'owner':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MainLayout title="Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(fullName || email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{fullName || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
                <Badge variant={getRoleBadgeVariant(role)} className="mt-2 capitalize">
                  {role || 'Staff'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Form */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Account ID</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {user?.id?.slice(0, 8)}...
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Role</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {role || 'Staff'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
