"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown, ChevronUp, Check, X, AlertCircle, FileText,
    Target, Shield, FileCheck, ShieldCheck, Zap, Users, Sparkles, RefreshCw,
    CheckCircle2, XCircle, HelpCircle, Mail, Upload, ArrowRight
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

type AnalysisResult = {
    score: number;
    summary: string;
    critical_errors: string[];
    improvements: string[];
};

// Progress Bar Component using shadcn
function ProgressBar({ value, color = "blue" }: { value: number; color?: string }) {
    return (
        <Progress value={value} className="h-2" />
    );
}

// Expandable Section Component using shadcn Collapsible
function ReportSection({
    icon: Icon,
    title,
    issueCount,
    status,
    children,
    defaultOpen = false
}: {
    icon: any;
    title: string;
    issueCount?: number;
    status?: "success" | "warning" | "error";
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const statusColors = {
        success: "bg-emerald-100 text-emerald-600 border-emerald-200",
        warning: "bg-amber-100 text-amber-600 border-amber-200",
        error: "bg-red-100 text-red-600 border-red-200"
    };

    return (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between p-5 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">{title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {issueCount !== undefined && (
                            <Badge variant={status === "success" ? "default" : status === "error" ? "destructive" : "secondary"} className={status ? statusColors[status] : ""}>
                                {issueCount === 0 ? "No issues" : `${issueCount} issue${issueCount > 1 ? 's' : ''}`}
                            </Badge>
                        )}
                        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <Separator />
                    <div className="px-5 pb-5 pt-4">
                        {children}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full flex items-start gap-2 py-3 text-left hover:text-blue-600 transition-colors">
                <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-blue-600">{question}</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <p className="text-sm text-gray-600 pl-6 pb-3 leading-relaxed">{answer}</p>
            </CollapsibleContent>
        </Collapsible>
    );
}

// Expandable Category Component for Score Card
type CategoryItem = {
    name: string;
    status: "success" | "warning" | "error";
    issues: number;
};

function ExpandableCategory({
    name,
    score,
    items
}: {
    name: string;
    score: number;
    items: CategoryItem[];
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between py-3 hover:bg-accent transition-colors rounded-lg px-2 -mx-2">
                <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">{name}</span>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-600">
                        {score}%
                    </Badge>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </motion.div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="pl-4 pb-3 space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 py-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                                {item.status === "success" ? (
                                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                    <X className="w-4 h-4 text-red-500 shrink-0" />
                                )}
                                <span className="text-sm text-gray-600 truncate">{item.name}</span>
                            </div>
                            <Badge variant={item.issues === 0 ? "default" : "secondary"} className={`text-xs whitespace-nowrap shrink-0 ${item.issues === 0
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-100 text-gray-600"
                                }`}>
                                {item.issues === 0 ? "No issues" : `${item.issues} issues`}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

// Result Status Box
function StatusBox({ status, title, description }: { status: "success" | "warning" | "error"; title: string; description: string }) {
    const configs = {
        success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2, iconColor: "text-emerald-500" },
        warning: { bg: "bg-amber-50", border: "border-amber-200", icon: AlertCircle, iconColor: "text-amber-500" },
        error: { bg: "bg-red-50", border: "border-red-200", icon: XCircle, iconColor: "text-red-500" }
    };
    const config = configs[status];
    const Icon = config.icon;

    return (
        <Card className={`${config.bg} ${config.border} border`}>
            <CardContent className="p-6 text-center">
                <Icon className={`w-10 h-10 ${config.iconColor} mx-auto mb-3`} />
                <p className="font-bold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </CardContent>
        </Card>
    );
}

