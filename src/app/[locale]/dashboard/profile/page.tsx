"use client";

import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, MoreHorizontal, ExternalLink, X, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import getCroppedImg from "@/lib/crop-image";

export default function ProfilePage() {
    const [username, setUsername] = useState("lourdesbuendia");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageToCrop(e.target?.result as string);
                setIsCropDialogOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSaveCrop = async () => {
        if (imageToCrop && croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
                setProfileImage(croppedImage);
                setIsCropDialogOpen(false);
                setImageToCrop(null);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    return (
        <div className="flex flex-col h-full w-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Overview</h1>
                    <a href={`https://linkedin.com/in/${username}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1">
                        linkedin.com/in/{username} <ExternalLink className="size-3" />
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                        <MoreHorizontal className="size-4" />
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Import Resume
                    </Button>
                </div>
            </div>

            {/* Content using Tabs */}
            <div className="flex-1 overflow-auto p-8">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList variant="line" className="flex items-center justify-start bg-transparent border-b h-auto p-0 mb-8 rounded-none w-fit gap-8">
                        <TabsTrigger
                            value="overview"
                            className="flex-none rounded-none bg-transparent px-0 py-3 text-base font-medium text-muted-foreground transition-all hover:text-foreground"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="preferences"
                            className="flex-none rounded-none bg-transparent px-0 py-3 text-base font-medium text-muted-foreground transition-all hover:text-foreground"
                        >
                            Preferences
                        </TabsTrigger>
                        <TabsTrigger
                            value="tech-stack"
                            className="flex-none rounded-none bg-transparent px-0 py-3 text-base font-medium text-muted-foreground transition-all hover:text-foreground"
                        >
                            Tech Stack
                        </TabsTrigger>
                        <TabsTrigger
                            value="experience"
                            className="flex-none rounded-none bg-transparent px-0 py-3 text-base font-medium text-muted-foreground transition-all hover:text-foreground"
                        >
                            Experience
                        </TabsTrigger>
                        <TabsTrigger
                            value="education"
                            className="flex-none rounded-none bg-transparent px-0 py-3 text-base font-medium text-muted-foreground transition-all hover:text-foreground"
                        >
                            Education
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8 max-w-4xl">



                        <div className="space-y-6">

                            {/* Profile Picture */}
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6 border-b">
                                <div>
                                    <h3 className="text-sm font-medium">Profile picture</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        This will be displayed on your profile. Need a professional headshot? Generate one in minutes with our <a href="#" className="text-blue-600 hover:underline">AI headshot generator</a>.
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="size-20 rounded-full bg-gray-100 flex items-center justify-center border overflow-hidden">
                                        {profileImage ? (
                                            <Image
                                                src={profileImage}
                                                alt="Profile"
                                                width={80}
                                                height={80}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="size-full bg-gray-50 flex items-center justify-center">
                                                <Upload className="size-6 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={onDrop}
                                        className="flex-1 p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div className="p-2 bg-gray-100 rounded-full mb-2 group-hover:bg-gray-200 transition-colors">
                                            <Upload className="size-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-blue-600">Click to upload</span>
                                            <span className="text-sm text-muted-foreground"> or drag and drop</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Use a square image for best results</p>
                                    </div>
                                </div>
                            </div>

                            {/* Username */}
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6 border-b">
                                <div>
                                    <h3 className="text-sm font-medium">LinkedIn Username*</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        This will link your profile to your LinkedIn account.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <p className="text-sm text-muted-foreground transition-all">linkedin.com/in/{username}</p>
                                </div>
                            </div>

                            {/* Country */}
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6">
                                <div>
                                    <h3 className="text-sm font-medium">What country do you currently reside in?*</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        This helps us match you with companies that are open to hiring talent in your country.
                                    </p>
                                </div>
                                <div>
                                    <Select defaultValue="spain">
                                        <SelectTrigger className="w-full">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">🇪🇸</span>
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="spain">
                                                <div className="flex items-center gap-2">
                                                    <span>Spain</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="usa">United States</SelectItem>
                                            <SelectItem value="uk">United Kingdom</SelectItem>
                                            <SelectItem value="germany">Germany</SelectItem>
                                            <SelectItem value="france">France</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Crop Dialog */}
            <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent
                    className="sm:max-w-[500px] p-0 overflow-hidden bg-white shadow-2xl border-none md:left-[calc(50%_+_8rem)]"
                    overlayClassName="bg-black/40 backdrop-blur-sm left-0 md:left-[16rem] transition-[left] duration-300"
                >
                    <DialogHeader className="p-5 border-b">
                        <DialogTitle className="text-xl font-normal text-gray-800">Edit photo</DialogTitle>
                    </DialogHeader>

                    <div className="relative h-[400px] w-full bg-[#111]">
                        {imageToCrop && (
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>

                    <div className="px-6 py-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setZoom(Math.max(zoom - 0.1, 1))}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors group/btn shrink-0"
                            >
                                <Minus className="size-5 text-gray-500 group-hover/btn:text-gray-900" />
                            </button>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.01}
                                onValueChange={(value) => setZoom(value[0])}
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => setZoom(Math.min(zoom + 0.1, 3))}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors group/btn shrink-0"
                            >
                                <Plus className="size-5 text-gray-500 group-hover/btn:text-gray-900" />
                            </button>
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t flex justify-end items-center bg-white gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsCropDialogOpen(false)}
                            className="text-blue-600 hover:text-blue-700 font-semibold hover:bg-blue-50/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveCrop}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-full font-semibold shadow-sm"
                        >
                            Save photo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
