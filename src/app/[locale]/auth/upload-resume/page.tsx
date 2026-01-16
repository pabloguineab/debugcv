"use client"

import { useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { extractProfileFromCV, type ExtractedProfile } from "@/app/actions/extract-profile-from-cv"
import { 
    updateProfile, 
    saveExperience, 
    saveEducation, 
    saveProject, 
    saveCertification 
} from "@/lib/actions/profile"

function UploadResumeContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const email = searchParams.get('email') || ''

    // Get name from URL (passed from onboarding) or session
    // Filter out email addresses from session name
    const sessionName = session?.user?.name?.includes('@') ? '' : session?.user?.name
    const userName = searchParams.get('name') || sessionName || ''

    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = (selectedFile: File) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
            setError("Please upload a PDF or DOCX file")
            return
        }
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            setError("File size must be less than 10MB")
            return
        }
        setFile(selectedFile)
        setError(null)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) handleFile(droppedFile)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const saveImportedData = async (data: ExtractedProfile) => {
        // 1. Update Overview/Profile data
        if (data.overview) {
            const { bio, linkedin_user, github_user, location, full_name } = data.overview;
            await updateProfile({
                bio: bio || undefined,
                linkedin_user: linkedin_user || undefined,
                github_user: github_user || undefined,
                full_name: full_name || undefined,
                location: location || undefined,
            });
        }

        // 2. Update Tech Stack
        if (data.tech_stack && data.tech_stack.length > 0) {
            const techIds = data.tech_stack.map(tech =>
                tech.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
            );
            await updateProfile({ tech_stack: techIds });
        }

        // 3. Update Languages
        if (data.languages && data.languages.length > 0) {
            await updateProfile({ languages: data.languages });
        }

        // 4. Save Experiences
        if (data.experiences && data.experiences.length > 0) {
            for (const exp of data.experiences) {
                await saveExperience({
                    title: exp.title,
                    employment_type: exp.employment_type || "Full-time",
                    company_name: exp.company_name,
                    company_url: exp.company_url || "",
                    country: exp.country || "",
                    start_month: exp.start_month,
                    start_year: exp.start_year,
                    end_month: exp.end_month || "",
                    end_year: exp.end_year || "",
                    is_current: exp.is_current,
                    description: exp.description,
                    skills: exp.skills || []
                });
            }
        }

        // 5. Save Education
        if (data.educations && data.educations.length > 0) {
            for (const edu of data.educations) {
                await saveEducation({
                    school: edu.school,
                    school_url: edu.school_url || "",
                    degree: edu.degree || "",
                    field_of_study: edu.field_of_study || "",
                    grade: edu.grade || "",
                    activities: edu.activities || "",
                    description: edu.description || "",
                    start_year: edu.start_year,
                    end_year: edu.end_year || "",
                    is_current: edu.is_current
                });
            }
        }

        // 6. Save Projects
        if (data.projects && data.projects.length > 0) {
            for (const proj of data.projects) {
                await saveProject({
                    name: proj.name,
                    project_url: proj.project_url || "",
                    description: proj.description || "",
                    technologies: proj.technologies || [],
                    is_ongoing: proj.is_ongoing,
                    start_month: proj.start_month || "",
                    start_year: proj.start_year || "",
                    end_month: proj.end_month || "",
                    end_year: proj.end_year || ""
                });
            }
        }

        // 7. Save Certifications
        if (data.certifications && data.certifications.length > 0) {
            for (const cert of data.certifications) {
                await saveCertification({
                    name: cert.name,
                    issuing_org: cert.issuing_org,
                    credential_id: cert.credential_id || "",
                    credential_url: cert.credential_url || "",
                    issue_month: cert.issue_month || "",
                    issue_year: cert.issue_year || "",
                    expiration_month: cert.expiration_month || "",
                    expiration_year: cert.expiration_year || "",
                    no_expiration: cert.no_expiration,
                    skills: cert.skills || []
                });
            }
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setIsLoading(true)
        setError(null)
        setStatus('uploading')

        try {
            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 500))
            setStatus('processing')

            // Extract and validate using AI
            const formData = new FormData()
            formData.append('file', file)

            const result = await extractProfileFromCV(formData)

            if (!result.success) {
                // Handle specific error types
                setError(result.errorMessage || "Could not extract data from the CV. Please try again.")
                setStatus('error')
                setIsLoading(false)
                return
            }

            if (result.data) {
                // Save all extracted data to database
                await saveImportedData(result.data)
                
                // Also upload the file to storage
                const uploadFormData = new FormData()
                uploadFormData.append('file', file)
                uploadFormData.append('email', email)
                await fetch('/api/resume/upload', {
                    method: 'POST',
                    body: uploadFormData,
                })
            }

            // Success - redirect to welcome page
            window.location.href = `/auth/welcome?name=${encodeURIComponent(result.data?.overview?.full_name || userName)}`
        } catch (err) {
            console.error('Error uploading resume:', err)
            setError("An error occurred. Please try again.")
            setStatus('error')
            setIsLoading(false)
        }
    }

    const handleSkip = () => {
        window.location.href = `/auth/welcome?name=${encodeURIComponent(userName)}`
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-xl text-center space-y-8">
                {/* Icon */}
                <div className="mx-auto w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-blue-600" />
                </div>

                {/* Title */}
                <div className="space-y-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Upload your resume
                    </h1>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        We'll use your resume to automatically complete your profile. This
                        means you get matched you with relevant jobs and can generate
                        tailored resumes, cover letters, and mock interviews. If you don't
                        have a resume on hand, <Link href="/auth/linkedin-import" className="text-blue-600 hover:underline">upload your LinkedIn profile</Link> instead.
                    </p>
                </div>

                {/* Upload Area */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900 text-left">Resume</p>
                    <div
                        onClick={() => !isLoading && fileInputRef.current?.click()}
                        onDrop={!isLoading ? handleDrop : undefined}
                        onDragOver={!isLoading ? handleDragOver : undefined}
                        onDragLeave={handleDragLeave}
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 transition-all
                            ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                            ${isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : file
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
                            }
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx"
                            className="hidden"
                            disabled={isLoading}
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />

                        {isLoading ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        {status === 'uploading' ? 'Uploading...' : 'Extracting profile data...'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {status === 'processing' && 'This may take a few seconds'}
                                    </p>
                                </div>
                            </div>
                        ) : file ? (
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="w-8 h-8 text-green-600" />
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setFile(null)
                                    }}
                                    className="ml-2 p-1 hover:bg-gray-200 rounded-full"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-gray-400" />
                                <p className="text-sm">
                                    <span className="text-blue-600 font-medium">Click to upload</span>
                                    {" "}or drag and drop
                                </p>
                                <p className="text-xs text-gray-400">We support PDF and DOCX files only</p>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-left">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800">Import failed</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Privacy Notice */}
                <p className="text-xs text-gray-400 text-left leading-relaxed">
                    By uploading your resume, you agree to its temporary storage and sharing with our AI
                    partners for processing. Please ensure any personal information you do not wish to be
                    shared is removed prior to upload. Your use of this service and the DebugCV site
                    constitutes acceptance of our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                    Your profile will be public to help you get discovered, however, you can change this at any time in your account settings.
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium rounded-xl"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? (status === 'uploading' ? 'Uploading...' : 'Processing...') : 'Upload'}
                    </Button>
                    <button
                        onClick={handleSkip}
                        disabled={isLoading}
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function UploadResumePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>}>
            <UploadResumeContent />
        </Suspense>
    )
}
