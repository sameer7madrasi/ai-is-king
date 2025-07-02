"use client";

import React, { useState, useEffect } from "react";

interface DataInsights {
  fileId: string;
  numRows: number;
  numColumns: number;
  columns: string[];
  columnTypes: Record<string, string>;
  sample: any[];
}

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

export default function Home() {
  const [insights, setInsights] = useState<DataInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  // Load files and summary on component mount
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
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload file");
      }
      const data = await res.json();
      console.log('API Response received:', data);
      console.log('Sample data:', data.sample);
      console.log('Columns:', data.columns);
      console.log('Column types:', data.columnTypes);
      setInsights(data);
      
      // Reload files and summary after upload
      await loadFiles();
      await loadSummary();
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Mil by 30
          </h1>
          <p className="text-lg text-gray-600">
            Upload your data below. Time to let AI control your life.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upload Data
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Data History
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-4">
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        Choose a file
                      </label>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      CSV, XLSX, or XLS files up to 10MB
                    </p>
                  </div>
                </div>

                {loading && (
                  <div className="mt-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Processing your file...</span>
                  </div>
                )}

                {error && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                {insights && (
                  <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {insights.numRows.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-800">Total Rows</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {insights.numColumns}
                        </div>
                        <div className="text-sm text-green-800">Total Columns</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">
                          {insights.columns.length}
                        </div>
                        <div className="text-sm text-purple-800">Data Fields</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {insights.columns.map((column, index) => (
                              <th
                                key={index}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {insights.sample.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {insights.columns.map((column, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                  {row[column] !== null && row[column] !== undefined
                                    ? String(row[column])
                                    : "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                {dataSummary && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {dataSummary.totalFiles}
                      </div>
                      <div className="text-sm text-blue-800">Total Files</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {dataSummary.totalRows.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-800">Total Rows</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {dataSummary.columns.length}
                      </div>
                      <div className="text-sm text-purple-800">Unique Columns</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {dataSummary.dateRange.start ? new Date(dataSummary.dateRange.start).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-sm text-yellow-800">First Upload</div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{file.fileName}</h3>
                          <p className="text-sm text-gray-500">
                            Uploaded {new Date(file.uploadDate).toLocaleDateString()} • {file.numRows.toLocaleString()} rows • {file.numColumns} columns
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {files.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No files uploaded yet. Upload your first file to see it here.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
