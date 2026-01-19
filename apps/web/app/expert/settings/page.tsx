'use client';

import { useEffect, useState } from 'react';
import { account } from '@lawethic/appwrite/client';
import {
    User,
    Mail,
    Phone,
    Loader2,
    Save,
    Lock,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function ExpertSettingsContent() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // Password change
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userData = await account.get();
            setUser(userData);
            setName(userData.name || '');
            setPhone(userData.phone || '');
        } catch (error) {
            console.error('Error loading user:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await account.updateName(name);
            toast.success('Profile updated');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setChangingPassword(true);
        try {
            await account.updatePassword(newPassword, currentPassword);
            toast.success('Password changed successfully');
            setShowPasswordForm(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            if (error.code === 401) {
                toast.error('Current password is incorrect');
            } else {
                toast.error('Failed to change password');
            }
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-2xl mx-auto p-6 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">Account Settings</h1>
                    <p className="text-neutral-600 mt-1">
                        Manage your profile and account preferences
                    </p>
                </div>

                {/* Profile Section */}
                <div className="bg-white rounded-xl border border-neutral-200 mb-6">
                    <div className="p-4 border-b border-neutral-100">
                        <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Profile Information
                        </h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500"
                                />
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Contact support to change your email address
                            </p>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-xl border border-neutral-200">
                    <div className="p-4 border-b border-neutral-100">
                        <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Security
                        </h2>
                    </div>
                    <div className="p-6">
                        {!showPasswordForm ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-neutral-900">Password</p>
                                    <p className="text-sm text-neutral-500">
                                        Last changed: Unknown
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPasswordForm(true)}
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Change Password
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setCurrentPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {changingPassword ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Lock className="w-4 h-4 mr-2" />
                                        )}
                                        Update Password
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Info */}
                <div className="mt-6 p-4 bg-neutral-100 rounded-xl">
                    <p className="text-sm text-neutral-600">
                        <strong>Account Type:</strong> Expert / Consultant
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                        For account-related queries, contact support at support@lawethic.com
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ExpertSettingsPage() {
    return <ExpertSettingsContent />;
}
