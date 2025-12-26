'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileQuestion, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getQuestionnaireSummaries, getQuestionnaireById } from '@/data/questionnaires';

interface SendQuestionnaireButtonProps {
    orderId: string;
    serviceSlug?: string;
    userId: string;
    userName: string;
    onSent?: () => void;
}

export function SendQuestionnaireButton({
    orderId,
    serviceSlug,
    userId,
    userName,
    onSent
}: SendQuestionnaireButtonProps) {
    const [open, setOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const questionnaires = getQuestionnaireSummaries();

    // Pre-select questionnaire if it matches the service
    const defaultTemplate = serviceSlug
        ? questionnaires.find(q => q.serviceSlug === serviceSlug)?.id
        : undefined;

    const handleOpen = () => {
        setSelectedTemplate(defaultTemplate || '');
        setNotes('');
        setError(null);
        setSuccess(false);
        setOpen(true);
    };

    const handleSend = async () => {
        if (!selectedTemplate) {
            setError('Please select a questionnaire');
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const response = await fetch('/api/questionnaires/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    templateId: selectedTemplate,
                    sentBy: userId,
                    sentByName: userName,
                    notes: notes || undefined
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send questionnaire');
            }

            setSuccess(true);
            setTimeout(() => {
                setOpen(false);
                onSent?.();
            }, 1500);
        } catch (err: any) {
            console.error('Send error:', err);
            setError(err.message);
            setSuccess(false);
        } finally {
            setIsSending(false);
        }
    };

    const selectedTemplateDetails = selectedTemplate
        ? getQuestionnaireById(selectedTemplate)
        : null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={handleOpen}>
                    <FileQuestion className="w-4 h-4 mr-2" />
                    Send Questionnaire
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Send Questionnaire to Client</DialogTitle>
                    <DialogDescription>
                        Select a questionnaire template to send to the client. They will be notified and can fill it out in their portal.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-8 text-center">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-green-700 font-medium">Questionnaire sent successfully!</p>
                        <p className="text-sm text-gray-500 mt-1">The client has been notified.</p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="template">Questionnaire Template *</Label>
                                <Select
                                    value={selectedTemplate}
                                    onValueChange={setSelectedTemplate}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a questionnaire" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {questionnaires.map((q) => (
                                            <SelectItem key={q.id} value={q.id}>
                                                {q.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedTemplateDetails && (
                                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                                    <p className="font-medium text-blue-800">
                                        {selectedTemplateDetails.name}
                                    </p>
                                    <p className="text-blue-600 mt-1">
                                        {selectedTemplateDetails.description}
                                    </p>
                                    <p className="text-blue-500 mt-2">
                                        {selectedTemplateDetails.sections.length} sections, {' '}
                                        {selectedTemplateDetails.sections.reduce(
                                            (acc, s) => acc + s.fields.length, 0
                                        )} fields
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes for Client (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                                    placeholder="Any specific instructions or notes..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSending}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={isSending || !selectedTemplate}
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Questionnaire'
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
