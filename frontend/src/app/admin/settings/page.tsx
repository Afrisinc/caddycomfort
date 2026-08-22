'use client';

import React, { useState } from 'react';
import { 
  Save,
  Store,
  CreditCard,
  Truck,
  Mail,
  Bell,
  Shield,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';

function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Settings" description="Manage your store settings and preferences">
        <Button className="bg-accent-rose hover:bg-accent-rose-dark">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-accent-rose/10 text-accent-rose'
                        : 'hover:bg-accent-rose/5'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'general' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Store Information</CardTitle>
                    <CardDescription>Basic information about your store</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="storeName">Store Name</Label>
                      <Input id="storeName" defaultValue="CaddyComfort" />
                    </div>
                    <div>
                      <Label htmlFor="storeDescription">Description</Label>
                      <Textarea
                        id="storeDescription"
                        defaultValue="Premium fashion and lifestyle products"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="storeEmail">Email</Label>
                        <Input id="storeEmail" type="email" defaultValue="info@clementine.rw" />
                      </div>
                      <div>
                        <Label htmlFor="storePhone">Phone</Label>
                        <Input id="storePhone" defaultValue="+250 788 000 000" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="storeAddress">Address</Label>
                      <Textarea
                        id="storeAddress"
                        defaultValue="KG 123 St, Kigali, Rwanda"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Regional Settings</CardTitle>
                    <CardDescription>Currency, timezone, and language</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Input id="currency" defaultValue="RWF - Rwandan Franc" readOnly />
                      </div>
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input id="timezone" defaultValue="Africa/Kigali (CAT)" readOnly />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Configure payment options for customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Credit/Debit Cards</p>
                      <p className="text-sm text-muted-foreground">Accept card payments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Mobile Money (MoMo)</p>
                      <p className="text-sm text-muted-foreground">MTN & Airtel Money</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when order is delivered</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'shipping' && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Settings</CardTitle>
                  <CardDescription>Configure shipping options and rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="freeShipping">Free Shipping Threshold</Label>
                    <Input
                      id="freeShipping"
                      type="number"
                      defaultValue="150000"
                      placeholder="Amount in RWF"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Orders above this amount get free shipping
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="standardRate">Standard Shipping Rate</Label>
                    <Input
                      id="standardRate"
                      type="number"
                      defaultValue="5000"
                      placeholder="Amount in RWF"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expressRate">Express Shipping Rate</Label>
                    <Input
                      id="expressRate"
                      type="number"
                      defaultValue="10000"
                      placeholder="Amount in RWF"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'email' && (
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Configure automated email settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Order Confirmation</p>
                      <p className="text-sm text-muted-foreground">
                        Send email when order is placed
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Shipping Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Notify customers about shipping status
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Promotional Emails</p>
                      <p className="text-sm text-muted-foreground">
                        Send newsletters and promotions
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">New Orders</p>
                      <p className="text-sm text-muted-foreground">Get notified of new orders</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Low Stock Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Alert when products are low in stock
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Customer Messages</p>
                      <p className="text-sm text-muted-foreground">
                        Notify about customer inquiries
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button className="w-full">Update Password</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AdminLayout>
      <Settings />
    </AdminLayout>
  );
}
