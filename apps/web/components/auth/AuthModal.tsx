'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultTab?: 'login' | 'signup';
}

export function AuthModal({
    isOpen,
    onClose,
    onSuccess,
    defaultTab = 'login'
}: AuthModalProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleAuthSuccess = () => {
        onClose();
        onSuccess();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {activeTab === 'login'
                            ? 'Sign in to continue with your purchase'
                            : 'Create an account to get started'}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'login' | 'signup')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="mt-4">
                        <LoginForm onSuccess={handleAuthSuccess} showSignupLink={false} />
                    </TabsContent>

                    <TabsContent value="signup" className="mt-4">
                        <SignupForm onSuccess={handleAuthSuccess} showLoginLink={false} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
