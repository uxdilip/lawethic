'use client';

import { useState, useRef } from 'react';
import { databases, storage } from '@lawethic/appwrite/client';
import { appwriteConfig } from '@lawethic/appwrite/config';
import { ID } from 'appwrite';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface DocumentUploadSectionProps {
    orderId: string;
    orderStatus: string;
    documentRequired: string[];
    existingDocuments: any[];
    onUploadSuccess: () => void;
    userId: string;
}

export default function DocumentUploadSection({
    orderId,
    orderStatus,
    documentRequired,
    existingDocuments,
    onUploadSuccess,
    userId
}: DocumentUploadSectionProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
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

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (files: File[]) => {
        const validFiles: File[] = [];
        let hasError = false;

        files.forEach(file => {
            if (file.size > maxSize) {
                setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
                hasError = true;
                return;
            }
            if (!allowedTypes.includes(file.type)) {
                setError(`File "${file.name}" has invalid type. Please upload PDF, JPG, PNG, DOC, or DOCX.`);
                hasError = true;
                return;
            }
            validFiles.push(file);
        });

        if (!hasError) {
            setError('');
            setSelectedFiles([...selectedFiles, ...validFiles]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFileSelect(Array.from(e.target.files));
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            setError('Please select at least one file to upload');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess(false);

        try {
            // Upload files to storage and create document records
            for (const file of selectedFiles) {
                // Upload file to storage
                const uploadedFile = await storage.createFile(
                    appwriteConfig.buckets.customerDocuments,
                    ID.unique(),
                    file
                );

                // Create document record
                await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.documents,
                    ID.unique(),
                    {
                        orderId,
                        fileId: uploadedFile.$id,
                        fileName: file.name,
                        fileType: file.type,
                        uploadedBy: userId,
                        status: 'pending',
                    }
                );
            }

            // Update order status and create timeline entry via API
            if (orderStatus === 'pending_docs' || orderStatus === 'new') {
                try {
                    await fetch('/api/documents/upload-complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId,
                            userId,
                            documentCount: selectedFiles.length,
                            orderStatus
                        })
                    });
                } catch (statusError) {
                    console.error('Failed to update order status:', statusError);
                    // Don't fail the whole upload if this fails
                }
            }

            setSuccess(true);
            setSelectedFiles([]);

            // Call notification API to notify admin
            try {
                await fetch('/api/documents/upload-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId })
                });
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
            }

            // Callback to refresh order details
            setTimeout(() => {
                onUploadSuccess();
            }, 1000);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload documents');
        } finally {
            setUploading(false);
        }
    };

    const hasExistingDocuments = existingDocuments.length > 0;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Upload className="h-6 w-6 text-brand-600 mr-2" />
                Upload Required Documents
            </h3>

            {/* Required documents list */}
            <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Required Documents:</p>
                <ul className="space-y-1">
                    {documentRequired.map((doc, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                            <FileText className="h-4 w-4 text-brand-500 mr-2" />
                            {doc}
                        </li>
                    ))}
                </ul>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm text-green-800">Documents uploaded successfully! Our team will review them shortly.</p>
                </div>
            )}

            {!hasExistingDocuments || !success ? (
                <form onSubmit={handleSubmit}>
                    {/* Drag and drop area */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${dragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <label className="cursor-pointer">
                            <span className="text-brand-600 hover:text-brand-700 font-medium">
                                Click to upload
                            </span>
                            <span className="text-gray-600"> or drag and drop</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleInputChange}
                                className="hidden"
                            />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG, DOC, DOCX up to 10MB each</p>
                    </div>

                    {/* Selected files list */}
                    {selectedFiles.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Selected Files ({selectedFiles.length}):</p>
                            <div className="space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center flex-1">
                                            <FileText className="h-5 w-5 text-brand-500 mr-3" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700 font-medium">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-700 ml-4"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={uploading || selectedFiles.length === 0}
                        className="w-full bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-5 w-5 mr-2" />
                                Upload Documents ({selectedFiles.length})
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">Documents uploaded successfully!</p>
                    <p className="text-sm text-green-700 mt-1">Our team is reviewing your documents.</p>
                </div>
            )}
        </div>
    );
}
