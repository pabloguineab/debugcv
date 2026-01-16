"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import type { Application } from "@/types/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
} from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Loader2, Trash2, MapPin, DollarSign, X } from "lucide-react";

const WORK_MODE_LABELS = {
    remote: "🌍 Remote",
    hybrid: "🏠 Hybrid",
    onsite: "🏢 On-site",
};

const STATUS_LABELS = {
    wishlist: "📋 Wishlist",
    applied: "📤 Applied",
    interview: "💬 Interview",
    offer: "🎉 Offer",
};

const PRIORITY_LABELS = {
    high: "🔴 High",
    medium: "🟡 Medium",
    low: "⚪ Low",
};

// Form schema
const formSchema = z.object({
    title: z.string().min(2, "Job title must be at least 2 characters."),
    company: z.string().min(1, "Company name is required."),
    jobUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
    location: z.string().optional(),
    workMode: z.enum(["remote", "hybrid", "onsite"]),
    expectedSalary: z.array(z.number()).length(2),
    priority: z.enum(["high", "medium", "low"]),
    status: z.enum(["wishlist", "applied", "interview", "offer"]),
    jobDescription: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddApplicationModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (app: Partial<Application>) => Promise<void>;
    onEdit?: (id: string, app: Partial<Application>) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    initialData?: Application | null;
}

export function AddApplicationModal({
    open,
    onClose,
    onAdd,
    onEdit,
    onDelete,
    initialData,
}: AddApplicationModalProps) {
    const isEditing = !!initialData;
    const overlayRef = useRef<HTMLDivElement>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            company: "",
            jobUrl: "",
            location: "",
            workMode: "hybrid",
            expectedSalary: [80, 150],
            priority: "medium",
            status: "wishlist",
            jobDescription: "",
        },
    });

    const { control, handleSubmit, reset, formState: { isSubmitting } } = form;

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title || "",
                company: initialData.company || "",
                jobUrl: initialData.jobUrl || "",
                location: initialData.location || "",
                workMode: initialData.workMode || "hybrid",
                expectedSalary: Array.isArray(initialData.expectedSalary) && initialData.expectedSalary.length === 2
                    ? initialData.expectedSalary
                    : [80, 150],
                priority: initialData.priority || "medium",
                status: (initialData.status === "rejected" ? "wishlist" : initialData.status) || "wishlist",
                jobDescription: initialData.jobDescription || "",
            });
        } else {
            reset({
                title: "",
                company: "",
                jobUrl: "",
                location: "",
                workMode: "hybrid",
                expectedSalary: [80, 150],
                priority: "medium",
                status: "wishlist",
                jobDescription: "",
            });
        }
    }, [initialData, reset]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    const onSubmit = async (data: FormData) => {
        try {
            if (isEditing && onEdit && initialData) {
                await onEdit(initialData.id, data);
            } else {
                await onAdd(data);
            }
            onClose();
            reset();
        } catch (error) {
            console.error("Error saving application:", error);
        }
    };

    const handleDelete = async () => {
        if (!initialData || !onDelete) return;

        if (confirm("Are you sure you want to delete this application?")) {
            try {
                await onDelete(initialData.id);
                onClose();
            } catch (error) {
                console.error("Error deleting application:", error);
            }
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={overlayRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-full max-w-3xl bg-background rounded-xl shadow-2xl border relative flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Scrollable Form Area */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="application-form" onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Job Title */}
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="title">Job Title *</FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="title"
                                                    placeholder="e.g. Senior Frontend Developer"
                                                    aria-invalid={fieldState.invalid}
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    {/* Company */}
                                    <Controller
                                        name="company"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="company">Company *</FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="company"
                                                    placeholder="e.g. Vercel"
                                                    aria-invalid={fieldState.invalid}
                                                    autoComplete="off"
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    {/* Job URL */}
                                    <Controller
                                        name="jobUrl"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="jobUrl">Job URL</FieldLabel>
                                                <Input
                                                    {...field}
                                                    id="jobUrl"
                                                    type="url"
                                                    placeholder="https://..."
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    {/* Location & Work Mode */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller
                                            name="location"
                                            control={control}
                                            render={({ field }) => (
                                                <Field>
                                                    <FieldLabel htmlFor="location" className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        Location
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id="location"
                                                        placeholder="e.g. San Francisco"
                                                    />
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            name="workMode"
                                            control={control}
                                            render={({ field }) => (
                                                <Field>
                                                    <FieldLabel htmlFor="workMode">Work Mode</FieldLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            {field.value ? (
                                                                <span>{WORK_MODE_LABELS[field.value as keyof typeof WORK_MODE_LABELS]}</span>
                                                            ) : (
                                                                <span className="text-muted-foreground">Select work mode</span>
                                                            )}
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="remote">🌍 Remote</SelectItem>
                                                            <SelectItem value="hybrid">🏠 Hybrid</SelectItem>
                                                            <SelectItem value="onsite">🏢 On-site</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* Salary Range */}
                                    <Controller
                                        name="expectedSalary"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel htmlFor="salary" className="flex items-center gap-1.5">
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    Expected Salary
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Set your salary range ($
                                                    <span className="font-medium tabular-nums">{field.value[0]}k</span> -{" "}
                                                    <span className="font-medium tabular-nums">{field.value[1]}k</span>)
                                                </FieldDescription>
                                                <Slider
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    max={500}
                                                    min={0}
                                                    step={10}
                                                    className="mt-2 w-full"
                                                    aria-label="Expected Salary Range"
                                                />
                                            </Field>
                                        )}
                                    />

                                    {/* Status & Priority */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <Field>
                                                    <FieldLabel htmlFor="status">Status</FieldLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            {field.value ? (
                                                                <span>{STATUS_LABELS[field.value as keyof typeof STATUS_LABELS]}</span>
                                                            ) : (
                                                                <span className="text-muted-foreground">Select status</span>
                                                            )}
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="wishlist">📋 Wishlist</SelectItem>
                                                            <SelectItem value="applied">📤 Applied</SelectItem>
                                                            <SelectItem value="interview">💬 Interview</SelectItem>
                                                            <SelectItem value="offer">🎉 Offer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            name="priority"
                                            control={control}
                                            render={({ field }) => (
                                                <Field>
                                                    <FieldLabel htmlFor="priority">Priority</FieldLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            {field.value ? (
                                                                <span>{PRIORITY_LABELS[field.value as keyof typeof PRIORITY_LABELS]}</span>
                                                            ) : (
                                                                <span className="text-muted-foreground">Select priority</span>
                                                            )}
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="high">🔴 High</SelectItem>
                                                            <SelectItem value="medium">🟡 Medium</SelectItem>
                                                            <SelectItem value="low">⚪ Low</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            )}
                                        />
                                    </div>

                                    {/* Job Description */}
                                    <Controller
                                        name="jobDescription"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel htmlFor="jobDescription">Job Description</FieldLabel>
                                                <Textarea
                                                    {...field}
                                                    id="jobDescription"
                                                    placeholder="Paste the job description here..."
                                                    className="resize-none min-h-[120px]"
                                                />
                                                <FieldDescription>
                                                    Adding the job description helps with AI match analysis.
                                                </FieldDescription>
                                            </Field>
                                        )}
                                    />
                                </div>
                            </form>
                        </div>
                        
                        {/* Fixed Footer */}
                        <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30 rounded-b-xl flex items-center gap-3">
                            {isEditing && onDelete && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            )}
                            <div className="flex-1" />
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="application-form"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isEditing ? "Save Changes" : "Add Application"}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
