"use client";

import React, { useState, useEffect } from "react";

interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  numRows: number;
  numColumns: number;
  columns: string[];
  columnTypes: Record<string, string>;
}

interface DataSummary {
  totalFiles: number;
  totalRows: number;
  dateRange: { start: string; end: string };
  columns: string[];
}

export default function HistoryPage() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
    loadSummary();
  }, []);

  const loadFiles = async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files);
      }
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await fetch('/api/query');
      if (res.ok) {
        const summary = await res.json();
        setDataSummary(summary);
      }
    } catch (err) {
      console.error('Error loading summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data History</h1>
        <p className="text-lg text-gray-600">
          View all your uploaded files and track your data over time
        </p>
      </div>

      {/* Summary Cards */}
      {dataSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📁</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{dataSummary.totalFiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900">{dataSummary.totalRows.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Columns</p>
                <p className="text-2xl font-bold text-gray-900">{dataSummary.columns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">First Upload</p>
                <p className="text-lg font-bold text-gray-900">
                  {dataSummary.dateRange.start ? new Date(dataSummary.dateRange.start).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Uploaded Files</h2>
        
        <div className="space-y-4">
          {files.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{file.fileName}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded {new Date(file.uploadDate).toLocaleDateString()} at {new Date(file.uploadDate).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">
                    {(file.fileSize / 1024).toFixed(1)} KB
                  </div>
                  <div className="text-xs text-gray-400">
                    {file.numRows.toLocaleString()} rows • {file.numColumns} columns
                  </div>
                </div>
              </div>
              
              {/* Column Information */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Columns:</h4>
                <div className="flex flex-wrap gap-2">
                  {file.columns.map((column, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {column} ({file.columnTypes[column]})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {files.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
              <p className="text-gray-500 mb-4">Start by uploading your first data file</p>
              <a
                href="/upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Upload your first file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 