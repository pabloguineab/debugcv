"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { User, CloudUpload, Camera, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProfilePictureUploadProps {
    value?: string;
    onChange: (url: string) => void;
    size?: number;
    className?: string;
}

export function ProfilePictureUpload({
    value,
    onChange,
    size = 100,
    className
}: ProfilePictureUploadProps) {
    const { data: session } = useSession();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    // Get user profile image from session
    const userProfileImage = session?.user?.image;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    onChange(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const importFromProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (userProfileImage) {
            onChange(userProfileImage);
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            <div
                className="relative group rounded-full overflow-hidden shrink-0 select-none border-2 border-border cursor-pointer shadow-sm"
                style={{ width: size, height: size }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={triggerUpload}
            >
                {value ? (
                    <img
                        src={value}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                        <Camera className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">Upload</span>
                    </div>
                )}

                {/* Hover Overlay */}
                <div className={cn(
                    "absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center gap-2 transition-opacity duration-200 z-10",
                    isHovering ? "opacity-100" : "opacity-0"
                )}>
                    {/* Upload Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            triggerUpload();
                        }}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform hover:scale-110"
                        title="Upload new photo"
                    >
                        <CloudUpload className="w-4 h-4" />
                    </button>

                    {/* Import from Profile Button (only if different) */}
                    {userProfileImage && userProfileImage !== value && (
                        <button
                            onClick={importFromProfile}
                            className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-transform hover:scale-110"
                            title="Import from User Profile"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Helper Text or Quick Actions */}
            {userProfileImage && !value && (
                <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onChange(userProfileImage)}
                    className="h-7 text-xs gap-1.5"
                >
                    <User className="w-3 h-3" />
                    Use Profile Photo
                </Button>
            )}
        </div>
    );
}
