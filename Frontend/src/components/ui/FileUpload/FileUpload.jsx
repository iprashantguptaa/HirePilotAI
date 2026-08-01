// ============================================================================
// HirePilot AI - File Upload Component
// ============================================================================
// Drag-and-drop file upload with preview and validation
// ============================================================================

import { useRef, useState } from 'react'
import './FileUpload.scss'

const FileUpload = ({ 
  accept = '.pdf,.docx',
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileSelect,
  label = 'Upload File',
  hint = 'PDF or DOCX (Max 5MB)',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (!file) return false

    // Check file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return false
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    const acceptedTypes = accept.split(',').map(type => type.trim().toLowerCase())
    
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Only ${accept} files are allowed`)
      return false
    }

    setError('')
    return true
  }

  const handleFileSelect = (file) => {
    if (!file) return

    if (validateFile(file)) {
      setSelectedFile(file)
      if (onFileSelect) {
        onFileSelect(file)
      }
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    handleFileSelect(file)
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    handleFileSelect(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onFileSelect) {
      onFileSelect(null)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )

  const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )

  const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )

  return (
    <div className={`file-upload ${className}`}>
      {label && <label className="file-upload__label">{label}</label>}

      {selectedFile ? (
        // File selected state
        <div className="file-upload__preview animate-scale-in">
          <div className="file-upload__preview-icon">
            <FileIcon />
          </div>
          <div className="file-upload__preview-info">
            <div className="file-upload__preview-name">{selectedFile.name}</div>
            <div className="file-upload__preview-size">{formatFileSize(selectedFile.size)}</div>
          </div>
          <div className="file-upload__preview-check">
            <CheckIcon />
          </div>
          <button
            type="button"
            className="file-upload__preview-remove"
            onClick={handleRemoveFile}
            aria-label="Remove file"
          >
            <XIcon />
          </button>
        </div>
      ) : (
        // Upload dropzone
        <div
          className={`file-upload__dropzone ${isDragging ? 'file-upload__dropzone--dragging' : ''} ${error ? 'file-upload__dropzone--error' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="file-upload__dropzone-icon">
            <UploadIcon />
          </div>
          <div className="file-upload__dropzone-text">
            <p className="file-upload__dropzone-title">
              {isDragging ? 'Drop file here' : 'Click to upload or drag & drop'}
            </p>
            <p className="file-upload__dropzone-hint">{hint}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="file-upload__input"
            aria-label={label}
          />
        </div>
      )}

      {error && (
        <div className="file-upload__error">
          {error}
        </div>
      )}
    </div>
  )
}

export default FileUpload