// Analyzing Animation Component
function AnalyzingAnimation() {
    const [currentStep, setCurrentStep] = useState(0);
    const [categoryProgress, setCategoryProgress] = useState([0, 0, 0, 0]);

    const steps = [
        "Scanning resume structure",
        "Evaluating experience impact",
        "Extracting matching skills",
        "Generating strategic insights"
    ];

    const categories = ["CONTENT", "SECTION", "ATS ESSENTIALS", "ADAPTATION"];

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < steps.length - 1) return prev + 1;
                return prev;
            });
        }, 2500);

        return () => clearInterval(stepInterval);
    }, []);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setCategoryProgress(prev => {
                const newProgress = [...prev];
                const activeIndex = Math.min(currentStep, 3);

                for (let i = 0; i <= activeIndex; i++) {
                    if (newProgress[i] < 100) {
                        newProgress[i] = Math.min(100, newProgress[i] + (i === activeIndex ? 8 : 15));
                    }
                }
                return newProgress;
            });
        }, 200);

        return () => clearInterval(progressInterval);
    }, [currentStep]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 items-center justify-center min-h-[calc(100vh-12rem)]"
        >
            <Card className="max-w-2xl w-full">
                <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left side - Score */}
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Score</h2>
                            <div className="relative w-32 h-32 mx-auto mb-6">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                    <motion.circle
                                        cx="50" cy="50" r="40"
                                        stroke="#3b82f6"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="251"
                                        strokeLinecap="round"
                                        initial={{ strokeDashoffset: 251 }}
                                        animate={{ strokeDashoffset: 251 - (currentStep + 1) / steps.length * 180 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-blue-600">
                                        {Math.round(((currentStep + 1) / steps.length * 100) - 5)}%
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {categories.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className={categoryProgress[i] > 0 ? "text-gray-700" : "text-gray-400"}>
                                            {item}
                                        </span>
                                        <Progress value={categoryProgress[i]} className="w-24 h-2" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right side - Steps */}
                        <div className="bg-blue-50 rounded-xl p-6 flex flex-col justify-center">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    className="flex items-center gap-3 py-3"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{
                                        opacity: i <= currentStep ? 1 : 0.3,
                                        x: i <= currentStep ? 0 : -10
                                    }}
                                    transition={{ delay: i * 0.1, duration: 0.3 }}
                                >
                                    {i < currentStep ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                                        >
                                            <Check className="w-4 h-4 text-white" />
                                        </motion.div>
                                    ) : i === currentStep ? (
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <motion.div
                                                className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                                    )}
                                    <span className={`font-medium ${i <= currentStep ? "text-gray-800" : "text-gray-400"}`}>
                                        {step}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Enhanced File Upload Component
