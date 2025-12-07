'use client';

import { useState, useEffect } from 'react';
import { Upload, X, FileText, Download, Trash2 } from 'lucide-react';
import { account } from '@lawethic/appwrite/client';

interface Certificate {
    id: string;
    documentType: string;
    documentName: string;
    fileName: string;
    fileId: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    uploadedByName: string;
    uploadedAt: string;
    downloadCount: number;
    downloadUrl: string;
}

interface CertificateUploadProps {
    orderId: string;
    onUploadSuccess?: () => void;
}

const DOCUMENT_TYPES = [
    { value: 'gst_certificate', label: 'GST Registration Certificate' },
    { value: 'incorporation_certificate', label: 'Certificate of Incorporation' },
    { value: 'pan_card', label: 'PAN Card' },
    { value: 'tan_certificate', label: 'TAN Certificate' },
    { value: 'partnership_deed', label: 'Partnership Deed' },
    { value: 'moa', label: 'Memorandum of Association' },
    { value: 'aoa', label: 'Articles of Association' },
    { value: 'trademark_certificate', label: 'Trademark Certificate' },
    { value: 'other', label: 'Other Document' },
];

export default function CertificateUpload({ orderId, onUploadSuccess }: CertificateUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState('');
    const [documentName, setDocumentName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const user = await account.get();
            setCurrentUser(user);
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
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

    const handleFileSelect = (selectedFile: File) => {
        // Validate file size (10MB)
        if (selectedFile.size > 10485760) {
            setError('File size must be less than 10MB');
            return;
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX');
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !documentType || !documentName) {
            setError('Please fill all fields and select a file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Get admin user info from current session
            const adminId = currentUser?.$id || 'unknown';
            const adminName = currentUser?.name || 'Admin User';

            const formData = new FormData();
            formData.append('file', file);
            formData.append('orderId', orderId);
            formData.append('documentType', documentType);
            formData.append('documentName', documentName);
            formData.append('uploadedBy', adminId);
            formData.append('uploadedByName', adminName);

            const response = await fetch('/api/admin/certificates/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            // Reset form
            setFile(null);
            setDocumentType('');
            setDocumentName('');

            // Call success callback
            if (onUploadSuccess) {
                onUploadSuccess();
            }

        } catch (err: any) {
            setError(err.message || 'Failed to upload certificate');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setError('');
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-6">
            {/* Document Type Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                </label>
                <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={uploading}
                >
                    <option value="">Select document type...</option>
                    {DOCUMENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Document Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Name *
                </label>
                <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="e.g., GST Registration Certificate - ABC Pvt Ltd"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={uploading}
                />
            </div>

            {/* File Upload Area */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File *
                </label>

                {!file ? (
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                            Drag and drop your file here, or
                        </p>
                        <label className="inline-block cursor-pointer">
                            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Browse Files
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileInputChange}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                disabled={uploading}
                            />
                        </label>
                        <p className="text-sm text-gray-500 mt-4">
                            PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                        </p>
                    </div>
                ) : (
                    <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="font-medium text-gray-900">{file.name}</p>
                                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                        </div>
                        <button
                            onClick={removeFile}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={uploading}
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={!file || !documentType || !documentName || uploading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
                {uploading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                    </span>
                ) : (
                    'Upload Certificate'
                )}
            </button>
        </div>
    );
}

interface CertificateListProps {
    orderId: string;
    certificates: Certificate[];
    onDelete?: (certificateId: string) => void;
}

export function CertificateList({ orderId, certificates, onDelete }: CertificateListProps) {
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (certificates.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No certificates uploaded yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {certificates.map((cert) => (
                <div
                    key={cert.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 mb-1">
                                    {cert.documentName}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    {cert.fileName} • {formatFileSize(cert.fileSize)}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>Uploaded by {cert.uploadedByName}</span>
                                    <span>•</span>
                                    <span>{formatDate(cert.uploadedAt)}</span>
                                    <span>•</span>
                                    <span>{cert.downloadCount} downloads</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                            <a
                                href={cert.downloadUrl}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Download"
                            >
                                <Download className="w-5 h-5 text-gray-600" />
                            </a>
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(cert.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
