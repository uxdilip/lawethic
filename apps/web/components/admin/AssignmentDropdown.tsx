'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { account } from '@lawethic/appwrite/client';

interface TeamMember {
    $id: string;
    name: string;
    email: string;
    role: string;
}

interface AssignmentDropdownProps {
    orderId: string;
    currentAssignment?: string;
    onAssignmentChange?: () => void;
}

export default function AssignmentDropdown({
    orderId,
    currentAssignment,
    onAssignmentChange
}: AssignmentDropdownProps) {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [selectedMember, setSelectedMember] = useState<string>(currentAssignment || '');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    useEffect(() => {
        setSelectedMember(currentAssignment || '');
    }, [currentAssignment]);

    const fetchTeamMembers = async () => {
        try {
            const response = await fetch('/api/admin/team-members');
            const data = await response.json();

            if (data.success) {
                setTeamMembers(data.teamMembers);
            }
        } catch (error) {
            console.error('Failed to fetch team members:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleAssignment = async (memberId: string) => {
        if (memberId === selectedMember) return;

        setLoading(true);

        try {
            // Get current user info
            const currentUser = await account.get();
            const member = teamMembers.find(m => m.$id === memberId);

            const response = await fetch('/api/admin/assign-case', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    assignedTo: memberId || null,
                    assignedToName: member?.name || 'Unassigned',
                    currentUserId: currentUser.$id,
                    currentUserName: currentUser.name || currentUser.email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to assign case');
            }

            setSelectedMember(memberId);

            if (onAssignmentChange) {
                onAssignmentChange();
            }

            // Show success message
            alert(data.message || 'Assignment updated successfully');

        } catch (error: any) {
            console.error('Assignment error:', error);
            alert(error.message || 'Failed to assign case');
        } finally {
            setLoading(false);
        }
    };

    const getSelectedMemberName = () => {
        if (!selectedMember) return 'Unassigned';
        const member = teamMembers.find(m => m.$id === selectedMember);
        return member?.name || 'Unknown';
    };

    if (fetching) {
        return (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="h-4 w-4 animate-pulse" />
                <span>Loading team...</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600 font-medium">Assigned to:</span>
                <select
                    value={selectedMember}
                    onChange={(e) => handleAssignment(e.target.value)}
                    disabled={loading}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">Unassigned</option>
                    {teamMembers.map((member) => (
                        <option key={member.$id} value={member.$id}>
                            {member.name} {member.role === 'admin' && '(Admin)'}
                        </option>
                    ))}
                </select>
                {loading && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
            </div>
        </div>
    );
}
