import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Bell, Shield, Palette, Globe, Save, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { toast } = useToast();
  const { t, language, setLanguage, formatCurrency } = useLanguage();
  const { canEditCompanySettings, isOwnerOrAdmin } = usePermissions();
  const { user } = useAuth();
  
  // Company settings
  const [companyName, setCompanyName] = useState('InvenPro Company');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [taxRate, setTaxRate] = useState('11');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [poPrefix, setPoPrefix] = useState('PO');
  const [soPrefix, setSoPrefix] = useState('SO');
  
  // User settings
  const [timezone, setTimezone] = useState('Asia/Jakarta');
  const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [dailyReports, setDailyReports] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    // Load company settings
    const { data: companyData } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (companyData) {
      setCompanyName(companyData.company_name || '');
      setCompanyAddress(companyData.company_address || '');
      setCompanyPhone(companyData.company_phone || '');
      setCompanyEmail(companyData.company_email || '');
      setTaxRate(companyData.tax_rate?.toString() || '11');
      setLowStockThreshold(companyData.low_stock_threshold?.toString() || '10');
      setPaymentTerms(companyData.default_payment_terms?.toString() || '30');
      setInvoicePrefix(companyData.invoice_prefix || 'INV');
      setPoPrefix(companyData.po_prefix || 'PO');
      setSoPrefix(companyData.so_prefix || 'SO');
    }

    // Load user settings
    if (user) {
      const { data: userData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userData) {
        setTimezone(userData.timezone || 'Asia/Jakarta');
        setDateFormat(userData.date_format || 'dd/MM/yyyy');
        setEmailNotifications(userData.email_notifications ?? true);
        setLowStockAlerts(userData.low_stock_alerts ?? true);
        setOrderUpdates(userData.order_updates ?? true);
        setDailyReports(userData.daily_reports ?? false);
      }
    }
  };

  const handleSaveGeneral = async () => {
    if (!canEditCompanySettings()) {
      toast({
        title: t('error.forbidden'),
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('company_settings')
      .update({
        company_name: companyName,
        company_address: companyAddress,
        company_phone: companyPhone,
        company_email: companyEmail,
        tax_rate: parseFloat(taxRate),
        low_stock_threshold: parseInt(lowStockThreshold),
        default_payment_terms: parseInt(paymentTerms),
        invoice_prefix: invoicePrefix,
        po_prefix: poPrefix,
        so_prefix: soPrefix,
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update first row

    if (error) {
      toast({ title: t('error.generic'), variant: 'destructive' });
    } else {
      toast({
        title: t('success.saved'),
        description: language === 'id' ? 'Pengaturan umum telah disimpan' : 'General settings have been saved',
      });
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        email_notifications: emailNotifications,
        low_stock_alerts: lowStockAlerts,
        order_updates: orderUpdates,
        daily_reports: dailyReports,
        timezone,
        date_format: dateFormat,
        language,
      }, { onConflict: 'user_id' });

    if (error) {
      toast({ title: t('error.generic'), variant: 'destructive' });
    } else {
      toast({
        title: t('success.saved'),
        description: language === 'id' ? 'Preferensi notifikasi telah disimpan' : 'Notification preferences have been saved',
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: t('validation.passwordMismatch'),
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      toast({
        title: t('success.updated'),
        description: language === 'id' ? 'Kata sandi berhasil diubah' : 'Password has been changed successfully',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang as 'en' | 'id');
  };

  return (
    <MainLayout title={t('settings.title')}>
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {t('settings.general')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {t('settings.notifications')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            {t('settings.appearance')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t('settings.security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.general')}</CardTitle>
              <CardDescription>
                {language === 'id' ? 'Kelola pengaturan perusahaan dan sistem' : 'Manage your company and system preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t('settings.companyName')}</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={!canEditCompanySettings()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">{t('settings.companyEmail')}</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    disabled={!canEditCompanySettings()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">{t('settings.companyPhone')}</Label>
                  <Input
                    id="companyPhone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    disabled={!canEditCompanySettings()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">{t('settings.taxRate')}</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    disabled={!canEditCompanySettings()}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">{t('settings.companyAddress')}</Label>
                  <Textarea
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    disabled={!canEditCompanySettings()}
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium">{language === 'id' ? 'Pengaturan Inventori' : 'Inventory Settings'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lowStock">{t('settings.lowStockThreshold')}</Label>
                  <Input
                    id="lowStock"
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    disabled={!canEditCompanySettings()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">{t('settings.paymentTerms')}</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    disabled={!canEditCompanySettings()}
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium">{language === 'id' ? 'Prefix Dokumen' : 'Document Prefixes'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">{t('settings.invoicePrefix')}</Label>
                  <Input
                    id="invoicePrefix"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    disabled={!canEditCompanySettings()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poPrefix">{t('settings.poPrefix')}</Label>
                  <Input
                    id="poPrefix"
                    value={poPrefix}
                    onChange={(e) => setPoPrefix(e.target.value)}
                    disabled={!canEditCompanySettings()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soPrefix">{t('settings.soPrefix')}</Label>
                  <Input
                    id="soPrefix"
                    value={soPrefix}
                    onChange={(e) => setSoPrefix(e.target.value)}
                    disabled={!canEditCompanySettings()}
                  />
                </div>
              </div>
              
              {canEditCompanySettings() && (
                <>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={handleSaveGeneral}>
                      <Save className="w-4 h-4 mr-2" />
                      {t('common.save')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notifications')}</CardTitle>
              <CardDescription>
                {language === 'id' ? 'Pilih bagaimana Anda ingin diberitahu' : 'Choose how you want to be notified'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">{t('settings.emailNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'id' ? 'Terima notifikasi via email' : 'Receive notifications via email'}
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">{t('settings.lowStockAlerts')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'id' ? 'Notifikasi saat stok menipis' : 'Get notified when items are running low'}
                    </p>
                  </div>
                  <Switch
                    checked={lowStockAlerts}
                    onCheckedChange={setLowStockAlerts}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">{t('settings.orderUpdates')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'id' ? 'Notifikasi perubahan status pesanan' : 'Notifications for order status changes'}
                    </p>
                  </div>
                  <Switch
                    checked={orderUpdates}
                    onCheckedChange={setOrderUpdates}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">{t('settings.dailyReports')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'id' ? 'Terima laporan ringkasan harian' : 'Receive daily summary reports'}
                    </p>
                  </div>
                  <Switch
                    checked={dailyReports}
                    onCheckedChange={setDailyReports}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearance')}</CardTitle>
              <CardDescription>
                {language === 'id' ? 'Sesuaikan tampilan dashboard Anda' : 'Customize the look and feel of your dashboard'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.language')}</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>{t('settings.timezone')}</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Jakarta">Jakarta (WIB)</SelectItem>
                      <SelectItem value="Asia/Makassar">Makassar (WITA)</SelectItem>
                      <SelectItem value="Asia/Jayapura">Jayapura (WIT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>{t('settings.theme')}</Label>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1">{t('settings.light')}</Button>
                    <Button variant="default" className="flex-1">{t('settings.dark')}</Button>
                    <Button variant="outline" className="flex-1">{t('settings.system')}</Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.security')}</CardTitle>
              <CardDescription>
                {language === 'id' ? 'Kelola keamanan akun Anda' : 'Manage your account security'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">{t('settings.changePassword')}</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'id' ? 'Perbarui kata sandi Anda secara berkala' : 'Update your password regularly for security'}
                  </p>
                  <div className="space-y-4 max-w-md">
                    <Input 
                      type="password" 
                      placeholder={t('settings.currentPassword')}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Input 
                      type="password" 
                      placeholder={t('settings.newPassword')}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input 
                      type="password" 
                      placeholder={t('settings.confirmNewPassword')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button onClick={handleChangePassword}>
                      {language === 'id' ? 'Ubah Kata Sandi' : 'Update Password'}
                    </Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-base">{t('settings.twoFactorAuth')}</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'id' ? 'Tambahkan lapisan keamanan ekstra' : 'Add an extra layer of security'}
                  </p>
                  <Button variant="outline">{t('settings.enable2FA')}</Button>
                </div>
                <Separator />
                <div>
                  <Label className="text-base">{t('settings.activeSessions')}</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'id' ? 'Kelola sesi login aktif Anda' : 'Manage your active login sessions'}
                  </p>
                  <Button variant="destructive">{t('settings.signOutAllDevices')}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
