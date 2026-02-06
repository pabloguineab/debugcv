"use client";

import { useState, useRef } from "react";
import { User, CloudUpload, EyeOff, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePictureUploadProps {
    pictureUrl?: string;
    onUpdate: (url: string | undefined) => void;
    showPhoto?: boolean;
    onVisibilityChange?: (visible: boolean) => void;
    size?: number;
    className?: string;
    editable?: boolean;
}

export function ProfilePictureUpload({
    pictureUrl,
    onUpdate,
    showPhoto = true,
    onVisibilityChange,
    size = 120, // Adjusted default size slightly
    className,
    editable = true
}: ProfilePictureUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                onUpdate(result);
                // If we upload a photo, automatically show it
                if (onVisibilityChange && !showPhoto) {
                    onVisibilityChange(true);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerUpload = () => {
        if (editable) {
            fileInputRef.current?.click();
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {!showPhoto ? (
                /* Hidden State (Ghost Placeholder) */
                editable ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            triggerUpload();
                        }}
                        className={cn(
                            "w-full h-full rounded-full border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all opacity-70 hover:opacity-100",
                            className
                        )}
                        style={{ width: size, height: size }}
                        title="Show/Add photo"
                    >
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Add Photo</span>
                    </button>
                ) : null
            ) : (
                /* Visible State */
                <div
                    className={cn("relative group rounded-full overflow-hidden shrink-0 select-none border-2 border-border shadow-sm", className)}
                    style={{ width: size, height: size }}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {pictureUrl ? (
                        <img
                            src={pictureUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                            <User className="w-3/5 h-3/5 stroke-[1.5]" />
                        </div>
                    )}

                    {/* Hover Actions Overlay */}
                    {editable && (
                        <div className={cn(
                            "absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center gap-2 transition-opacity duration-200 z-10",
                            isHovering ? "opacity-100" : "opacity-0"
                        )}>
                            {/* Import Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    triggerUpload();
                                }}
                                className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                                title="Import photo"
                            >
                                <CloudUpload className="w-5 h-5" />
                            </button>

                            {/* Hide Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onVisibilityChange?.(false);
                                }}
                                className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                                title="Hide photo on CV"
                            >
                                <EyeOff className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
