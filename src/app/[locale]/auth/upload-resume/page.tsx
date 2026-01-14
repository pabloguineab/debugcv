"use client"

import { useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, Loader2 } from "lucide-react"
import Link from "next/link"

function UploadResumeContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const email = searchParams.get('email') || ''
    const userName = session?.user?.name || ''

    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = (selectedFile: File) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!validTypes.includes(selectedFile.type)) {
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

    const handleUpload = async () => {
        if (!file) return

        setIsLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('email', email)

            const res = await fetch('/api/resume/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.error || "Failed to upload resume")
                setIsLoading(false)
                return
            }

            // Success - redirect to welcome page
            window.location.href = `/auth/welcome?name=${encodeURIComponent(userName)}`
        } catch (err) {
            console.error('Error uploading resume:', err)
            setError("An error occurred. Please try again.")
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
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all
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
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />

                        {file ? (
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
                    <p className="text-sm text-red-500">{error}</p>
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
                        Upload
                    </Button>
                    <button
                        onClick={handleSkip}
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium"
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
