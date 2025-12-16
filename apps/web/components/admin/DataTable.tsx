'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    MoreVertical,
    Eye,
    Download,
    Trash2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    onRowClick?: (row: any) => void;
    rowActions?: (row: any) => React.ReactNode;
    emptyMessage?: string;
    pageSize?: number;
    onDelete?: (selectedIds: string[]) => void;
}

export default function DataTable({
    columns,
    data,
    onRowClick,
    rowActions,
    emptyMessage = 'No data available',
    pageSize = 20,
    onDelete,
}: DataTableProps) {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    // Sorting logic
    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0;

        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortDirection === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        return sortDirection === 'asc'
            ? (aVal > bVal ? 1 : -1)
            : (bVal > aVal ? 1 : -1);
    });

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('desc');
        }
    };

    const toggleRowSelection = (rowId: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(rowId)) {
            newSelected.delete(rowId);
        } else {
            newSelected.add(rowId);
        }
        setSelectedRows(newSelected);
    };

    const toggleAllRows = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedData.map(row => row.$id)));
        }
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                    {/* Table Header */}
                    <thead className="bg-neutral-50/50 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            {/* Selection Checkbox */}
                            <th className="w-12 px-6 py-3">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                    onChange={toggleAllRows}
                                    className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                                />
                            </th>

                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                                >
                                    {column.sortable ? (
                                        <button
                                            onClick={() => handleSort(column.key)}
                                            className="flex items-center gap-2 hover:text-neutral-700 transition-colors group"
                                        >
                                            {column.label}
                                            <ArrowUpDown className={cn(
                                                "w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity",
                                                sortColumn === column.key && "opacity-100"
                                            )} />
                                        </button>
                                    ) : (
                                        column.label
                                    )}
                                </th>
                            ))}

                            {/* Actions Column */}
                            {rowActions && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="bg-white divide-y divide-neutral-100">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (rowActions ? 2 : 1)}
                                    className="px-6 py-12 text-center"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-neutral-900">{emptyMessage}</p>
                                        <p className="text-xs text-neutral-500">Try adjusting your filters</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => (
                                <tr
                                    key={row.$id || index}
                                    onClick={() => onRowClick?.(row)}
                                    className={cn(
                                        "group hover:bg-neutral-50 transition-colors",
                                        onRowClick && "cursor-pointer"
                                    )}
                                >
                                    {/* Selection Checkbox */}
                                    <td className="w-12 px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.has(row.$id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleRowSelection(row.$id);
                                            }}
                                            className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                                        />
                                    </td>

                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                            {column.render ? column.render(row) : (
                                                <div className="text-sm text-neutral-900">
                                                    {row[column.key]}
                                                </div>
                                            )}
                                        </td>
                                    ))}

                                    {/* Actions */}
                                    {rowActions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {rowActions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                    <div className="text-sm text-neutral-600">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(endIndex, sortedData.length)}</span> of{' '}
                        <span className="font-medium">{sortedData.length}</span> results
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={cn(
                                "p-2 rounded-lg border transition-colors",
                                currentPage === 1
                                    ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                            )}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={cn(
                                            "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                                            currentPage === pageNum
                                                ? "bg-brand-600 text-white"
                                                : "text-neutral-700 hover:bg-neutral-100"
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={cn(
                                "p-2 rounded-lg border transition-colors",
                                currentPage === totalPages
                                    ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                            )}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Actions Bar (when rows selected) */}
            {selectedRows.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
                    <div className="bg-neutral-900 text-white rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4">
                        <span className="text-sm font-medium">
                            {selectedRows.size} selected
                        </span>
                        <div className="w-px h-6 bg-neutral-700" />
                        <button className="flex items-center gap-2 text-sm hover:text-brand-300 transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        {onDelete && (
                            <button
                                onClick={() => {
                                    onDelete(Array.from(selectedRows));
                                    setSelectedRows(new Set());
                                }}
                                className="flex items-center gap-2 text-sm hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        )}
                        <button
                            onClick={() => setSelectedRows(new Set())}
                            className="ml-4 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
