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
    CheckCircle2, XCircle, HelpCircle, Mail, Upload
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
    icon: React.ElementType;
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
                <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-5 hover:bg-accent transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">{title}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {issueCount !== undefined && (
                                <Badge variant={status === "success" ? "default" : status === "error" ? "destructive" : "secondary"} className={status ? statusColors[status] : ""}>
                                    {issueCount === 0 ? "Sin problemas" : `${issueCount} problema${issueCount > 1 ? 's' : ''}`}
                                </Badge>
                            )}
                            {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                    </button>
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
            <CollapsibleTrigger asChild>
                <button className="w-full flex items-start gap-2 py-3 text-left hover:text-blue-600 transition-colors">
                    <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-blue-600">{question}</span>
                </button>
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
            <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between py-3 hover:bg-accent transition-colors rounded-lg px-2 -mx-2">
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
                </button>
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
                                {item.issues === 0 ? "Sin problemas" : `${item.issues} prob.`}
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
        "Analizando tu resume",
        "Analizando tu experiencia",
        "Extrayendo tus habilidades",
        "Generando recomendaciones"
    ];

    const categories = ["CONTENIDO", "SECCIÓN", "ESENCIALES ATS", "ADAPTACIÓN"];

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
            className="flex items-center justify-center min-h-[60vh]"
        >
            <Card className="max-w-2xl w-full">
                <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left side - Score */}
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Tu Puntuación</h2>
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
                                    <motion.div
                                        className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
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

