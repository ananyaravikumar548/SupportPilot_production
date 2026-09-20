import React, { useState, useRef } from 'react';
import { mockIngestionJobs } from '../../mock/knowledge';

export default function IngestionStatus() {
  const [jobs, setJobs] = useState(mockIngestionJobs);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Trigger file picker dialog
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);

      // Create a new mock job for feedback
      const newJob = {
        jobId: `job-${Math.floor(100 + Math.random() * 900)}`,
        sourceType: files[0].name.endsWith('.pdf') ? 'PDF_BULK' : 'DOC_INJECT',
        status: 'PROCESSING',
        totalDocs: files.length,
        processed: 0,
        failed: 0,
        startedAt: new Date().toISOString(),
      };

      setJobs([newJob, ...jobs]);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Document Ingestion & Parsing</h1>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".pdf,.md,.docx,.txt"
        className="hidden"
      />

      {/* Upload Box */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white hover:border-blue-500 transition-colors">
        <p className="text-gray-600 font-medium">Drag & drop Markdown, PDF, or DOCX files here</p>
        <p className="text-xs text-gray-400 mt-1">Bulk upload auto-chunks and indexes documents into MongoDB Atlas Vector Search</p>
        
        <button
          type="button"
          onClick={handleButtonClick}
          className="mt-4 px-4 py-2 bg-slate-800 text-white text-sm rounded-md hover:bg-slate-900 transition-colors cursor-pointer"
        >
          Select Files
        </button>

        {/* Selected files feedback */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 text-xs text-emerald-600 font-medium">
            Selected {selectedFiles.length} file(s): {selectedFiles.map(f => f.name).join(', ')}
          </div>
        )}
      </div>

      {/* Ingestion Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-700">Recent Ingestion Jobs</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 border-b">
            <tr>
              <th className="p-3">Job ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Processed</th>
              <th className="p-3">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.jobId} className="hover:bg-gray-50">
                <td className="p-3 font-mono font-medium text-blue-600">{job.jobId}</td>
                <td className="p-3 text-gray-600">{job.sourceType}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'PROCESSING'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="p-3 text-gray-600">{job.processed} / {job.totalDocs}</td>
                <td className="p-3 text-gray-500">{new Date(job.startedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}