/**
 * File Upload Component
 *
 * Upload bukti pembayaran (JPG, PNG, PDF)
 * Max size: 5MB
 * With preview for images
 *
 * Style: Government Structured Brutalism
 *
 * Last Updated: 2025-11-23
 */

import { AlertCircle, Upload, X } from 'lucide-react'
import { useState } from 'react'

interface FileUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  error?: string
  progress?: number
}

export default function FileUpload({ file, onFileChange, error, progress }: FileUploadProps) {
  const [preview, setPreview] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(selectedFile.type)) {
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      return
    }

    onFileChange(selectedFile)

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview('')
    }
  }

  const handleRemove = () => {
    onFileChange(null)
    setPreview('')
  }

  return (
    <div>
      <label
        htmlFor="file-upload"
        className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
      >
        Bukti Pembayaran <span className="text-red-600">*</span>
      </label>

      {!file ? (
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed cursor-pointer transition-all group relative overflow-hidden ${
            error
              ? 'border-red-500 bg-red-50 hover:bg-red-100'
              : 'border-slate-400 bg-slate-50 hover:border-black hover:bg-yellow-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
            <div className="p-3 bg-white border-2 border-black shadow-hard-sm mb-3 group-hover:-translate-y-1 group-hover:shadow-hard transition-all">
              <Upload className="h-6 w-6 text-black" />
            </div>
            <p className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
              Klik untuk upload
            </p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              JPG, PNG, atau PDF (Max 5MB)
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="border-2 border-black bg-white p-4 shadow-hard-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {preview ? (
                <div className="relative border-2 border-slate-200 inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-32 w-auto object-contain bg-slate-50"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 border-2 border-black bg-red-50 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-black text-red-600">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      {file.name}
                    </p>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {progress !== undefined && progress > 0 && progress < 100 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">
                      Mengupload...
                    </span>
                    <span className="font-mono font-bold text-slate-900">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 border border-slate-200">
                    <div
                      className="bg-black h-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white border-2 border-black hover:bg-red-50 hover:text-red-600 hover:shadow-hard transition-all"
              title="Hapus File"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 uppercase">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}