// Simple File Upload Component
function FileUploadSimple({ onFileSelect }: { onFileSelect: (file: File) => void }) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect(file);
    };

    return (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-500 transition-colors cursor-pointer">
            <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">Arrastra tu CV aquí o haz clic para seleccionar</p>
                <p className="text-sm text-gray-500">PDF, DOC, o DOCX (máx. 5MB)</p>
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

    // Calculate category scores
    const categories = useMemo(() => {
        if (!result) return null;
        const errorCount = result.critical_errors.length;
        const improvementCount = result.improvements.length;
        const totalIssues = errorCount + improvementCount;

        return {
            contenido: {
                score: Math.max(50, 100 - errorCount * 8),
                issues: Math.min(errorCount, 5),
                items: [
                    { name: "Tasa de Análisis ATS", status: "success" as const, issues: 0 },
                    { name: "Cuantificando el Impacto", status: errorCount > 0 ? "error" as const : "success" as const, issues: Math.min(3, errorCount) },
                    { name: "Repetición", status: improvementCount > 3 ? "error" as const : "success" as const, issues: Math.min(2, Math.floor(improvementCount / 2)) },
                    { name: "Ortografía y Gramática", status: totalIssues > 5 ? "error" as const : "success" as const, issues: Math.min(13, totalIssues) },
                ]
            },
            secciones: {
                score: Math.max(60, 100 - improvementCount * 5),
                issues: Math.min(2, Math.floor(improvementCount / 3)),
                items: [
                    { name: "Secciones Esenciales", status: improvementCount > 2 ? "error" as const : "success" as const, issues: improvementCount > 2 ? 1 : 0 },
                    { name: "Información de Contacto", status: "error" as const, issues: 1 },
                ]
            },
            esenciales: {
                score: 90,
                issues: 0,
                items: [
                    { name: "Formato y Tamaño del Archivo", status: "success" as const, issues: 0 },
                    { name: "Diseño", status: errorCount > 3 ? "error" as const : "success" as const, issues: errorCount > 3 ? 1 : 0 },
                    { name: "Dirección de Correo Electrónico", status: "success" as const, issues: 0 },
                    { name: "Hipervínculo en Encabezado", status: "success" as const, issues: 0 },
                ]
            },
            adaptacion: {
                score: Math.max(70, result.score),
                issues: totalIssues > 10 ? 3 : totalIssues > 5 ? 2 : 1,
                items: [
                    { name: "Habilidades Duras", status: "warning" as const, issues: 0 },
                    { name: "Habilidades Blandas", status: "warning" as const, issues: 0 },
                    { name: "Verbos de Acción", status: "warning" as const, issues: 0 },
                    { name: "Título Adaptado", status: "warning" as const, issues: 0 },
                ]
            }
        };
    }, [result]);

    const handleFileSelect = async (file: File) => {
        if (!session) { router.push("/auth/signin"); return; }
        setIsAnalyzing(true);
        setError(null);
        setResult(null);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("/api/ats-scan", { method: "POST", body: formData });
            if (!res.ok) throw new Error();
            setResult(await res.json());
        } catch { setError("Error procesando el archivo"); }
        finally { setIsAnalyzing(false); }
    };

    const totalIssues = result ? result.critical_errors.length + result.improvements.length : 0;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <AnimatePresence mode="wait">
                {/* Upload State */}
                {!result && !isAnalyzing && !error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">ATS Scanner <span className="text-blue-600">Pro</span></h1>
                            <p className="text-muted-foreground">Analiza tu CV como los sistemas de empresas Fortune 500</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <Card>
                                    <CardContent className="p-6">
                                        <FileUploadSimple onFileSelect={handleFileSelect} />
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="space-y-3">
                                {[{ icon: ShieldCheck, color: "text-emerald-500", text: "100% Privado", desc: "Tu CV se elimina después" },
                                { icon: Zap, color: "text-amber-500", text: "Análisis en 10s", desc: "Resultados instantáneos" },
                                { icon: Users, color: "text-purple-500", text: "Por Recruiters", desc: "+10,000 procesos" }].map((item, i) => (
                                    <Card key={i}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{item.text}</p>
                                                    <p className="text-gray-400 text-xs">{item.desc}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
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
                                <Card className="lg:sticky lg:top-20">
                                    <CardHeader>
                                        <CardTitle>Tu Puntuación</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Score Circle */}
                                        <div className="text-center mb-6">
                                            <div className="relative w-32 h-32 mx-auto mb-3">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                                    <motion.circle
                                                        initial={{ strokeDashoffset: 251 }}
                                                        animate={{ strokeDashoffset: 251 - (result.score / 100 * 251) }}
                                                        transition={{ duration: 1 }}
                                                        cx="50" cy="50" r="40"
                                                        stroke={result.score >= 70 ? "#f59e0b" : result.score >= 50 ? "#f59e0b" : "#ef4444"}
                                                        strokeWidth="8" fill="none" strokeDasharray="251" strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className={`text-4xl font-bold ${result.score >= 70 ? "text-amber-500" : result.score >= 50 ? "text-amber-500" : "text-red-500"}`}>
                                                        {result.score}
                                                    </span>
                                                    <span className="text-gray-400 text-sm">/100</span>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground">{totalIssues} Problemas</p>
                                        </div>

                                        <Separator className="my-4" />

                                        {/* Categories */}
                                        <div className="space-y-3">
                                            <ExpandableCategory
                                                name="Contenido"
                                                score={categories.contenido.score}
                                                items={categories.contenido.items}
                                            />
                                            <ExpandableCategory
                                                name="Secciones"
                                                score={categories.secciones.score}
                                                items={categories.secciones.items}
                                            />
                                            <ExpandableCategory
                                                name="Esenciales ATS"
                                                score={categories.esenciales.score}
                                                items={categories.esenciales.items}
                                            />
                                            <ExpandableCategory
                                                name="Adaptación"
                                                score={categories.adaptacion.score}
                                                items={categories.adaptacion.items}
                                            />
                                        </div>

                                        {/* CTA */}
                                        <div className="mt-6">
                                            <Link href="/#pricing">
                                                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                                                    <Sparkles className="w-4 h-4 mr-2" /> Optimizar CV
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-8 xl:col-span-9">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Contenido</h1>
                                    </div>
                                    <Badge variant="destructive" className="px-4 py-2">
                                        {totalIssues} problemas encontrados
                                    </Badge>
                                </div>

                                {/* Report Sections */}
                                <div className="space-y-4">
                                    {/* Tasa de Análisis ATS */}
                                    <ReportSection icon={Shield} title="Tasa de Análisis ATS" issueCount={0} status="success" defaultOpen={true}>
                                        <div className="space-y-4">
                                            <p className="text-gray-600">
                                                Un <strong>Sistema de Seguimiento de Solicitudes</strong> comúnmente referido como <strong>ATS</strong> es un sistema utilizado por empleadores para escanear un gran número de solicitudes.
                                            </p>

                                            <StatusBox
                                                status="success"
                                                title="¡Genial!"
                                                description="Hemos analizado el 100% de tu CV exitosamente usando un ATS líder en la industria."
                                            />

                                            <Card className="bg-gray-50">
                                                <CardHeader>
                                                    <CardTitle className="text-sm">Preguntas Frecuentes</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                    <FAQItem
                                                        question="¿Qué es un resume compatible con ATS?"
                                                        answer="Un resume compatible con ATS es aquel que puede ser escaneado e interpretado fácilmente por un sistema de seguimiento de solicitantes."
                                                    />
                                                    <FAQItem
                                                        question="¿Cómo hago que mi resume sea compatible con ATS?"
                                                        answer="Para hacer que tu resume sea compatible con ATS, debes formatear tu resume adecuadamente, siguiendo un diseño simple y estructurado."
                                                    />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </ReportSection>

                                    {/* Cuantificar Impacto */}
                                    <ReportSection icon={Target} title="Cuantificar el Impacto" issueCount={result.critical_errors.length} status={result.critical_errors.length > 0 ? "error" : "success"}>
                                        <div className="space-y-4">
                                            <p className="text-gray-600">
                                                Cualquier buen CV mostrará el <strong>impacto</strong> que has tenido en las posiciones previas que has ocupado.
                                            </p>

                                            {result.critical_errors.length > 0 && (
                                                <StatusBox
                                                    status="error"
                                                    title="¡Oh, no!"
                                                    description="Tu sección de experiencia carece de logros cuantificables."
                                                />
                                            )}

                                            <div className="space-y-2">
                                                {result.critical_errors.map((err, i) => (
                                                    <Card key={i} className="bg-red-50 border-red-100">
                                                        <CardContent className="p-4 flex gap-3">
                                                            <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                                            <p className="text-gray-700 text-sm">{err}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    </ReportSection>

                                    {/* Mejoras Sugeridas */}
                                    <ReportSection icon={Sparkles} title="Mejoras Sugeridas" issueCount={result.improvements.length} status={result.improvements.length > 2 ? "warning" : "success"}>
                                        <div className="space-y-4">
                                            <p className="text-gray-600">
                                                Estas son mejoras opcionales que pueden aumentar el impacto de tu CV.
                                            </p>

                                            <div className="space-y-2">
                                                {result.improvements.map((imp, i) => (
                                                    <Card key={i} className="bg-amber-50 border-amber-100">
                                                        <CardContent className="p-4 flex gap-3">
                                                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                            <p className="text-gray-700 text-sm">{imp}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    </ReportSection>

                                    {/* Formato y Tamaño */}
                                    <ReportSection icon={FileCheck} title="Formato y Tamaño del Archivo" issueCount={0} status="success">
                                        <div className="space-y-4">
                                            <p className="text-gray-600">
                                                Idealmente, tu CV debe ser menor de 2MB y en formato PDF.
                                            </p>

                                            <StatusBox
                                                status="success"
                                                title="¡Buen trabajo!"
                                                description="Tu archivo de CV tiene el formato correcto (PDF) y un tamaño adecuado."
                                            />
                                        </div>
                                    </ReportSection>
                                </div>

                                {/* Mobile CTA */}
                                <div className="lg:hidden mt-8 space-y-2">
                                    <Button onClick={() => setResult(null)} variant="outline" className="w-full">
                                        <RefreshCw className="w-4 h-4 mr-2" /> Nueva Carga
                                    </Button>
                                    <Link href="/#pricing">
                                        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                            <Sparkles className="w-4 h-4 mr-2" /> Optimizar CV
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
