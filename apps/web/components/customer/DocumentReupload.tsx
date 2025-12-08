'use client';

import { useState, useRef } from 'react';
import { databases, storage, account } from '@lawethic/appwrite/client';
import { ID } from 'appwrite';

const DATABASE_ID = 'main';
const BUCKET_ID = 'customer-documents';

interface DocumentReuploadProps {
    documentId: string;
    documentName: string;
    orderId: string;
    rejectionReason: string;
    onSuccess: () => void;
    onClose: () => void;
}

export default function DocumentReupload({
    documentId,
    documentName,
    orderId,
    rejectionReason,
    onSuccess,
    onClose
}: DocumentReuploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const validateFile = (file: File): string | null => {
        if (file.size > maxSize) {
            return 'File size must be less than 10MB';
        }
        if (!allowedTypes.includes(file.type)) {
            return 'Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX';
        }
        return null;
    };

    const handleFileSelect = (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            setSelectedFile(null);
            return;
        }
        setError('');
        setSelectedFile(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Get current user
            const user = await account.get();

            // Verify document exists and belongs to user's order
            const existingDoc = await databases.getDocument(DATABASE_ID, 'documents', documentId);

            if (existingDoc.orderId !== orderId) {
                throw new Error('Document does not belong to this order');
            }

            // Verify user owns the order
            const order = await databases.getDocument(DATABASE_ID, 'orders', orderId);
            if (order.customerId !== user.$id) {
                throw new Error('You do not have permission to upload documents for this order');
            }

            // Verify document is rejected
            if (existingDoc.status !== 'rejected') {
                throw new Error('Can only re-upload rejected documents');
            }

            // Upload new file to storage
            const uploadedFile = await storage.createFile(
                BUCKET_ID,
                ID.unique(),
                selectedFile
            );

            // Get version number (increment from existing)
            const currentVersion = existingDoc.version || 1;
            const newVersion = currentVersion + 1;

            // Update existing document record
            await databases.updateDocument(
                DATABASE_ID,
                'documents',
                documentId,
                {
                    fileId: uploadedFile.$id,
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    status: 'pending',
                    rejectionReason: null,
                    version: newVersion,
                    previousVersionId: existingDoc.fileId,
                    reuploadedAt: new Date().toISOString()
                }
            );

            // Create timeline entry using API (admin SDK needed)
            try {
                await fetch('/api/documents/reupload-timeline', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId,
                        fileName: selectedFile.name,
                        version: newVersion,
                        userName: user.name || user.email,
                        userId: user.$id,
                        assignedTo: order.assignedTo
                    })
                });
            } catch (timelineError) {
                console.error('Failed to create timeline entry:', timelineError);
                // Don't fail upload if timeline creation fails
            }

            onSuccess();
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Re-upload Document
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={uploading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Current Document Info */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Current Document:</h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-900">{documentName}</p>
                            <div className="mt-2 flex items-center space-x-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Rejected
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Rejection Reason */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Rejection Reason:</h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">{rejectionReason}</p>
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Upload New Version:</h3>

                        {/* Drag and Drop Area */}
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : selectedFile
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileInput}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="hidden"
                                disabled={uploading}
                            />

                            {selectedFile ? (
                                <div className="space-y-2">
                                    <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                        disabled={uploading}
                                    >
                                        Choose different file
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                            disabled={uploading}
                                        >
                                            Click to upload
                                        </button>
                                        <span className="text-gray-600"> or drag and drop</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PDF, JPG, PNG, DOC, DOCX up to 10MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="ml-3 text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Info Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="ml-3 text-sm text-blue-800">
                                Your document will be reviewed by our team. You'll receive a notification once it's verified or if additional changes are needed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        disabled={uploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <span>Upload Document</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
