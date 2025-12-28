'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@lawethic/appwrite/client';
import { Pencil, Check, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Indian states list
const INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Puducherry',
    'Chandigarh',
    'Andaman and Nicobar Islands',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep',
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam'];

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    businessName: string;
    country: string;
    state: string;
    language: string;
}

interface EditableCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    saving?: boolean;
}

function EditableCard({ title, description, children, isEditing, onEdit, onSave, onCancel, saving }: EditableCardProps) {
    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100">
                <div>
                    <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
                    {description && (
                        <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
                    )}
                </div>
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onCancel}
                            disabled={saving}
                            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onSave}
                            disabled={saving}
                            className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                    </button>
                )}
            </div>
            <div className="px-6 py-4">
                {children}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // User data
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        country: 'India',
        state: '',
        language: 'English',
    });

    // Edit states
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editProfile, setEditProfile] = useState<UserProfile>(profile);

    // Password states
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const user = await account.get();
            const prefs = user.prefs || {};

            const userData: UserProfile = {
                name: user.name || '',
                email: user.email || '',
                phone: prefs.mobile || user.phone || '',
                businessName: prefs.businessName || '',
                country: prefs.country || 'India',
                state: prefs.state || '',
                language: prefs.language || 'English',
            };

            setProfile(userData);
            setEditProfile(userData);
        } catch (error) {
            console.error('Failed to load profile:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (section: string) => {
        setEditingSection(section);
        setEditProfile(profile);
    };

    const handleCancel = () => {
        setEditingSection(null);
        setEditProfile(profile);
    };

    const handleSaveDetails = async () => {
        setSaving(true);
        try {
            // Update name if changed
            if (editProfile.name !== profile.name) {
                await account.updateName(editProfile.name);
            }

            // Update preferences
            const currentUser = await account.get();
            const currentPrefs = currentUser.prefs || {};

            await account.updatePrefs({
                ...currentPrefs,
                businessName: editProfile.businessName,
                country: editProfile.country,
                state: editProfile.state,
                language: editProfile.language,
            });

            setProfile(editProfile);
            setEditingSection(null);
            toast({
                title: 'Profile updated',
                description: 'Your profile details have been saved.',
            });
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            toast({
                title: 'Update failed',
                description: error.message || 'Failed to update profile. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEmail = async () => {
        setSaving(true);
        try {
            // Email update requires password verification in Appwrite
            // For now, show a message that email change requires verification
            toast({
                title: 'Email change',
                description: 'Please contact support to change your email address.',
            });
            setEditingSection(null);
        } catch (error: any) {
            console.error('Failed to update email:', error);
            toast({
                title: 'Update failed',
                description: error.message || 'Failed to update email.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePhone = async () => {
        setSaving(true);
        try {
            // Update phone in preferences
            const currentUser = await account.get();
            const currentPrefs = currentUser.prefs || {};

            await account.updatePrefs({
                ...currentPrefs,
                mobile: editProfile.phone,
            });

            setProfile(prev => ({ ...prev, phone: editProfile.phone }));
            setEditingSection(null);
            toast({
                title: 'Phone updated',
                description: 'Your mobile number has been saved.',
            });
        } catch (error: any) {
            console.error('Failed to update phone:', error);
            toast({
                title: 'Update failed',
                description: error.message || 'Failed to update phone number.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast({
                title: 'Password mismatch',
                description: 'New password and confirm password do not match.',
                variant: 'destructive',
            });
            return;
        }

        if (passwords.new.length < 8) {
            toast({
                title: 'Password too short',
                description: 'Password must be at least 8 characters long.',
                variant: 'destructive',
            });
            return;
        }

        setSaving(true);
        try {
            await account.updatePassword(passwords.new, passwords.old);
            setShowPasswordForm(false);
            setPasswords({ old: '', new: '', confirm: '' });
            toast({
                title: 'Password changed',
                description: 'Your password has been updated successfully.',
            });
        } catch (error: any) {
            console.error('Failed to change password:', error);
            toast({
                title: 'Password change failed',
                description: error.message || 'Failed to change password. Please check your current password.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-neutral-200 rounded w-32 mb-8"></div>
                    <div className="bg-white rounded-xl p-6 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-neutral-200 rounded-full"></div>
                            <div className="h-6 bg-neutral-200 rounded w-40"></div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6">
                                <div className="h-4 bg-neutral-200 rounded w-24 mb-4"></div>
                                <div className="h-10 bg-neutral-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Page Header */}
            <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Profile</h1>

            {/* Avatar Header Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">
                            {profile.name.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-900">{profile.name || 'User'}</h2>
                        <p className="text-sm text-neutral-500">{profile.email}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Profile Details */}
                <EditableCard
                    title="Profile Details"
                    isEditing={editingSection === 'details'}
                    onEdit={() => handleEdit('details')}
                    onSave={handleSaveDetails}
                    onCancel={handleCancel}
                    saving={saving}
                >
                    {editingSection === 'details' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editProfile.name}
                                    onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1">Business Name</label>
                                <input
                                    type="text"
                                    value={editProfile.businessName}
                                    onChange={(e) => setEditProfile(prev => ({ ...prev, businessName: e.target.value }))}
                                    placeholder="Your business name"
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1">Country</label>
                                <input
                                    type="text"
                                    value={editProfile.country}
                                    disabled
                                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1">State</label>
                                <select
                                    value={editProfile.state}
                                    onChange={(e) => setEditProfile(prev => ({ ...prev, state: e.target.value }))}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-500 mb-1">Language</label>
                                <select
                                    value={editProfile.language}
                                    onChange={(e) => setEditProfile(prev => ({ ...prev, language: e.target.value }))}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-sm text-neutral-500">Full Name</p>
                                <p className="text-neutral-900 font-medium">{profile.name || 'NA'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Business Name</p>
                                <p className="text-neutral-900 font-medium">{profile.businessName || 'NA'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Country</p>
                                <p className="text-neutral-900 font-medium">{profile.country}</p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">State</p>
                                <p className="text-neutral-900 font-medium">{profile.state || 'NA'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500">Language</p>
                                <p className="text-neutral-900 font-medium">{profile.language}</p>
                            </div>
                        </div>
                    )}
                </EditableCard>

                {/* Email Address */}
                <EditableCard
                    title="Email Address"
                    description="You can use this email to sign in and reset your password."
                    isEditing={editingSection === 'email'}
                    onEdit={() => handleEdit('email')}
                    onSave={handleSaveEmail}
                    onCancel={handleCancel}
                    saving={saving}
                >
                    {editingSection === 'email' ? (
                        <div>
                            <input
                                type="email"
                                value={editProfile.email}
                                onChange={(e) => setEditProfile(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                            />
                            <p className="text-xs text-amber-600 mt-2">
                                Note: Changing email requires verification. Contact support for assistance.
                            </p>
                        </div>
                    ) : (
                        <p className="text-neutral-900 font-medium">{profile.email}</p>
                    )}
                </EditableCard>

                {/* Mobile Number */}
                <EditableCard
                    title="Mobile Number"
                    description="You can use this number for account recovery and notifications."
                    isEditing={editingSection === 'phone'}
                    onEdit={() => handleEdit('phone')}
                    onSave={handleSavePhone}
                    onCancel={handleCancel}
                    saving={saving}
                >
                    {editingSection === 'phone' ? (
                        <input
                            type="tel"
                            value={editProfile.phone}
                            onChange={(e) => setEditProfile(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+91 99999 99999"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        />
                    ) : (
                        <p className="text-neutral-900 font-medium">{profile.phone || 'NA'}</p>
                    )}
                </EditableCard>

                {/* Password */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-100">
                        <h3 className="text-base font-semibold text-neutral-900">Password</h3>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            Ensure your account's security by setting a strong password.
                        </p>
                    </div>
                    <div className="px-6 py-4">
                        {showPasswordForm ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-neutral-500 mb-1">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.old ? 'text' : 'password'}
                                            value={passwords.old}
                                            onChange={(e) => setPasswords(prev => ({ ...prev, old: e.target.value }))}
                                            className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                        >
                                            {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-500 mb-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={passwords.new}
                                            onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                            className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-500 mb-1">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                            className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setPasswords({ old: '', new: '', confirm: '' });
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={saving || !passwords.old || !passwords.new || !passwords.confirm}
                                        className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="px-4 py-2 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-900 rounded-lg transition-colors"
                            >
                                Change Password
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
