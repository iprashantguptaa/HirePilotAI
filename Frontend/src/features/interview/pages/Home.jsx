import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useInterview } from '../hooks/useInterview.js'
import { Button, Textarea, FileUpload, Alert } from '../../../components/ui'
import "../style/home.scss"

const Home = () => {
  const { loading, generateReport } = useInterview()
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const [resumeFile, setResumeFile] = useState(null)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    
    if (!jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required"
    }
    
    if (!resumeFile && !selfDescription.trim()) {
      newErrors.profile = "Please upload a resume or provide a self-description"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGenerateReport = async () => {
    if (!validateForm()) {
      return
    }

    const data = await generateReport({ 
      jobDescription, 
      selfDescription, 
      resumeFile 
    })
    
    if (data) {
      navigate(`/interview/${data._id}`)
    }
  }

  const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  )

  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )

  const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"/>
    </svg>
  )

  if (loading) {
    return (
      <div className='home-page'>
        <div className='home-page__loading'>
          <div className="animate-spin" style={{ marginBottom: 'var(--space-4)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </div>
          <h2>Generating your interview plan…</h2>
          <p>Usually under a minute — scoring your fit and building questions in parallel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='home-page'>
      {/* Hero Section */}
      <header className='home-page__hero'>
        <h1>Create Your Custom <span className="text-gradient">Interview Plan</span></h1>
        <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
      </header>

      {/* Main Form Card */}
      <div className='home-page__card'>
        <div className='home-page__sections'>
          {/* Section 1: Job Description */}
          <section className='home-section'>
            <div className='home-section__header'>
              <div className='home-section__icon home-section__icon--primary'>
                <BriefcaseIcon />
              </div>
              <div className='home-section__title-group'>
                <h2>Target Job Description</h2>
                <span className='home-section__badge home-section__badge--required'>Required</span>
              </div>
            </div>

            <Textarea
              placeholder="Paste the full job description here...&#10;&#10;Example: 'Senior Frontend Engineer at Infosys requires proficiency in React, TypeScript, Node.js, and experience working on large-scale enterprise applications...'"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value)
                if (errors.jobDescription) setErrors({ ...errors, jobDescription: null })
              }}
              rows={8}
              maxLength={5000}
              showCharacterCount
              error={errors.jobDescription}
              fullWidth
            />
          </section>

          {/* Divider */}
          <div className='home-page__divider'>
            <span>AND</span>
          </div>

          {/* Section 2: Your Profile */}
          <section className='home-section'>
            <div className='home-section__header'>
              <div className='home-section__icon home-section__icon--secondary'>
                <UserIcon />
              </div>
              <div className='home-section__title-group'>
                <h2>Your Profile</h2>
                <span className='home-section__badge home-section__badge--optional'>Optional but recommended</span>
              </div>
            </div>

            {/* Resume Upload */}
            <FileUpload
              label="Upload Resume"
              accept=".pdf"
              maxSize={5 * 1024 * 1024}
              onFileSelect={setResumeFile}
              hint="PDF (Max 5MB) - Best results"
            />

            {/* OR Divider */}
            <div className='home-section__or'>
              <span>OR</span>
            </div>

            {/* Self Description */}
            <Textarea
              label="Quick Self-Description"
              placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
              value={selfDescription}
              onChange={(e) => {
                setSelfDescription(e.target.value)
                if (errors.profile) setErrors({ ...errors, profile: null })
              }}
              rows={4}
              maxLength={2000}
              showCharacterCount
              fullWidth
            />

            {errors.profile && (
              <Alert
                variant="error"
                message={errors.profile}
                className="animate-shake"
              />
            )}
          </section>
        </div>

        {/* Card Footer */}
        <div className='home-page__footer'>
          <div className='home-page__footer-info'>
            <SparklesIcon />
            <span>AI-Powered Strategy Generation • Approx 30s</span>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerateReport}
            loading={loading}
            disabled={loading}
          >
            Generate My Interview Strategy
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Home
