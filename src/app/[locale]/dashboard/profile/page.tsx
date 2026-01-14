"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Country, State, City, ICountry, IState, ICity } from "country-state-city";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { allTechs, TechItem } from "@/data/tech-stack";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, MoreHorizontal, ExternalLink, X, Minus, Plus, Linkedin, Github, IdCard, Settings, Code, Briefcase, GraduationCap, CloudUpload, FolderKanban, Award, Languages, Trash2, Search, Check, Sparkles, Wand2, Flag, Building2, CalendarDays } from "lucide-react";
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
    const [selectedCountry, setSelectedCountry] = useState<string>("ES");
    const [selectedRegion, setSelectedRegion] = useState<string>("");
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [linkedinUrl, setLinkedinUrl] = useState<string>("");
    const [githubUrl, setGithubUrl] = useState<string>("");
    const [introduction, setIntroduction] = useState<string>("");
    const [userName, setUserName] = useState<string>("Lourdes Buendia"); // TODO: Get from user session
    const [activeTab, setActiveTab] = useState<string>("overview");

    // Languages state
    const [languages, setLanguages] = useState<{ language: string; level: string }[]>([]);
    const [newLanguage, setNewLanguage] = useState<string>("");
    const [newLevel, setNewLevel] = useState<string>("");

    // Common languages list
    const commonLanguages = [
        "English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese",
        "Korean", "Arabic", "Russian", "Hindi", "Dutch", "Swedish", "Norwegian", "Danish",
        "Finnish", "Polish", "Turkish", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian"
    ];

    // Language proficiency levels
    const proficiencyLevels = [
        { value: "native", label: "Native / Bilingual" },
        { value: "fluent", label: "Fluent" },
        { value: "advanced", label: "Advanced" },
        { value: "intermediate", label: "Intermediate" },
        { value: "basic", label: "Basic" }
    ];

    const addLanguage = () => {
        if (newLanguage && newLevel) {
            setLanguages([...languages, { language: newLanguage, level: newLevel }]);
            setNewLanguage("");
            setNewLevel("");
        }
    };

    const removeLanguage = (index: number) => {
        setLanguages(languages.filter((_, i) => i !== index));
    };

    // Tab titles mapping
    const tabTitles: Record<string, string> = {
        overview: "Overview",
        preferences: "Your Preferences",
        "tech-stack": "Your Tech Stack",
        experience: "Your Experience",
        projects: "Your Projects",
        education: "Your Education",
        certifications: "Your Certifications"
    };

    // Tab subtitles mapping
    const tabSubtitles: Record<string, string> = {
        overview: "Complete your profile to get matched with relevant jobs",
        preferences: "Set your job preferences and work style",
        "tech-stack": "Add your technical skills and expertise",
        experience: "Showcase your professional experience",
        projects: "Highlight your personal and professional projects",
        education: "Add your educational background",
        certifications: "Add your professional certifications"
    };

    // Tab icons mapping
    const tabIcons: Record<string, React.ComponentType<{ className?: string }>> = {
        overview: IdCard,
        preferences: Settings,
        "tech-stack": Code,
        experience: Briefcase,
        projects: FolderKanban,
        education: GraduationCap,
        certifications: Award
    };

    // Get user initial
    const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

    // Get all countries
    const countries = useMemo(() => Country.getAllCountries(), []);

    // Get regions/states for selected country
    const regions = useMemo(() => {
        if (selectedCountry) {
            return State.getStatesOfCountry(selectedCountry) || [];
        }
        return [];
    }, [selectedCountry]);

    // Get cities for selected region
    const cities = useMemo(() => {
        if (selectedCountry && selectedRegion) {
            return City.getCitiesOfState(selectedCountry, selectedRegion) || [];
        }
        return [];
    }, [selectedCountry, selectedRegion]);

    // Get country flag emoji
    const getCountryFlag = (countryCode: string) => {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };

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

    // Tech Stack State
    const [techSearch, setTechSearch] = useState("");
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    // Default popular technologies (always visible in grid - 4x4 = 16)
    const defaultTechIds = [
        "javascript", "react", "python", "html5",
        "css3", "typescript", "node-js", "java",
        "cloudflare", "docker", "aws", "mongodb",
        "postgressql", "git", "firebase", "vercel"
    ];

    const toggleTech = (techId: string) => {
        setSelectedTechs(prev =>
            prev.includes(techId)
                ? prev.filter(id => id !== techId)
                : [...prev, techId]
        );
    };

    const groupedSelectedTechs = useMemo(() => {
        const grouped: Record<string, TechItem[]> = {};
        selectedTechs.forEach(id => {
            const tech = allTechs.find(t => t.id === id);
            if (tech) {
                if (!grouped[tech.category]) grouped[tech.category] = [];
                grouped[tech.category].push(tech);
            }
        });
        return grouped;
    }, [selectedTechs]);

    // Always show 16 items (4x4 grid): search matches first, then fill with defaults
    const displayedTechs = useMemo(() => {
        const GRID_SIZE = 16;
        const searchMatches = techSearch
            ? allTechs.filter(t => t.name.toLowerCase().includes(techSearch.toLowerCase()))
            : [];

        // Get default techs
        const defaultTechs = defaultTechIds
            .map(id => allTechs.find(t => t.id === id))
            .filter((t): t is TechItem => t !== undefined);

        if (!techSearch) {
            // No search: show defaults
            return defaultTechs.slice(0, GRID_SIZE);
        }

        // With search: matches first, then fill with defaults (avoiding duplicates)
        const matchIds = new Set(searchMatches.map(t => t.id));
        const result = [...searchMatches];

        for (const tech of defaultTechs) {
            if (result.length >= GRID_SIZE) break;
            if (!matchIds.has(tech.id)) {
                result.push(tech);
            }
        }

        // If still not 16, add more from allTechs
        if (result.length < GRID_SIZE) {
            const usedIds = new Set(result.map(t => t.id));
            for (const tech of allTechs) {
                if (result.length >= GRID_SIZE) break;
                if (!usedIds.has(tech.id)) {
                    result.push(tech);
                }
            }
        }

        return result.slice(0, GRID_SIZE);
    }, [techSearch]);

    // Experience State
    type Experience = {
        id: string;
        title: string;
        employmentType: string;
        companyName: string;
        country: string;
        isCurrentRole: boolean;
        startMonth: string;
        startYear: string;
        endMonth: string;
        endYear: string;
        skills: string[];
        description: string;
    };

    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);
    const [isAddWithAIOpen, setIsAddWithAIOpen] = useState(false);

    // Experience form state
    const [expTitle, setExpTitle] = useState("");
    const [expEmploymentType, setExpEmploymentType] = useState("");
    const [expCompanyName, setExpCompanyName] = useState("");
    const [expCountry, setExpCountry] = useState("");
    const [expIsCurrentRole, setExpIsCurrentRole] = useState(false);
    const [expStartMonth, setExpStartMonth] = useState("");
    const [expStartYear, setExpStartYear] = useState("");
    const [expEndMonth, setExpEndMonth] = useState("");
    const [expEndYear, setExpEndYear] = useState("");
    const [expSkills, setExpSkills] = useState<string[]>([]);
    const [expSkillSearch, setExpSkillSearch] = useState("");
    const [expDescription, setExpDescription] = useState("");
    const [aiExperienceText, setAiExperienceText] = useState("");

    const employmentTypes = [
        "Full-time", "Part-time", "Contract", "Freelance", "Internship", "Self-employed"
    ];

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

    const resetExperienceForm = () => {
        setExpTitle("");
        setExpEmploymentType("");
        setExpCompanyName("");
        setExpCountry("");
        setExpIsCurrentRole(false);
        setExpStartMonth("");
        setExpStartYear("");
        setExpEndMonth("");
        setExpEndYear("");
        setExpSkills([]);
        setExpSkillSearch("");
        setExpDescription("");
    };

    const addExperience = () => {
        if (expTitle && expEmploymentType && expCompanyName && expStartMonth && expStartYear && expDescription) {
            const newExp: Experience = {
                id: Date.now().toString(),
                title: expTitle,
                employmentType: expEmploymentType,
                companyName: expCompanyName,
                country: expCountry,
                isCurrentRole: expIsCurrentRole,
                startMonth: expStartMonth,
                startYear: expStartYear,
                endMonth: expIsCurrentRole ? "" : expEndMonth,
                endYear: expIsCurrentRole ? "" : expEndYear,
                skills: expSkills,
                description: expDescription,
            };
            setExperiences([...experiences, newExp]);
            resetExperienceForm();
            setIsAddExperienceOpen(false);
        }
    };

    const removeExperience = (id: string) => {
        setExperiences(experiences.filter(exp => exp.id !== id));
    };

    const addSkillToExperience = (skillName: string) => {
        if (!expSkills.includes(skillName)) {
            setExpSkills([...expSkills, skillName]);
        }
        setExpSkillSearch("");
    };

    const removeSkillFromExperience = (skillName: string) => {
        setExpSkills(expSkills.filter(s => s !== skillName));
    };

    return (
        <div className="flex flex-col h-full w-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                        {(() => {
                            const IconComponent = tabIcons[activeTab];
                            return <IconComponent className="w-6 h-6 text-blue-600" />;
                        })()}
                        {tabTitles[activeTab]}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {tabSubtitles[activeTab]}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                        <MoreHorizontal className="size-4" />
                    </Button>
                    <Button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-600 transition-colors">
                        <CloudUpload className="size-4 mr-2" />
                        Import resume
                    </Button>
                </div>
            </div>

            {/* Content using Tabs */}
            <div className="flex-1 overflow-auto p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                            value="projects"
                            className="flex-none rounded-none bg-transparent px-0 py-3 text-base font-medium text-muted-foreground transition-all hover:text-foreground"
                        >
                            Projects
                        </TabsTrigger>
                        <TabsTrigger
                            value="education"
                            className="flex-none rounded-none bg-transparent px-0 py-3 text-base font-medium text-muted-foreground transition-all hover:text-foreground"
                        >
                            Education
                        </TabsTrigger>
                        <TabsTrigger
                            value="certifications"
                            className="flex-none rounded-none bg-transparent px-0 py-3 text-base font-medium text-muted-foreground transition-all hover:text-foreground"
                        >
                            Certifications
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8 max-w-3xl">



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
                                            <div className="size-full bg-blue-600 flex items-center justify-center">
                                                <span className="text-4xl font-semibold text-blue-200">{userInitial}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={onDrop}
                                        className="flex-1 p-8 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-600 transition-colors cursor-pointer group"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div className="p-2 bg-gray-100 rounded-full mb-2 group-hover:bg-blue-100 transition-colors">
                                            <Upload className="size-4 text-gray-600 group-hover:text-blue-600" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-blue-600">Click to upload</span>
                                            <span className="text-sm text-muted-foreground"> or drag and drop</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Use a square image for best results</p>
                                    </div>
                                </div>
                            </div>


                            {/* Social Links */}
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6 border-b">
                                <div>
                                    <h3 className="text-sm font-medium">Social links</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Add your social profiles to help recruiters find you.
                                    </p>
                                </div>
                                <div className="space-y-4 max-w-md">
                                    {/* LinkedIn */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">LinkedIn Username</label>
                                        <div className="relative">
                                            <div className="absolute left-0 top-0 h-full w-12 flex items-center justify-center border-r bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-l-lg z-10">
                                                <Linkedin className="size-5 text-[#0A66C2]" />
                                            </div>
                                            <Input
                                                value={linkedinUrl}
                                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                                placeholder="richard-hendricks-pied"
                                                spellCheck={false}
                                                className="pl-14 h-11 text-sm rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        {linkedinUrl && (
                                            <p className="text-sm text-muted-foreground mt-1.5">linkedin.com/in/{linkedinUrl}</p>
                                        )}
                                    </div>
                                    {/* GitHub */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">GitHub Username</label>
                                        <div className="relative">
                                            <div className="absolute left-0 top-0 h-full w-12 flex items-center justify-center border-r bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-l-lg z-10">
                                                <Github className="size-5 text-gray-900 dark:text-white" />
                                            </div>
                                            <Input
                                                value={githubUrl}
                                                onChange={(e) => setGithubUrl(e.target.value)}
                                                placeholder="piedpiper"
                                                spellCheck={false}
                                                className="pl-14 h-11 text-sm rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        {githubUrl && (
                                            <p className="text-sm text-muted-foreground mt-1.5">github.com/{githubUrl}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Introduction */}
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6 border-b">
                                <div>
                                    <h3 className="text-sm font-medium">Introduction*</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Write a brief introduction. This will be shown on recruiters on our talent search pages.
                                    </p>
                                </div>
                                <div>
                                    <textarea
                                        value={introduction}
                                        onChange={(e) => setIntroduction(e.target.value)}
                                        placeholder="e.g. We're spread all over the world..."
                                        rows={3}
                                        className="w-full bg-white dark:bg-input/30 border border-gray-200 dark:border-input rounded-lg px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/20 transition-colors resize-none"
                                    />
                                </div>
                            </div>

                            {/* Country */}
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6 border-b">
                                <div>
                                    <h3 className="text-sm font-medium">What country do you currently reside in?*</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        This helps us match you with companies that are open to hiring talent in your country.
                                    </p>
                                </div>
                                <div className="max-w-xs">
                                    <Select value={selectedCountry} onValueChange={(value) => {
                                        setSelectedCountry(value);
                                        setSelectedRegion(""); // Reset region when country changes
                                    }}>
                                        <SelectTrigger className="w-full">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{getCountryFlag(selectedCountry)}</span>
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {countries.map((country) => (
                                                <SelectItem key={country.isoCode} value={country.isoCode}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{getCountryFlag(country.isoCode)}</span>
                                                        <span>{country.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Region/Province */}
                            {selectedCountry && regions.length > 0 && (
                                <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6 border-b">
                                    <div>
                                        <h3 className="text-sm font-medium">What region do you live in?</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Select your province or state.
                                        </p>
                                    </div>
                                    <div className="max-w-xs">
                                        <Select value={selectedRegion} onValueChange={(value) => {
                                            setSelectedRegion(value);
                                            setSelectedCity(""); // Reset city when region changes
                                        }}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {regions.map((region) => (
                                                    <SelectItem key={region.isoCode} value={region.isoCode}>
                                                        {region.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* City */}
                            {selectedRegion && cities.length > 0 && (
                                <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6">
                                    <div>
                                        <h3 className="text-sm font-medium">What city do you live in?</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            This is optional but helps with local job matching.
                                        </p>
                                    </div>
                                    <div className="max-w-xs">
                                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {cities.map((city) => (
                                                    <SelectItem key={city.name} value={city.name}>
                                                        {city.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Languages */}
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start py-6 border-b">
                                <div>
                                    <h3 className="text-sm font-medium">Languages</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Add the languages you speak and your proficiency level.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {/* Added languages list */}
                                    {languages.length > 0 && (
                                        <div className="space-y-2">
                                            {languages.map((lang, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-md">
                                                    <Languages className="size-4 text-blue-600" />
                                                    <span className="font-medium text-sm">{lang.language}</span>
                                                    <span className="text-sm text-muted-foreground">•</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {proficiencyLevels.find(l => l.value === lang.level)?.label}
                                                    </span>
                                                    <button
                                                        onClick={() => removeLanguage(index)}
                                                        className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                    >
                                                        <Trash2 className="size-4 text-red-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add new language form */}
                                    {/* Add new language form */}
                                    <div className="flex items-center gap-2 max-w-md">
                                        <div className="flex-1">
                                            <Select value={newLanguage} onValueChange={setNewLanguage}>
                                                <SelectTrigger className="w-full">
                                                    {newLanguage ? <SelectValue /> : <span className="text-muted-foreground">Select language</span>}
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    {commonLanguages
                                                        .filter(lang => !languages.some(l => l.language === lang))
                                                        .map((lang) => (
                                                            <SelectItem key={lang} value={lang}>
                                                                {lang}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex-1">
                                            <Select value={newLevel} onValueChange={setNewLevel}>
                                                <SelectTrigger className="w-full">
                                                    {newLevel ? (
                                                        <span>{proficiencyLevels.find(l => l.value === newLevel)?.label}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">Select level</span>
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {proficiencyLevels.map((level) => (
                                                        <SelectItem key={level.value} value={level.value}>
                                                            {level.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            onClick={addLanguage}
                                            disabled={!newLanguage || !newLevel}
                                            variant="outline"
                                            className="h-10 px-3 bg-white dark:bg-transparent dark:hover:bg-accent border-dashed border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:border-blue-400 disabled:opacity-50 transition-all font-medium"
                                        >
                                            <Plus className="size-4 mr-1.5" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </TabsContent>

                    <TabsContent value="preferences" className="space-y-8 max-w-3xl">
                        <div className="text-center py-12 text-muted-foreground">
                            Preferences content coming soon...
                        </div>
                    </TabsContent>

                    <TabsContent value="tech-stack" className="space-y-8">
                        <div className="space-y-8">
                            {/* Search Section - Himalayas style with left label */}
                            <div className="grid grid-cols-[200px_1fr] gap-8 items-start">
                                <div>
                                    <h3 className="text-sm font-medium">Search</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Search for the tools & services you have experience with.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="relative max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            value={techSearch}
                                            onChange={(e) => setTechSearch(e.target.value)}
                                            placeholder="e.g. Next.js"
                                            spellCheck={false}
                                            className="pl-10 h-11 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                                        />
                                    </div>

                                    {/* Always visible 4x4 Grid (16 items) */}
                                    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2.5">
                                        {displayedTechs.map(tech => (
                                            <div
                                                key={tech.id}
                                                onClick={() => toggleTech(tech.id)}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer transition-all select-none relative min-w-0",
                                                    selectedTechs.includes(tech.id)
                                                        ? "border-blue-600 bg-blue-50/80 dark:bg-blue-900/30"
                                                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
                                                )}
                                            >
                                                <div className="size-12 rounded-md flex items-center justify-center shrink-0">
                                                    <Image src={tech.iconPath} alt={tech.name} width={40} height={40} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-sm font-medium truncate">{tech.name}</span>
                                                {selectedTechs.includes(tech.id) && (
                                                    <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white p-0.5 rounded-full">
                                                        <Check className="size-2.5" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Selected Technologies - Grouped by Category */}
                            {Object.keys(groupedSelectedTechs).length > 0 && (
                                <div className="space-y-6 pt-4">
                                    {Object.entries(groupedSelectedTechs).map(([category, techs]) => (
                                        <div key={category} className="space-y-3">
                                            {/* Category Header with lines */}
                                            <div className="flex items-center gap-4">
                                                <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{category}</span>
                                                <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                                            </div>
                                            {/* Tech Cards Grid */}
                                            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2.5 pl-[232px]">
                                                {techs.map(tech => (
                                                    <div
                                                        key={tech.id}
                                                        onClick={() => toggleTech(tech.id)}
                                                        className="flex items-center gap-3 px-4 py-2 rounded-lg border-2 border-blue-600 bg-blue-50/80 dark:bg-blue-900/30 cursor-pointer transition-all select-none relative min-w-0"
                                                    >
                                                        <div className="size-12 rounded-md flex items-center justify-center shrink-0">
                                                            <Image src={tech.iconPath} alt={tech.name} width={40} height={40} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-sm font-medium truncate">{tech.name}</span>
                                                        <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white p-0.5 rounded-full">
                                                            <Check className="size-2.5" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-1">Experience</h3>
                            <p className="text-sm text-muted-foreground">
                                Add your experience to your profile to help us match you with the right opportunities.
                            </p>
                        </div>

                        {experiences.length === 0 ? (
                            /* Empty State */
                            <div className="border rounded-xl p-12 text-center">
                                <div className="inline-flex items-center justify-center size-14 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
                                    <Wand2 className="size-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-semibold mb-2">You haven&apos;t added your work experience yet</h4>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                    Adding experience will help us match you with the right opportunities.
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddWithAIOpen(true)}
                                    >
                                        Add with AI
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => setIsAddExperienceOpen(true)}
                                    >
                                        <Plus className="size-4 mr-1" />
                                        Add experience
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* Experience List */
                            <div className="space-y-4">
                                {experiences.map((exp) => (
                                    <div key={exp.id} className="border rounded-xl p-5 relative group">
                                        <button
                                            onClick={() => removeExperience(exp.id)}
                                            className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                        >
                                            <Trash2 className="size-4 text-red-500" />
                                        </button>
                                        <div className="flex gap-4">
                                            <div className="size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                <Building2 className="size-6 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-base">{exp.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {exp.companyName} · {exp.employmentType}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {exp.startMonth} {exp.startYear} - {exp.isCurrentRole ? "Present" : `${exp.endMonth} ${exp.endYear}`}
                                                    {exp.country && ` · ${exp.country}`}
                                                </p>
                                                {exp.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {exp.skills.map((skill) => (
                                                            <span key={skill} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-md">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-sm mt-2 line-clamp-2">{exp.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add more button */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddWithAIOpen(true)}
                                    >
                                        Add with AI
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => setIsAddExperienceOpen(true)}
                                    >
                                        <Plus className="size-4 mr-1" />
                                        Add experience
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-8 max-w-3xl">
                        <div className="text-center py-12 text-muted-foreground">
                            Projects content coming soon...
                        </div>
                    </TabsContent>

                    <TabsContent value="education" className="space-y-8 max-w-3xl">
                        <div className="text-center py-12 text-muted-foreground">
                            Education content coming soon...
                        </div>
                    </TabsContent>

                    <TabsContent value="certifications" className="space-y-8 max-w-3xl">
                        <div className="text-center py-12 text-muted-foreground">
                            Certifications content coming soon...
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Experience Modals - positioned relative to content area */}
                {/* Add with AI Modal */}
                <AnimatePresence>
                    {isAddWithAIOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                            onClick={(e) => e.target === e.currentTarget && setIsAddWithAIOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-lg mx-4 bg-background rounded-xl shadow-2xl border border-border/50 flex flex-col max-h-[85vh]"
                            >
                                {/* Header */}
                                <div className="p-6 pb-0">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Sparkles className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">Add experience with AI</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Paste in the relevant section from your resume or LinkedIn and let our AI extract your work experience for you.
                                            </p>
                                        </div>
                                        <button onClick={() => setIsAddWithAIOpen(false)} className="p-1 hover:bg-muted rounded-md">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div>
                                        <label className="text-sm font-medium">Experience*</label>
                                        <Textarea
                                            value={aiExperienceText}
                                            onChange={(e) => setAiExperienceText(e.target.value)}
                                            placeholder="Paste in the experience section from your resume or LinkedIn here..."
                                            className="mt-2 min-h-[120px] resize-none"
                                            maxLength={16000}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {(16000 - aiExperienceText.length).toLocaleString()} characters left
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30 rounded-b-xl flex items-center justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsAddWithAIOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={!aiExperienceText.trim()}
                                    >
                                        Add with AI
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Experience Modal */}
                <AnimatePresence>
                    {isAddExperienceOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                            onClick={(e) => e.target === e.currentTarget && setIsAddExperienceOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-lg mx-4 bg-background rounded-xl shadow-2xl border border-border/50 flex flex-col max-h-[85vh]"
                            >
                                {/* Header */}
                                <div className="p-6 pb-0">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Flag className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">Add experience</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Share a role and achievements on your profile.
                                            </p>
                                        </div>
                                        <button onClick={() => { resetExperienceForm(); setIsAddExperienceOpen(false); }} className="p-1 hover:bg-muted rounded-md">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable Form */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                    {/* Title */}
                                    <div>
                                        <label className="text-sm font-medium">Title*</label>
                                        <Input
                                            value={expTitle}
                                            onChange={(e) => setExpTitle(e.target.value.slice(0, 40))}
                                            placeholder="Ex: Software Engineer"
                                            className="mt-2"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">40 characters</p>
                                    </div>

                                    {/* Employment Type */}
                                    <div>
                                        <label className="text-sm font-medium">Employment type*</label>
                                        <Select value={expEmploymentType} onValueChange={setExpEmploymentType}>
                                            <SelectTrigger className="mt-2 w-full">
                                                <SelectValue placeholder="Select employment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employmentTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Company Name */}
                                    <div>
                                        <label className="text-sm font-medium">Company name*</label>
                                        <div className="relative mt-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input
                                                value={expCompanyName}
                                                onChange={(e) => setExpCompanyName(e.target.value)}
                                                placeholder="e.g. Himalayas"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="text-sm font-medium">Country</label>
                                        <Select value={expCountry} onValueChange={setExpCountry}>
                                            <SelectTrigger className="mt-2 w-full">
                                                <SelectValue placeholder="Search for a country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Country.getAllCountries().map((c) => (
                                                    <SelectItem key={c.isoCode} value={c.name}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Start Date */}
                                    <div>
                                        <label className="text-sm font-medium">Start date*</label>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            <Select value={expStartMonth} onValueChange={setExpStartMonth}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((m) => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select value={expStartYear} onValueChange={setExpStartYear}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((y) => (
                                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label className="text-sm font-medium">End date*</label>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            <Select
                                                value={expIsCurrentRole ? "Present" : expEndMonth}
                                                onValueChange={(val) => {
                                                    if (val === "Present") {
                                                        setExpIsCurrentRole(true);
                                                        setExpEndMonth("");
                                                        setExpEndYear("");
                                                    } else {
                                                        setExpIsCurrentRole(false);
                                                        setExpEndMonth(val);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Present">Present</SelectItem>
                                                    {months.map((m) => (
                                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select
                                                value={expEndYear}
                                                onValueChange={setExpEndYear}
                                                disabled={expIsCurrentRole}
                                            >
                                                <SelectTrigger className={cn("w-full", expIsCurrentRole && "opacity-50")}>
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((y) => (
                                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Currently Working Checkbox */}
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="currentRole"
                                            checked={expIsCurrentRole}
                                            onCheckedChange={(checked) => {
                                                setExpIsCurrentRole(checked as boolean);
                                                if (checked) {
                                                    setExpEndMonth("");
                                                    setExpEndYear("");
                                                }
                                            }}
                                        />
                                        <label htmlFor="currentRole" className="text-sm cursor-pointer">
                                            I am currently working in this role
                                        </label>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <label className="text-sm font-medium">Skills</label>
                                        {expSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                                                {expSkills.map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-sm rounded-md"
                                                    >
                                                        {skill}
                                                        <button onClick={() => removeSkillFromExperience(skill)}>
                                                            <X className="size-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="relative mt-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input
                                                value={expSkillSearch}
                                                onChange={(e) => setExpSkillSearch(e.target.value)}
                                                placeholder="e.g. Next.js"
                                                className="pl-10"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && expSkillSearch.trim()) {
                                                        e.preventDefault();
                                                        addSkillToExperience(expSkillSearch.trim());
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="text-sm font-medium">Description*</label>
                                        <Textarea
                                            value={expDescription}
                                            onChange={(e) => setExpDescription(e.target.value.slice(0, 400))}
                                            placeholder="e.g. I was a software engineer at Google."
                                            className="mt-2 min-h-[100px] resize-none"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">400 characters</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30 rounded-b-xl flex items-center justify-end gap-3">
                                    <Button variant="outline" onClick={() => { resetExperienceForm(); setIsAddExperienceOpen(false); }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={addExperience}
                                        disabled={!expTitle || !expEmploymentType || !expCompanyName || !expStartMonth || !expStartYear || !expDescription}
                                    >
                                        Add experience
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.01}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-grab"
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
        </div >
    );
}