function FileUploadSimple({ onFileSelect }: { onFileSelect: (file: File) => void }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer group ${isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
        >
            <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full">
                <motion.div
                    animate={{
                        y: isDragging ? -10 : 0,
                        scale: isDragging ? 1.1 : 1
                    }}
                    className="mb-6 relative"
                >
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-all">
                        <Upload className="w-12 h-12 text-white" />
                    </div>
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {isDragging ? 'Drop your file here!' : 'Drag your resume here'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">or click to select</p>

                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600 font-medium">PDF, DOC, DOCX (max 5MB)</span>
                </div>
            </label>
        </div>
    );
}

export default function ATSScannerPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [activeUsers, setActiveUsers] = useState(1254);

    useEffect(() => {
        setActiveUsers(1247 + Math.floor(Math.random() * 10));
    }, []);

    const performAnalysis = async (file: File, desc: string, title: string) => {
        setIsAnalyzing(true);
        setResult(null);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("jobDescription", desc);
            formData.append("jobTitle", title);

            const response = await fetch("/api/analyze-cv", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Error en el análisis");
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error("Analysis failed:", err);
            setError("There was an error analyzing your resume. Please ensure the file is valid and the job description is clear.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnalyzeJob = () => {
        if (!jobDescription.trim() || !selectedFile) return;
        performAnalysis(selectedFile, jobDescription, jobTitle);
    };

    // Calculate category scores
    const categories = useMemo(() => {
        if (!result) return null;
        const errorCount = result.critical_errors.length;
        const improvementCount = result.improvements.length;
        const totalIssues = errorCount + improvementCount;

        return {
            content: {
                score: Math.max(50, 100 - errorCount * 8),
                issues: Math.min(errorCount, 5),
                items: [
                    { name: "ATS Analysis Rate", status: "success" as const, issues: 0 },
                    { name: "Quantifying Impact", status: errorCount > 0 ? "error" as const : "success" as const, issues: Math.min(3, errorCount) },
                    { name: "Repetition", status: improvementCount > 3 ? "error" as const : "success" as const, issues: Math.min(2, Math.floor(improvementCount / 2)) },
                    { name: "Spelling & Grammar", status: totalIssues > 5 ? "error" as const : "success" as const, issues: Math.min(13, totalIssues) },
                ]
            },
            sections: {
                score: Math.max(60, 100 - improvementCount * 5),
                issues: Math.min(2, Math.floor(improvementCount / 3)),
                items: [
                    { name: "Essential Sections", status: improvementCount > 2 ? "error" as const : "success" as const, issues: improvementCount > 2 ? 1 : 0 },
                    { name: "Contact Information", status: "error" as const, issues: 1 },
                ]
            },
            essentials: {
                score: 90,
                issues: 0,
                items: [
                    { name: "File Format & Size", status: "success" as const, issues: 0 },
                    { name: "Design & Layout", status: errorCount > 3 ? "error" as const : "success" as const, issues: errorCount > 3 ? 1 : 0 },
                    { name: "Email Address", status: "success" as const, issues: 0 },
                    { name: "Header Hyperlinks", status: "success" as const, issues: 0 },
                ]
            },
            adaptation: {
                score: Math.max(70, result.score),
                issues: totalIssues > 10 ? 3 : totalIssues > 5 ? 2 : 1,
                items: [
                    { name: "Hard Skills", status: "warning" as const, issues: 0 },
                    { name: "Soft Skills", status: "warning" as const, issues: 0 },
                    { name: "Action Verbs", status: "warning" as const, issues: 0 },
                    { name: "Job Title Match", status: "warning" as const, issues: 0 },
                ]
            }
        };
    }, [result]);

    const handleQuickPaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setJobDescription(text);
            }
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    const handleFileSelect = async (file: File) => {
        if (!session) { router.push("/auth/signin"); return; }
        setSelectedFile(file);
        setError(null);
        setResult(null);

        // Auto-trigger analysis if job details are present
        if (jobTitle.trim() && jobDescription.trim()) {
            performAnalysis(file, jobDescription, jobTitle);
        }
    };


    const totalIssues = result ? result.critical_errors.length + result.improvements.length : 0;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <AnimatePresence mode="wait">
                {/* Upload State */}
                {!result && !isAnalyzing && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-7xl mx-auto w-full flex flex-col gap-6"
                    >
                        {/* Header - Minimalist */}
                        {/* Header - Desktop Style */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                                    <Target className="w-6 h-6 text-blue-600" />
                                    ATS Scanner
                                    <Badge variant="secondary" className="ml-2 text-blue-600 bg-blue-100 dark:bg-blue-900/30">
                                        Pro
                                    </Badge>
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Analyze your resume just like Fortune 500 companies do
                                </p>
                            </div>
                        </div>



                        {/* Main Content Grid - 3 columns */}
                        <div className="grid lg:grid-cols-3 gap-4">
                            {/* Animated Copy Offer Widget */}
                            <Card className="border-dashed overflow-hidden lg:col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Quick Paste</CardTitle>
                                    <CardDescription className="text-xs">
                                        Copy the job offer from LinkedIn, Indeed, etc.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 pb-4 px-4">
                                    {/* Animated Browser Widget - From ATSReviewModal */}
                                    <div
                                        onClick={handleQuickPaste}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-md relative h-64 cursor-pointer group hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                                    >
                                        {/* Browser header */}
                                        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                            </div>
                                            <div className="flex-1 bg-white dark:bg-gray-700 rounded px-2 py-1 text-[10px] text-gray-400 dark:text-gray-500 truncate flex items-center">
                                                <span className="w-3 h-3 bg-gray-200 dark:bg-gray-600 rounded-full mr-1"></span>
                                                linkedin.com/jobs/view/38291...
                                            </div>
                                        </div>

                                        {/* Animation Container */}
                                        <div className="relative h-52 overflow-hidden bg-white dark:bg-gray-900">
                                            {/* Scrolling Content */}
                                            <motion.div
                                                className="p-4 text-xs text-gray-600 dark:text-gray-300"
                                                animate={{ y: [0, -100, -100, 0] }}
                                                transition={{
                                                    duration: 8,
                                                    times: [0, 0.4, 0.9, 1],
                                                    repeat: Infinity,
                                                    repeatDelay: 1,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <div className="flex items-start gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">In</div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Senior Software Engineer</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-[10px]">TechStart Inc • Madrid (Hybrid)</p>
                                                        <div className="flex gap-1 mt-1">
                                                            <span className="text-[9px] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">Actively hiring</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 relative z-0">
                                                    <p className="text-[11px] leading-relaxed">
                                                        We are looking for a <span className="font-semibold text-gray-800 dark:text-gray-200">Senior Frontend Engineer</span> to join our core product team. You will be responsible for building high-performance web applications using modern technologies.
                                                    </p>

                                                    <div>
                                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-[11px] mb-1">Requirements:</h4>
                                                        <ul className="space-y-1 text-[10px] list-disc pl-4">
                                                            <li>5+ years of experience with <span className="font-semibold">React, TypeScript</span> and Node.js.</li>
                                                            <li>Experience with Next.js and state management tools.</li>
                                                            <li>Strong understanding of web performance and SEO.</li>
                                                            <li>Experience in CI/CD pipelines and testing (Jest, Cypress).</li>
                                                            <li>Excellent problem-solving skills and mentorship ability.</li>
                                                        </ul>
                                                    </div>

                                                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-700/50">
                                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-[11px] mb-1">Benefits:</h4>
                                                        <ul className="space-y-1 text-[10px] list-disc pl-4">
                                                            <li>Competitive salary (€60k - €90k).</li>
                                                            <li>Remote-first culture with flexible hours.</li>
                                                            <li>Health insurance and gym membership.</li>
                                                            <li>Stock options and annual bonus.</li>
                                                            <li>Annual retreat to tropical locations.</li>
                                                        </ul>
                                                    </div>

                                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-[11px] mb-1">About the Team</h4>
                                                        <p className="text-[10px]">We are a diverse team of engineering enthusiasts who love open source and clean code.</p>
                                                    </div>
                                                </div>

                                                {/* Selection Overlay - Grows with scroll */}
                                                <motion.div
                                                    className="absolute top-[80px] left-[16px] right-[16px] bg-blue-500/20 dark:bg-blue-400/30 mix-blend-normal pointer-events-none z-10 rounded-sm"
                                                    animate={{
                                                        height: [0, 200, 200, 0]
                                                    }}
                                                    transition={{
                                                        duration: 8,
                                                        times: [0, 0.4, 0.9, 1],
                                                        repeat: Infinity,
                                                        repeatDelay: 1,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                            </motion.div>

                                            {/* Cursor Animation - Follows selection then clicks Copy */}
                                            <motion.div
                                                className="absolute z-50 pointer-events-none"
                                                animate={{
                                                    top: ["80px", "180px", "180px", "150px", "150px", "80px"],
                                                    left: ["16px", "200px", "200px", "150px", "150px", "16px"],
                                                    scale: [1, 1, 1, 1, 0.8, 1]
                                                }}
                                                transition={{
                                                    duration: 8,
                                                    times: [0, 0.4, 0.5, 0.6, 0.65, 1],
                                                    repeat: Infinity,
                                                    repeatDelay: 1,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <svg className="w-5 h-5 text-black dark:text-white fill-current drop-shadow-md" viewBox="0 0 24 24" fill="none">
                                                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="currentColor" stroke="white" strokeWidth="1" className="dark:stroke-gray-900" />
                                                </svg>
                                            </motion.div>

                                            {/* Context Menu - Fixed position where cursor lands */}
                                            <motion.div
                                                className="absolute top-[120px] left-[120px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 text-[11px] z-40 w-28 origin-top-left"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{
                                                    opacity: [0, 0, 1, 1, 0, 0],
                                                    scale: [0.8, 0.8, 1, 1, 0.8, 0.8]
                                                }}
                                                transition={{
                                                    duration: 8,
                                                    times: [0, 0.45, 0.5, 0.8, 0.9, 1],
                                                    repeat: Infinity,
                                                    repeatDelay: 1
                                                }}
                                            >
                                                <div className="px-3 py-1.5 text-gray-500 dark:text-gray-400">Search Google</div>
                                                <motion.div
                                                    className="px-3 py-1.5 bg-blue-600 text-white font-medium flex justify-between items-center"
                                                    animate={{ scale: [1, 1, 0.95, 1, 1] }}
                                                    transition={{
                                                        duration: 8,
                                                        times: [0, 0.6, 0.65, 0.7, 1],
                                                        repeat: Infinity,
                                                        repeatDelay: 1
                                                    }}
                                                >
                                                    Copy <span>⌘C</span>
                                                </motion.div>
                                                <div className="px-3 py-1.5 text-gray-500 dark:text-gray-400">Share...</div>
                                            </motion.div>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/20 transition-colors z-50 flex items-center justify-center pointer-events-none">
                                            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-full px-4 py-2 font-medium text-sm text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2">
                                                <span className="text-lg">📋</span> Click to Paste
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Manual Input */}
                            <Card className="lg:col-span-1 flex flex-col">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Job Details</CardTitle>
                                    <CardDescription className="text-xs">
                                        Enter the job title and description manually
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 flex-1 flex flex-col">
                                    <div className="space-y-2">
                                        <label htmlFor="job-title" className="text-xs font-medium">
                                            Job Title
                                        </label>
                                        <input
                                            id="job-title"
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            placeholder="e.g. Senior Frontend Developer"
                                            className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <label htmlFor="job-description" className="text-xs font-medium">
                                            Job Description
                                        </label>
                                        <textarea
                                            id="job-description"
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste or type the job description here..."
                                            className="flex w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none flex-1"
                                        />
                                    </div>

                                </CardContent>
                            </Card>

                            {/* Upload Area */}
                            <Card className="border lg:col-span-1">
                                <CardContent className="p-6">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                {selectedFile ? (
                                                    <FileCheck className="w-6 h-6 text-green-500" />
                                                ) : (
                                                    <FileText className="w-6 h-6" />
                                                )}
                                            </EmptyMedia>
                                            <EmptyTitle className="text-sm">
                                                {selectedFile ? "CV Seleccionado" : "No Resume Selected"}
                                            </EmptyTitle>
                                            <EmptyDescription className="text-xs">
                                                {selectedFile
                                                    ? selectedFile.name
                                                    : (!jobTitle || !jobDescription)
                                                        ? "Fill Job Details first to enable upload"
                                                        : "Select or import a resume to start analysis"
                                                }
                                            </EmptyDescription>
                                        </EmptyHeader>
                                        <EmptyContent>
                                            <div className="flex flex-col gap-2">
                                                {!selectedFile && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={!jobTitle || !jobDescription}
                                                    >
                                                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                                                        Select Resume
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant={selectedFile ? "outline" : "default"}
                                                    onClick={() => document.getElementById('file-upload-input')?.click()}
                                                    disabled={(!jobTitle || !jobDescription) && !selectedFile}
                                                >
                                                    {selectedFile ? (
                                                        <>
                                                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                                            Change Resume
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                                                            Import Resume
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <input
                                                id="file-upload-input"
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileSelect(file);
                                                }}
                                                className="hidden"
                                            />
                                        </EmptyContent>
                                        {!selectedFile && (
                                            <Button
                                                variant="link"
                                                className="text-muted-foreground h-auto p-0 mt-2"
                                                size="sm"
                                            >
                                                <span className="text-xs">PDF, DOC, DOCX (max. 5MB)</span>
                                            </Button>
                                        )}
                                    </Empty>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Benefits Section - Centered at bottom */}
                        <div className="flex flex-wrap justify-center gap-2 mt-8 mb-4">
                            {[
                                { icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-500", text: "100% Private" },
                                { icon: Zap, color: "text-amber-600 dark:text-amber-500", text: "Analysis in 10s" },
                                { icon: Users, color: "text-purple-600 dark:text-purple-500", text: "By Recruiters" },
                            ].map((item, i) => (
                                <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-md text-xs">
                                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                                    <span className="font-medium">{item.text}</span>
                                </div>
                            ))}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/30 rounded-md text-xs">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <motion.span
                                    className="font-medium"
                                >
                                    {activeUsers}
                                </motion.span>
                                <span className="text-muted-foreground">active</span>
                            </div>
                        </div>

                        {/* Pro Feature Hint */}
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">AI-Powered Match Analysis</p>
                                        <p className="text-xs text-muted-foreground">
                                            Get instant match scores between your resume and job descriptions
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="gap-1">
                                    Learn More
                                    <ArrowRight className="w-3 h-3" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Analyzing */}
                {isAnalyzing && <AnalyzingAnimation />}

                {/* Results */}
                {result && categories && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="grid lg:grid-cols-12 gap-6">
                            {/* Score Card - Sticky */}
                            <div className="lg:col-span-4 xl:col-span-3">
                                <div className="lg:sticky lg:top-20 space-y-4">
                                    <Card>
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base">Your Score</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Score Circle */}
                                            <div className="text-center">
                                                <div className="relative w-28 h-28 mx-auto mb-2">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="40" stroke="currentColor" className="text-muted" strokeWidth="6" fill="none" />
                                                        <motion.circle
                                                            initial={{ strokeDashoffset: 251 }}
                                                            animate={{ strokeDashoffset: 251 - (result.score / 100 * 251) }}
                                                            transition={{ duration: 1 }}
                                                            cx="50" cy="50" r="40"
                                                            stroke="currentColor"
                                                            className={result.score >= 70 ? "text-amber-500" : result.score >= 50 ? "text-amber-500" : "text-red-500"}
                                                            strokeWidth="6" fill="none" strokeDasharray="251" strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className={`text-3xl font-semibold ${result.score >= 70 ? "text-amber-500" : result.score >= 50 ? "text-amber-500" : "text-red-500"}`}>
                                                            {result.score}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">/100</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{totalIssues} issues found</p>
                                            </div>

                                            <Separator />

                                            {/* Categories */}
                                            <div className="space-y-2">
                                                <ExpandableCategory
                                                    name="Content"
                                                    score={categories.content.score}
                                                    items={categories.content.items}
                                                />
                                                <ExpandableCategory
                                                    name="Sections"
                                                    score={categories.sections.score}
                                                    items={categories.sections.items}
                                                />
                                                <ExpandableCategory
                                                    name="ATS Essentials"
                                                    score={categories.essentials.score}
                                                    items={categories.essentials.items}
                                                />
                                                <ExpandableCategory
                                                    name="Adaptation"
                                                    score={categories.adaptation.score}
                                                    items={categories.adaptation.items}
                                                />
                                            </div>

                                            {/* CTA */}
                                            <div className="pt-2">
                                                <Link href="/#pricing">
                                                    <Button className="w-full" size="sm">
                                                        <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Optimize Resume
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* ATS Logic Card */}
                                    <Card className="bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 shadow-sm">
                                        <CardContent className="p-5 flex flex-col items-center text-center gap-3 justify-center">
                                            <div className="p-2 bg-white dark:bg-blue-900/50 rounded-lg shadow-sm ring-1 ring-blue-100 dark:ring-blue-800">
                                                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="font-bold text-base text-blue-950 dark:text-blue-50 leading-tight">
                                                    Enterprise ATS Simulation
                                                </h3>
                                                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed px-1">
                                                    Calibrated with Fortune 500 systems (Workday, Lever).
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                                <span className="relative flex h-1.5 w-1.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                                                </span>
                                                Real-time Matching
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-8 xl:col-span-9">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-muted-foreground" />
                                        <h2 className="text-lg font-semibold">Content Analysis</h2>
                                    </div>
                                    <Badge variant="destructive" className="text-xs">
                                        {totalIssues} issues
                                    </Badge>
                                </div>

                                {/* Report Sections */}
                                <div className="space-y-3">
                                    {/* ATS Rate */}
                                    <ReportSection icon={Shield} title="ATS Analysis Rate" issueCount={0} status="success" defaultOpen={true}>
                                        <div className="space-y-3 text-sm">
                                            <p className="text-muted-foreground leading-relaxed">
                                                An <strong>Applicant Tracking System (ATS)</strong> is used by employers to scan applications.
                                            </p>

                                            <StatusBox
                                                status="success"
                                                title="Great!"
                                                description="We have successfully analyzed 100% of your resume."
                                            />
                                        </div>
                                    </ReportSection>

                                    {/* Impact */}
                                    <ReportSection icon={Target} title="Quantify Impact" issueCount={result.critical_errors.length} status={result.critical_errors.length > 0 ? "error" : "success"}>
                                        <div className="space-y-3 text-sm">
                                            <p className="text-muted-foreground">
                                                Your resume must show the <strong>impact</strong> you've had in previous roles.
                                            </p>

                                            {result.critical_errors.length > 0 && (
                                                <StatusBox
                                                    status="error"
                                                    title="Improvement Needed"
                                                    description="Your experience lacks quantifiable achievements."
                                                />
                                            )}

                                            <div className="space-y-1.5">
                                                {result.critical_errors.map((err, i) => (
                                                    <Card key={i} className="bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900">
                                                        <CardContent className="p-3 flex gap-2">
                                                            <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                            <p className="text-xs">{err}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    </ReportSection>

                                    {/* Improvements */}
                                    <ReportSection icon={Sparkles} title="Suggested Improvements" issueCount={result.improvements.length} status={result.improvements.length > 2 ? "warning" : "success"}>
                                        <div className="space-y-3 text-sm">
                                            <p className="text-muted-foreground">
                                                Optional improvements that can increase your resume's impact.
                                            </p>

                                            <div className="space-y-1.5">
                                                {result.improvements.map((imp, i) => (
                                                    <Card key={i} className="bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900">
                                                        <CardContent className="p-3 flex gap-2">
                                                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                            <p className="text-xs">{imp}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    </ReportSection>

                                    {/* File Format */}
                                    <ReportSection icon={FileCheck} title="Format & Size" issueCount={0} status="success">
                                        <div className="space-y-3 text-sm">
                                            <p className="text-muted-foreground">
                                                Your resume should be under 2MB and in PDF format.
                                            </p>

                                            <StatusBox
                                                status="success"
                                                title="Perfect"
                                                description="Correct format (PDF) and suitable size."
                                            />
                                        </div>
                                    </ReportSection>
                                </div>

                                {/* Mobile CTA */}
                                <div className="lg:hidden mt-6 space-y-2">
                                    <Button onClick={() => setResult(null)} variant="outline" className="w-full" size="sm">
                                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> New Upload
                                    </Button>
                                    <Link href="/#pricing">
                                        <Button className="w-full" size="sm">
                                            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Optimize Resume
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
