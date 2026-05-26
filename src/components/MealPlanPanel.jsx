import React, { useRef, useState } from 'react';
import {
  createOrReplaceMealPlan,
  uploadMealPlanPdf, downloadMealPlanPdf, deleteMealPlanPdf,
} from '../services/api';

const PdfIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function MealPlanPanel({ mealPlan, onSaved, isAdmin = false, patientId, dietitianId }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletingPdf, setDeletingPdf] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const fileInputRef = useRef(null);

  const hasPdf = mealPlan?.hasPdf;
  const fileName = mealPlan?.fileName;

  const handleUploadPdf = async () => {
    setUploadError('');
    if (!pdfFile) {
      setUploadError('Please select a file before uploading.');
      return;
    }
    if (pdfFile.size > 10 * 1024 * 1024) {
      setUploadError('File must be under 10 MB.');
      return;
    }
    if (pdfFile.type !== 'application/pdf') {
      setUploadError('Only valid PDF files are accepted.');
      return;
    }
    try {
      setUploading(true);
      let planId = mealPlan?.id;
      if (!planId) {
        const created = await createOrReplaceMealPlan({ patientId, dietitianId, foodList: [] });
        planId = created.data.id;
        onSaved && onSaved(created.data);
      }
      const res = await uploadMealPlanPdf(planId, pdfFile);
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSaved && onSaved(res.data);
    } catch (e) {
      if (e.response?.status === 404) {
        setUploadError('Meal plan not found.');
      } else if (e.response?.status === 400) {
        setUploadError(e.response?.data?.error || 'Only valid PDF files are accepted.');
      } else {
        setUploadError('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePdf = async () => {
    if (!window.confirm('Remove the PDF from this meal plan?')) return;
    try {
      setDeletingPdf(true);
      await deleteMealPlanPdf(mealPlan.id);
      onSaved && onSaved({ ...mealPlan, hasPdf: false, fileName: null });
    } catch (e) {
      alert(e.response?.status === 404 ? 'No PDF found for this plan.' : 'Could not remove PDF. Please try again.');
    } finally {
      setDeletingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadError('');
    try {
      setDownloading(true);
      const res = await downloadMealPlanPdf(mealPlan.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      setDownloadError('Could not open PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-dark-600">
        <h3 className="font-display text-lg tracking-wider text-primary">MEAL PLAN</h3>
        {hasPdf && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-lime-400" />
            <span className="font-body text-xs text-lime-400">Active</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {isAdmin ? (
          <div className="space-y-4">
            {/* Current PDF status */}
            {hasPdf ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-dark-700 rounded-lg border border-dark-500">
                  <div className="w-10 h-10 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center flex-shrink-0">
                    <PdfIcon className="w-5 h-5 text-lime-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-primary truncate">{fileName || 'Nutrition Plan PDF'}</p>
                    <p className="font-body text-xs text-lime-400">PDF uploaded</p>
                  </div>
                  <button
                    onClick={handleDeletePdf}
                    disabled={deletingPdf || uploading}
                    className="font-body text-xs text-muted hover:text-red-400 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {deletingPdf ? 'Removing...' : 'Remove'}
                  </button>
                </div>
                <p className="font-body text-xs text-yellow-400/80">
                  Uploading a new file will replace the existing PDF.
                </p>
              </>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-dark-700 rounded-lg border border-dark-600">
                <div className="w-10 h-10 rounded-lg bg-dark-600 border border-dark-500 flex items-center justify-center flex-shrink-0">
                  <PdfIcon className="w-5 h-5 text-muted" />
                </div>
                <p className="font-body text-sm text-muted">No PDF uploaded yet.</p>
              </div>
            )}

            {/* Upload row */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={e => { setPdfFile(e.target.files[0] || null); setUploadError(''); }}
                className="flex-1 font-body text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-body file:text-xs file:bg-dark-600 file:text-primary file:cursor-pointer hover:file:bg-dark-500 transition-colors"
              />
              <button
                onClick={handleUploadPdf}
                disabled={uploading || deletingPdf}
                className="flex items-center gap-1.5 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/20 text-lime-400 font-body text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {uploading ? (
                  <><div className="w-3 h-3 border-2 border-lime-400/40 border-t-lime-400 rounded-full animate-spin" />Uploading...</>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload PDF
                  </>
                )}
              </button>
            </div>

            {uploadError && (
              <p className="font-body text-xs text-red-400">{uploadError}</p>
            )}
          </div>
        ) : hasPdf ? (
          /* Patient: PDF available */
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-dark-700 rounded-lg border border-dark-500">
              <div className="w-10 h-10 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center flex-shrink-0">
                <PdfIcon className="w-5 h-5 text-lime-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-primary truncate">{fileName || 'Nutrition Plan PDF'}</p>
                <p className="font-body text-xs text-muted">Your personalised meal plan</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/20 text-lime-400 font-body text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <><div className="w-4 h-4 border-2 border-lime-400/40 border-t-lime-400 rounded-full animate-spin" />Opening...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Open PDF
                </>
              )}
            </button>
            {downloadError && (
              <p className="font-body text-xs text-red-400">{downloadError}</p>
            )}
          </div>
        ) : (
          /* Patient: no PDF yet */
          <div className="text-center py-8">
            <PdfIcon className="w-10 h-10 text-dark-500 mx-auto mb-3" />
            <p className="font-body text-sm text-muted">No meal plan uploaded yet.</p>
            <p className="font-body text-xs text-dark-400 mt-1">Your dietitian will upload a personalised plan once you're enrolled.</p>
          </div>
        )}
      </div>
    </div>
  );
}
