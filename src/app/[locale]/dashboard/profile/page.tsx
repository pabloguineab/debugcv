"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, MoreHorizontal, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
    return (
        <div className="flex flex-col h-full w-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Overview</h1>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1">
                        himalayas.app/@lourdesbuendia <ExternalLink className="size-3" />
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                        <MoreHorizontal className="size-4" />
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        Import Resume
                    </Button>
                </div>
            </div>

            {/* Content using Tabs */}
            <div className="flex-1 overflow-auto p-8">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full justify-start bg-transparent border-b h-auto p-0 mb-8 rounded-none">
                        <TabsTrigger
                            value="overview"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="preferences"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                        >
                            Preferences
                        </TabsTrigger>
                        <TabsTrigger
                            value="tech-stack"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                        >
                            Tech Stack
                        </TabsTrigger>
                        <TabsTrigger
                            value="experience"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                        >
                            Experience
                        </TabsTrigger>
                        <TabsTrigger
                            value="education"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
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
                                        This will be displayed on your profile. Need a professional headshot? Generate one in minutes with our <a href="#" className="text-purple-600 hover:underline">AI headshot generator</a>.
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="size-20 rounded-full bg-gray-100 flex items-center justify-center border">
                                        {/* Placeholder for avatar */}
                                    </div>
                                    <div className="flex-1 p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-50/50 transition-colors cursor-pointer">
                                        <div className="p-2 bg-gray-100 rounded-full mb-2">
                                            <Upload className="size-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-purple-600">Click to upload</span>
                                            <span className="text-sm text-muted-foreground"> or drag and drop</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Use a square image for best results</p>
                                    </div>
                                </div>
                            </div>

                            {/* Visibility */}
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6 border-b">
                                <div>
                                    <h3 className="text-sm font-medium">Visibility*</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Choose whether your profile will be public, and whether it will be listed on Himalayas and other search engines like Google.
                                    </p>
                                </div>
                                <RadioGroup defaultValue="public" className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <RadioGroupItem value="public" id="public" className="mt-1 text-purple-600 border-purple-600" />
                                        <div className="space-y-1">
                                            <Label htmlFor="public" className="font-medium">Public profile</Label>
                                            <p className="text-sm text-muted-foreground">Your profile will be public, and shown in search results and in Google.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <RadioGroupItem value="public-not-searchable" id="public-not-searchable" className="mt-1" />
                                        <div className="space-y-1">
                                            <Label htmlFor="public-not-searchable" className="font-medium">Public but not searchable</Label>
                                            <p className="text-sm text-muted-foreground">Your profile will be public, but not searchable by companies or in Google.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <RadioGroupItem value="private" id="private" className="mt-1" />
                                        <div className="space-y-1">
                                            <Label htmlFor="private" className="font-medium">Private profile</Label>
                                            <p className="text-sm text-muted-foreground">Your profile will not be visible. You will continue to receive matches.</p>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Username */}
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6 border-b">
                                <div>
                                    <h3 className="text-sm font-medium">Username*</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        This will also act as your profile URL slug (himalayas.app/@username).
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Input defaultValue="lourdesbuendia" />
                                    <p className="text-sm text-muted-foreground">himalayas.app/@lourdesbuendia</p>
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
        </div>
    );
}
