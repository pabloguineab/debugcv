"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { Upload, MoreHorizontal, ExternalLink, X, Minus, Plus, Linkedin, Github, IdCard, Settings, Code, Briefcase, GraduationCap, CloudUpload, FolderKanban, Award, Languages, Trash2, Search, Check, Sparkles, Wand2, Flag, Building2, CalendarDays, Pencil } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import getCroppedImg from "@/lib/crop-image";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import {
    fetchFullProfile, updateProfile, saveExperience, deleteExperience,
    saveEducation, deleteEducation, saveProject, deleteProject,
    saveCertification, deleteCertification
} from "@/lib/actions/profile";
import { useProfileCompletion } from "@/contexts/profile-completion-context";
import { ImportResumeModal } from "@/components/import-resume-modal";
import { type ExtractedProfile } from "@/app/actions/extract-profile-from-cv";

export default function ProfilePage() {
    const { data: session } = useSession();
    const { refreshCompletionStatus } = useProfileCompletion();
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
    const [userName, setUserName] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>("overview");
    const { setActiveTab: setBreadcrumbTab } = useBreadcrumb();

    // Import Resume Modal state
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

    const addLanguage = async () => {
        if (newLanguage && newLevel) {
            const newList = [...languages, { language: newLanguage, level: newLevel }];
            setLanguages(newList);
            setNewLanguage("");
            setNewLevel("");
            try {
                await updateProfile({ languages: newList });
                await refreshCompletionStatus();
            } catch (err) {
                console.error("Failed to save language", err);
            }
        }
    };

    const removeLanguage = async (index: number) => {
        const newList = languages.filter((_, i) => i !== index);
        setLanguages(newList);
        try {
            await updateProfile({ languages: newList });
            await refreshCompletionStatus();
        } catch (err) {
            console.error("Failed to save language", err);
        }
    };

    // Tab titles mapping
    const tabTitles: Record<string, string> = {
        overview: "Overview",
        "tech-stack": "Tech Stack",
        experience: "Experience",
        projects: "Projects",
        education: "Education",
        certifications: "Certifications"
    };

    // Sync active tab with breadcrumb context
    useEffect(() => {
        setBreadcrumbTab(tabTitles[activeTab] || null);
        return () => setBreadcrumbTab(null);
    }, [activeTab, setBreadcrumbTab]);

    const [isLoadingData, setIsLoadingData] = useState(true);

    // Load data from DB
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                const data = await fetchFullProfile();
                console.log("Loaded profile data:", data);
                if (data) {
                    // Profile
                    if (data.profile) {
                        setLinkedinUrl(data.profile.linkedin_user || "");
                        setGithubUrl(data.profile.github_user || "");
                        setIntroduction(data.profile.bio || "");
                        if (data.profile.tech_stack) setSelectedTechs(data.profile.tech_stack);
                        if (data.profile.languages) setLanguages(Array.isArray(data.profile.languages) ? data.profile.languages : []);
                        if (data.profile.image_url) setProfileImage(data.profile.image_url);
                        if (data.profile.full_name) setUserName(data.profile.full_name);
                    }

                    // Experience
                    if (data.experiences) {
                        setExperiences(data.experiences.map((e: any) => ({
                            id: e.id!,
                            title: e.title,
                            employmentType: e.employment_type,
                            companyName: e.company_name,
                            companyUrl: e.company_url || "",
                            country: e.country || "",
                            isCurrentRole: e.is_current,
                            startMonth: e.start_month,
                            startYear: e.start_year,
                            endMonth: e.end_month,
                            endYear: e.end_year,
                            skills: e.skills || [],
                            description: e.description
                        })));
                    }

                    // Education
                    if (data.educations) {
                        setEducations(data.educations.map((e: any) => ({
                            id: e.id!,
                            school: e.school,
                            schoolUrl: e.school_url || "",
                            degree: e.degree || "",
                            fieldOfStudy: e.field_of_study || "",
                            grade: e.grade || "",
                            activities: e.activities || "",
                            description: e.description || "",
                            isCurrentlyStudying: e.is_current,
                            startYear: e.start_year,
                            endYear: e.end_year
                        })));
                    }

                    // Projects
                    if (data.projects) {
                        setProjects(data.projects.map((p: any) => ({
                            id: p.id!,
                            name: p.name,
                            projectUrl: p.project_url || "",
                            description: p.description || "",
                            technologies: p.technologies || [],
                            isOngoing: p.is_ongoing,
                            startMonth: p.start_month || "",
                            startYear: p.start_year || "",
                            endMonth: p.end_month || "",
                            endYear: p.end_year || ""
                        })));
                    }

                    // Certifications
                    if (data.certifications) {
                        setCertifications(data.certifications.map((c: any) => ({
                            id: c.id!,
                            name: c.name,
                            issuingOrganization: c.issuing_org,
                            credentialId: c.credential_id || "",
                            credentialUrl: c.credential_url || "",
                            issueMonth: c.issue_month || "",
                            issueYear: c.issue_year || "",
                            expirationMonth: c.expiration_month || "",
                            expirationYear: c.expiration_year || "",
                            doesNotExpire: c.no_expiration || false,
                            skills: c.skills || []
                        })));
                    }
                }
            } catch (error) {
                console.error("Failed to load profile data", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadData();
    }, []);

    // Sync session data if profile data is missing
    useEffect(() => {
        if (!isLoadingData && session?.user) {
            setProfileImage(prev => prev || session.user?.image || null);
            setUserName(prev => prev || session.user?.name || "");
        }
    }, [session, isLoadingData]);

    // Auto-save location
    useEffect(() => {
        if (!isLoadingData && selectedCity && selectedRegion) {
            const timer = setTimeout(() => {
                updateProfile({ location: `${selectedCity}, ${selectedRegion}` })
                    .then(() => refreshCompletionStatus())
                    .catch(err => console.error("Auto-save location error", err));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [selectedCity, selectedRegion, isLoadingData]);

    // Tab subtitles mapping
    const tabSubtitles: Record<string, string> = {
        overview: "Complete your profile to get matched with relevant jobs",
        "tech-stack": "Add your technical skills and expertise",
        experience: "Showcase your professional experience",
        projects: "Highlight your personal and professional projects",
        education: "Add your educational background",
        certifications: "Add your professional certifications"
    };

    // Tab icons mapping
    const tabIcons: Record<string, React.ComponentType<{ className?: string }>> = {
        overview: IdCard,
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

                // Save to backend
                await updateProfile({ image_url: croppedImage });
                await refreshCompletionStatus();

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

    const toggleTech = async (techId: string) => {
        const newTechs = selectedTechs.includes(techId)
            ? selectedTechs.filter(id => id !== techId)
            : [...selectedTechs, techId];

        setSelectedTechs(newTechs);

        try {
            await updateProfile({ tech_stack: newTechs });
            await refreshCompletionStatus();
        } catch (err) {
            console.error("Failed to save tech stack", err);
        }
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
        companyUrl: string;
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
    const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);

    // Experience form state
    const [expTitle, setExpTitle] = useState("");
    const [expEmploymentType, setExpEmploymentType] = useState("");
    const [expCompanyName, setExpCompanyName] = useState("");
    const [expCompanyUrl, setExpCompanyUrl] = useState("");
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
        setExpCompanyUrl("");
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

    const saveOrUpdateExperience = async () => {
        if (expTitle && expEmploymentType && expCompanyName && expStartMonth && expStartYear && expDescription) {
            try {
                const experienceData = {
                    id: editingExperienceId || undefined,
                    title: expTitle,
                    employment_type: expEmploymentType,
                    company_name: expCompanyName,
                    company_url: expCompanyUrl,
                    country: expCountry,
                    start_month: expStartMonth,
                    start_year: expStartYear,
                    end_month: expIsCurrentRole ? "" : expEndMonth,
                    end_year: expIsCurrentRole ? "" : expEndYear,
                    is_current: expIsCurrentRole,
                    description: expDescription,
                    skills: expSkills
                };

                const saved = await saveExperience(experienceData);

                if (saved) {
                    const updatedExp: Experience = {
                        id: saved.id,
                        title: saved.title,
                        employmentType: saved.employment_type,
                        companyName: saved.company_name,
                        companyUrl: saved.company_url || "",
                        country: saved.country || "",
                        isCurrentRole: saved.is_current,
                        startMonth: saved.start_month,
                        startYear: saved.start_year,
                        endMonth: saved.end_month,
                        endYear: saved.end_year,
                        skills: saved.skills || [],
                        description: saved.description,
                    };

                    if (editingExperienceId) {
                        // Update existing
                        setExperiences(experiences.map(exp => exp.id === editingExperienceId ? updatedExp : exp));
                    } else {
                        // Add new
                        setExperiences([...experiences, updatedExp]);
                    }
                    resetExperienceForm();
                    setEditingExperienceId(null);
                    setIsAddExperienceOpen(false);
                    await refreshCompletionStatus();
                }
            } catch (err) {
                console.error("Failed to save experience", err);
            }
        }
    };

    const editExperience = (exp: Experience) => {
        setEditingExperienceId(exp.id);
        setExpTitle(exp.title);
        setExpEmploymentType(exp.employmentType);
        setExpCompanyName(exp.companyName);
        setExpCompanyUrl(exp.companyUrl);
        setExpCountry(exp.country);
        setExpIsCurrentRole(exp.isCurrentRole);
        setExpStartMonth(exp.startMonth);
        setExpStartYear(exp.startYear);
        setExpEndMonth(exp.endMonth);
        setExpEndYear(exp.endYear);
        setExpSkills(exp.skills);
        setExpDescription(exp.description);
        setIsAddExperienceOpen(true);
    };

    const removeExperience = async (id: string) => {
        setExperiences(experiences.filter(exp => exp.id !== id));
        try {
            await deleteExperience(id);
            await refreshCompletionStatus();
        } catch (err) {
            console.error(err);
        }
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

    // Education state
    type Education = {
        id: string;
        school: string;
        schoolUrl: string;
        degree: string;
        fieldOfStudy: string;
        grade: string;
        activities: string;
        description: string;
        isCurrentlyStudying: boolean;
        startYear: string;
        endYear: string;
    };

    const [educations, setEducations] = useState<Education[]>([]);
    const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
    const [isAddEducationWithAIOpen, setIsAddEducationWithAIOpen] = useState(false);
    const [editingEducationId, setEditingEducationId] = useState<string | null>(null);

    // Education form state
    const [eduSchool, setEduSchool] = useState("");
    const [eduSchoolUrl, setEduSchoolUrl] = useState("");
    const [eduDegree, setEduDegree] = useState("");
    const [eduFieldOfStudy, setEduFieldOfStudy] = useState("");
    const [eduGrade, setEduGrade] = useState("");
    const [eduActivities, setEduActivities] = useState("");
    const [eduDescription, setEduDescription] = useState("");
    const [eduIsCurrentlyStudying, setEduIsCurrentlyStudying] = useState(false);
    const [eduStartYear, setEduStartYear] = useState("");
    const [eduEndYear, setEduEndYear] = useState("");
    const [aiEducationText, setAiEducationText] = useState("");

    const resetEducationForm = () => {
        setEduSchool("");
        setEduSchoolUrl("");
        setEduDegree("");
        setEduFieldOfStudy("");
        setEduGrade("");
        setEduActivities("");
        setEduDescription("");
        setEduIsCurrentlyStudying(false);
        setEduStartYear("");
        setEduEndYear("");
    };

    const saveOrUpdateEducation = async () => {
        if (eduSchool && eduSchoolUrl && eduStartYear) {
            try {
                const saved = await saveEducation({
                    id: editingEducationId || undefined,
                    school: eduSchool,
                    school_url: eduSchoolUrl,
                    degree: eduDegree,
                    field_of_study: eduFieldOfStudy,
                    grade: eduGrade,
                    activities: eduActivities,
                    description: eduDescription,
                    start_year: eduStartYear,
                    end_year: eduIsCurrentlyStudying ? "" : eduEndYear,
                    is_current: eduIsCurrentlyStudying
                });

                if (saved) {
                    const updatedEdu: Education = {
                        id: saved.id,
                        school: saved.school,
                        schoolUrl: saved.school_url || "",
                        degree: saved.degree || "",
                        fieldOfStudy: saved.field_of_study || "",
                        grade: saved.grade || "",
                        activities: saved.activities || "",
                        description: saved.description || "",
                        isCurrentlyStudying: saved.is_current,
                        startYear: saved.start_year,
                        endYear: saved.end_year,
                    };

                    if (editingEducationId) {
                        setEducations(educations.map(edu => edu.id === editingEducationId ? updatedEdu : edu));
                    } else {
                        setEducations([...educations, updatedEdu]);
                    }
                    resetEducationForm();
                    setEditingEducationId(null);
                    setIsAddEducationOpen(false);
                    await refreshCompletionStatus();
                }
            } catch (err) {
                console.error("Failed to save education", err);
            }
        }
    };

    const editEducation = (edu: Education) => {
        setEditingEducationId(edu.id);
        setEduSchool(edu.school);
        setEduSchoolUrl(edu.schoolUrl);
        setEduDegree(edu.degree);
        setEduFieldOfStudy(edu.fieldOfStudy);
        setEduGrade(edu.grade);
        setEduActivities(edu.activities);
        setEduDescription(edu.description);
        setEduIsCurrentlyStudying(edu.isCurrentlyStudying);
        setEduStartYear(edu.startYear);
        setEduEndYear(edu.endYear);
        setIsAddEducationOpen(true);
    };

    const removeEducation = async (id: string) => {
        setEducations(educations.filter(edu => edu.id !== id));
        try {
            await deleteEducation(id);
            await refreshCompletionStatus();
        } catch (err) {
            console.error(err);
        }
    };

    // Projects state
    type Project = {
        id: string;
        name: string;
        projectUrl: string;
        description: string;
        technologies: string[];
        isOngoing: boolean;
        startMonth: string;
        startYear: string;
        endMonth: string;
        endYear: string;
    };

    const [projects, setProjects] = useState<Project[]>([]);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isAddProjectWithAIOpen, setIsAddProjectWithAIOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    // Project form state
    const [projName, setProjName] = useState("");
    const [projUrl, setProjUrl] = useState("");
    const [projDescription, setProjDescription] = useState("");
    const [projTechnologies, setProjTechnologies] = useState<string[]>([]);
    const [projTechSearch, setProjTechSearch] = useState("");
    const [projIsOngoing, setProjIsOngoing] = useState(false);
    const [projStartMonth, setProjStartMonth] = useState("");
    const [projStartYear, setProjStartYear] = useState("");
    const [projEndMonth, setProjEndMonth] = useState("");
    const [projEndYear, setProjEndYear] = useState("");
    const [aiProjectText, setAiProjectText] = useState("");

    const resetProjectForm = () => {
        setProjName("");
        setProjUrl("");
        setProjDescription("");
        setProjTechnologies([]);
        setProjTechSearch("");
        setProjIsOngoing(false);
        setProjStartMonth("");
        setProjStartYear("");
        setProjEndMonth("");
        setProjEndYear("");
    };

    const saveOrUpdateProject = async () => {
        if (projName && projDescription) {
            try {
                const saved = await saveProject({
                    id: editingProjectId || undefined,
                    name: projName,
                    project_url: projUrl,
                    description: projDescription,
                    technologies: projTechnologies,
                    is_ongoing: projIsOngoing,
                    start_month: projStartMonth,
                    start_year: projStartYear,
                    end_month: projIsOngoing ? "" : projEndMonth,
                    end_year: projIsOngoing ? "" : projEndYear
                });

                if (saved) {
                    const updatedProj: Project = {
                        id: saved.id,
                        name: saved.name,
                        projectUrl: saved.project_url || "",
                        description: saved.description || "",
                        technologies: saved.technologies || [],
                        isOngoing: saved.is_ongoing,
                        startMonth: saved.start_month || "",
                        startYear: saved.start_year || "",
                        endMonth: saved.end_month || "",
                        endYear: saved.end_year || ""
                    };

                    if (editingProjectId) {
                        setProjects(projects.map(proj => proj.id === editingProjectId ? updatedProj : proj));
                    } else {
                        setProjects([...projects, updatedProj]);
                    }
                    resetProjectForm();
                    setEditingProjectId(null);
                    setIsAddProjectOpen(false);
                    await refreshCompletionStatus();
                }
            } catch (err) {
                console.error("Failed to save project", err);
            }
        }
    };

    const editProject = (proj: Project) => {
        setEditingProjectId(proj.id);
        setProjName(proj.name);
        setProjUrl(proj.projectUrl);
        setProjDescription(proj.description);
        setProjTechnologies(proj.technologies);
        setProjIsOngoing(proj.isOngoing);
        setProjStartMonth(proj.startMonth);
        setProjStartYear(proj.startYear);
        setProjEndMonth(proj.endMonth);
        setProjEndYear(proj.endYear);
        setIsAddProjectOpen(true);
    };

    const removeProject = async (id: string) => {
        setProjects(projects.filter(proj => proj.id !== id));
        try {
            await deleteProject(id);
            await refreshCompletionStatus();
        } catch (err) {
            console.error(err);
        }
    };

    const addTechToProject = (tech: string) => {
        if (!projTechnologies.includes(tech)) {
            setProjTechnologies([...projTechnologies, tech]);
        }
        setProjTechSearch("");
    };

    const removeTechFromProject = (tech: string) => {
        setProjTechnologies(projTechnologies.filter(t => t !== tech));
    };

    // Certifications state
    type Certification = {
        id: string;
        name: string;
        issuingOrganization: string;
        issueMonth: string;
        issueYear: string;
        expirationMonth: string;
        expirationYear: string;
        doesNotExpire: boolean;
        credentialId: string;
        credentialUrl: string;
    };

    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [isAddCertificationOpen, setIsAddCertificationOpen] = useState(false);
    const [isAddCertificationWithAIOpen, setIsAddCertificationWithAIOpen] = useState(false);
    const [editingCertificationId, setEditingCertificationId] = useState<string | null>(null);

    // Certification form state
    const [certName, setCertName] = useState("");
    const [certIssuingOrg, setCertIssuingOrg] = useState("");
    const [certIssueMonth, setCertIssueMonth] = useState("");
    const [certIssueYear, setCertIssueYear] = useState("");
    const [certExpirationMonth, setCertExpirationMonth] = useState("");
    const [certExpirationYear, setCertExpirationYear] = useState("");
    const [certDoesNotExpire, setCertDoesNotExpire] = useState(false);
    const [certCredentialId, setCertCredentialId] = useState("");
    const [certCredentialUrl, setCertCredentialUrl] = useState("");
    const [aiCertificationText, setAiCertificationText] = useState("");

    const resetCertificationForm = () => {
        setCertName("");
        setCertIssuingOrg("");
        setCertIssueMonth("");
        setCertIssueYear("");
        setCertExpirationMonth("");
        setCertExpirationYear("");
        setCertDoesNotExpire(false);
        setCertCredentialId("");
        setCertCredentialUrl("");
    };

    const saveOrUpdateCertification = async () => {
        if (certName && certIssuingOrg && certIssueMonth && certIssueYear) {
            try {
                const saved = await saveCertification({
                    id: editingCertificationId || undefined,
                    name: certName,
                    issuing_org: certIssuingOrg,
                    issue_month: certIssueMonth,
                    issue_year: certIssueYear,
                    expiration_month: certDoesNotExpire ? "" : certExpirationMonth,
                    expiration_year: certDoesNotExpire ? "" : certExpirationYear,
                    no_expiration: certDoesNotExpire,
                    credential_id: certCredentialId,
                    credential_url: certCredentialUrl,
                    skills: []
                });

                if (saved) {
                    const updatedCert: Certification = {
                        id: saved.id,
                        name: saved.name,
                        issuingOrganization: saved.issuing_org,
                        issueMonth: saved.issue_month,
                        issueYear: saved.issue_year,
                        expirationMonth: saved.expiration_month,
                        expirationYear: saved.expiration_year,
                        doesNotExpire: saved.no_expiration,
                        credentialId: saved.credential_id || "",
                        credentialUrl: saved.credential_url || "",
                    };

                    if (editingCertificationId) {
                        setCertifications(certifications.map(cert => cert.id === editingCertificationId ? updatedCert : cert));
                    } else {
                        setCertifications([...certifications, updatedCert]);
                    }
                    resetCertificationForm();
                    setEditingCertificationId(null);
                    setIsAddCertificationOpen(false);
                    await refreshCompletionStatus();
                }
            } catch (err) {
                console.error("Failed to save certification", err);
            }
        }
    };

    const editCertification = (cert: Certification) => {
        setEditingCertificationId(cert.id);
        setCertName(cert.name);
        setCertIssuingOrg(cert.issuingOrganization);
        setCertIssueMonth(cert.issueMonth);
        setCertIssueYear(cert.issueYear);
        setCertExpirationMonth(cert.expirationMonth);
        setCertExpirationYear(cert.expirationYear);
        setCertDoesNotExpire(cert.doesNotExpire);
        setCertCredentialId(cert.credentialId);
        setCertCredentialUrl(cert.credentialUrl);
        setIsAddCertificationOpen(true);
    };

    const removeCertification = async (id: string) => {
        setCertifications(certifications.filter(cert => cert.id !== id));
        try {
            await deleteCertification(id);
            await refreshCompletionStatus();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveBasicInfo = async () => {
        try {
            await updateProfile({
                linkedin_user: linkedinUrl,
                github_user: githubUrl,
                bio: introduction,
                location: selectedCity ? `${selectedCity}, ${selectedRegion}` : (selectedRegion || undefined)
            });
            await refreshCompletionStatus();
        } catch (err) {
            console.error("Failed to save basic info", err);
        }
    };

    // Handler for importing CV data
    const handleImportComplete = async (data: ExtractedProfile) => {
        try {
            // FIRST: Delete all existing data to prevent duplicates
            // Delete existing experiences
            for (const exp of experiences) {
                await deleteExperience(exp.id);
            }
            setExperiences([]);

            // Delete existing educations
            for (const edu of educations) {
                await deleteEducation(edu.id);
            }
            setEducations([]);

            // Delete existing projects
            for (const proj of projects) {
                await deleteProject(proj.id);
            }
            setProjects([]);

            // Delete existing certifications
            for (const cert of certifications) {
                await deleteCertification(cert.id);
            }
            setCertifications([]);

            // NOW: Import new data from CV

            // 1. Update Overview/Profile data
            if (data.overview) {
                const { bio, linkedin_user, github_user, location, full_name } = data.overview;

                if (bio) setIntroduction(bio);
                if (linkedin_user) setLinkedinUrl(linkedin_user);
                if (github_user) setGithubUrl(github_user);
                if (full_name) setUserName(full_name);

                // Save to database
                await updateProfile({
                    bio: bio || undefined,
                    linkedin_user: linkedin_user || undefined,
                    github_user: github_user || undefined,
                    full_name: full_name || undefined,
                    location: location || undefined,
                });
            }

            // 2. Update Tech Stack (replace, not append)
            if (data.tech_stack && data.tech_stack.length > 0) {
                const techIds = data.tech_stack.map(tech =>
                    tech.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
                );
                setSelectedTechs(techIds);
                await updateProfile({ tech_stack: techIds });
            }

            // 3. Update Languages (replace, not append)
            if (data.languages && data.languages.length > 0) {
                setLanguages(data.languages);
                await updateProfile({ languages: data.languages });
            }

            // 4. Save Experiences
            const newExperiences: Experience[] = [];
            if (data.experiences && data.experiences.length > 0) {
                for (const exp of data.experiences) {
                    const saved = await saveExperience({
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

                    if (saved) {
                        newExperiences.push({
                            id: saved.id,
                            title: saved.title,
                            employmentType: saved.employment_type,
                            companyName: saved.company_name,
                            companyUrl: saved.company_url || "",
                            country: saved.country || "",
                            isCurrentRole: saved.is_current,
                            startMonth: saved.start_month,
                            startYear: saved.start_year,
                            endMonth: saved.end_month,
                            endYear: saved.end_year,
                            skills: saved.skills || [],
                            description: saved.description,
                        });
                    }
                }
            }
            setExperiences(newExperiences);

            // 5. Save Education
            const newEducations: Education[] = [];
            if (data.educations && data.educations.length > 0) {
                for (const edu of data.educations) {
                    const saved = await saveEducation({
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

                    if (saved) {
                        newEducations.push({
                            id: saved.id,
                            school: saved.school,
                            schoolUrl: saved.school_url || "",
                            degree: saved.degree || "",
                            fieldOfStudy: saved.field_of_study || "",
                            grade: saved.grade || "",
                            activities: saved.activities || "",
                            description: saved.description || "",
                            isCurrentlyStudying: saved.is_current,
                            startYear: saved.start_year,
                            endYear: saved.end_year,
                        });
                    }
                }
            }
            setEducations(newEducations);

            // 6. Save Projects
            const newProjects: Project[] = [];
            if (data.projects && data.projects.length > 0) {
                for (const proj of data.projects) {
                    const saved = await saveProject({
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

                    if (saved) {
                        newProjects.push({
                            id: saved.id,
                            name: saved.name,
                            projectUrl: saved.project_url || "",
                            description: saved.description || "",
                            technologies: saved.technologies || [],
                            isOngoing: saved.is_ongoing,
                            startMonth: saved.start_month || "",
                            startYear: saved.start_year || "",
                            endMonth: saved.end_month || "",
                            endYear: saved.end_year || ""
                        });
                    }
                }
            }
            setProjects(newProjects);

            // 7. Save Certifications
            const newCertifications: Certification[] = [];
            if (data.certifications && data.certifications.length > 0) {
                for (const cert of data.certifications) {
                    const saved = await saveCertification({
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

                    if (saved) {
                        newCertifications.push({
                            id: saved.id,
                            name: saved.name,
                            issuingOrganization: saved.issuing_org,
                            issueMonth: saved.issue_month,
                            issueYear: saved.issue_year,
                            expirationMonth: saved.expiration_month,
                            expirationYear: saved.expiration_year,
                            doesNotExpire: saved.no_expiration,
                            credentialId: saved.credential_id || "",
                            credentialUrl: saved.credential_url || "",
                        });
                    }
                }
            }
            setCertifications(newCertifications);

            // Refresh completion status after all imports
            await refreshCompletionStatus();

        } catch (error) {
            console.error("Error importing CV data:", error);
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex flex-col h-full w-full bg-background animate-in fade-in duration-300">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between px-8 py-6 border-b">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-9 w-32" />
                </div>

                {/* Content Skeleton area */}
                <div className="flex-1 overflow-auto px-8 py-6">
                    {/* Tabs Skeleton */}
                    <div className="flex gap-8 mb-8 border-b pb-0">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="pb-3">
                                <Skeleton className="h-6 w-24" />
                            </div>
                        ))}
                    </div>

                    {/* Overview Form Skeleton */}
                    <div className="space-y-12 max-w-4xl py-4">
                        {/* Photo Section */}
                        <div className="flex items-start justify-between gap-12 pb-8 border-b border-border/50">
                            <div className="space-y-3 max-w-xs">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                            <div className="flex items-center gap-8 flex-1">
                                <Skeleton className="size-24 rounded-full" />
                                <Skeleton className="h-32 flex-1 rounded-xl border border-dashed border-gray-200" />
                            </div>
                        </div>

                        {/* Form Fields */}
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="grid grid-cols-[200px_1fr] gap-12 items-start py-6 border-b border-border/50">
                                <div className="space-y-3">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-56 opacity-60" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-11 w-full max-w-md rounded-lg" />
                                    {i === 2 && <Skeleton className="h-11 w-full max-w-md rounded-lg" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

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
                    <Button
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-600 transition-colors"
                    >
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
                                                onBlur={handleSaveBasicInfo}
                                                placeholder="john-doe-dev"
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
                                                onBlur={handleSaveBasicInfo}
                                                placeholder="johndoe"
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
                                        onBlur={handleSaveBasicInfo}
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


                        {experiences.length === 0 ? (
                            /* Empty State */
                            <div className="border rounded-xl p-12 text-center">
                                <div className="inline-flex items-center justify-center size-14 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
                                    <Wand2 className="size-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-semibold mb-2">You haven&apos;t added your work experience yet</h4>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                    Adding experience helps us match you with the right opportunities.
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
                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => editExperience(exp)}
                                                className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                            >
                                                <Pencil className="size-4 text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => removeExperience(exp.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                                            >
                                                <Trash2 className="size-4 text-red-500" />
                                            </button>
                                        </div>
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

                    <TabsContent value="projects" className="space-y-6">


                        {/* Empty State */}
                        {projects.length === 0 ? (
                            <div className="border rounded-xl p-12 text-center">
                                <div className="inline-flex items-center justify-center size-14 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
                                    <FolderKanban className="size-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-semibold mb-2">You haven&apos;t added any projects yet</h4>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                    Adding projects will help showcase your skills and experience.
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddProjectWithAIOpen(true)}
                                    >
                                        Add with AI
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => setIsAddProjectOpen(true)}
                                    >
                                        <Plus className="size-4 mr-1" />
                                        Add project
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Projects List */}
                                {projects.map((proj) => (
                                    <div key={proj.id} className="rounded-xl border bg-card p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                    <FolderKanban className="size-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-base">{proj.name}</h4>
                                                    {proj.projectUrl && (
                                                        <a href={proj.projectUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                                            View project <ExternalLink className="size-3" />
                                                        </a>
                                                    )}
                                                    {proj.startYear && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {proj.startMonth} {proj.startYear} - {proj.isOngoing ? "Present" : `${proj.endMonth} ${proj.endYear}`}
                                                        </p>
                                                    )}
                                                    {proj.technologies.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {proj.technologies.map((tech) => (
                                                                <span key={tech} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-md">
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {proj.description && (
                                                        <p className="text-sm mt-2">{proj.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-blue-600"
                                                    onClick={() => editProject(proj)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-red-600"
                                                    onClick={() => removeProject(proj.id)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add More Buttons */}
                                <div className="flex items-center gap-3 pt-4">
                                    <Button variant="outline" onClick={() => setIsAddProjectWithAIOpen(true)}>
                                        Add with AI
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddProjectOpen(true)}>
                                        <Plus className="size-4 mr-1" />
                                        Add project
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="education" className="space-y-6">


                        {/* Empty State */}
                        {educations.length === 0 ? (
                            <div className="border rounded-xl p-12 text-center">
                                <div className="inline-flex items-center justify-center size-14 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
                                    <GraduationCap className="size-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-semibold mb-2">You haven&apos;t added your education yet</h4>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                    Adding education will help you attract the right opportunities.
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddEducationWithAIOpen(true)}
                                    >
                                        Add with AI
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => setIsAddEducationOpen(true)}
                                    >
                                        <Plus className="size-4 mr-1" />
                                        Add education
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Education List */}
                                {educations.map((edu) => (
                                    <div key={edu.id} className="rounded-xl border bg-card p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                    <GraduationCap className="size-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-base">{edu.school}</h4>
                                                    {edu.degree && edu.fieldOfStudy && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {edu.degree} in {edu.fieldOfStudy}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {edu.startYear} - {edu.isCurrentlyStudying ? "Present" : edu.endYear}
                                                    </p>
                                                    {edu.grade && (
                                                        <p className="text-sm text-muted-foreground">Grade: {edu.grade}</p>
                                                    )}
                                                    {edu.description && (
                                                        <p className="text-sm mt-2">{edu.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-blue-600"
                                                    onClick={() => editEducation(edu)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-red-600"
                                                    onClick={() => removeEducation(edu.id)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add More Buttons */}
                                <div className="flex items-center gap-3 pt-4">
                                    <Button variant="outline" onClick={() => setIsAddEducationWithAIOpen(true)}>
                                        Add with AI
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={() => setIsAddEducationOpen(true)}>
                                        <Plus className="size-4" />
                                        Add education
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="certifications" className="space-y-6">


                        {/* Empty State */}
                        {certifications.length === 0 ? (
                            <div className="border rounded-xl p-12 text-center">
                                <div className="inline-flex items-center justify-center size-14 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
                                    <Award className="size-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-semibold mb-2">You haven&apos;t added any certifications yet</h4>
                                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                    Adding certifications will help validate your skills and expertise.
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddCertificationWithAIOpen(true)}
                                    >
                                        Add with AI
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => setIsAddCertificationOpen(true)}
                                    >
                                        <Plus className="size-4 mr-1" />
                                        Add certification
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Certifications List */}
                                {certifications.map((cert) => (
                                    <div key={cert.id} className="rounded-xl border bg-card p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                    <Award className="size-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-base">{cert.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{cert.issuingOrganization}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Issued {cert.issueMonth} {cert.issueYear}
                                                        {!cert.doesNotExpire && cert.expirationMonth && cert.expirationYear && (
                                                            <> · Expires {cert.expirationMonth} {cert.expirationYear}</>
                                                        )}
                                                        {cert.doesNotExpire && " · No expiration"}
                                                    </p>
                                                    {cert.credentialId && (
                                                        <p className="text-xs text-muted-foreground mt-1">Credential ID: {cert.credentialId}</p>
                                                    )}
                                                    {cert.credentialUrl && (
                                                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                            View credential <ExternalLink className="size-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-blue-600"
                                                    onClick={() => editCertification(cert)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-red-600"
                                                    onClick={() => removeCertification(cert.id)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add More Buttons */}
                                <div className="flex items-center gap-3 pt-4">
                                    <Button variant="outline" onClick={() => setIsAddCertificationWithAIOpen(true)}>
                                        Add with AI
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddCertificationOpen(true)}>
                                        <Plus className="size-4 mr-1" />
                                        Add certification
                                    </Button>
                                </div>
                            </div>
                        )}
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
                            className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                            onClick={(e) => e.target === e.currentTarget && setIsAddWithAIOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl border-2 border-blue-400 dark:border-blue-500 flex flex-col max-h-[75vh]"
                            >
                                {/* Header */}
                                <div className="p-6 pb-4">
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
                            className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                            onClick={(e) => e.target === e.currentTarget && setIsAddExperienceOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl border-2 border-blue-400 dark:border-blue-500 flex flex-col max-h-[75vh]"
                            >
                                {/* Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Flag className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{editingExperienceId ? 'Edit experience' : 'Add experience'}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Share a role and achievements on your profile.
                                            </p>
                                        </div>
                                        <button onClick={() => { resetExperienceForm(); setEditingExperienceId(null); setIsAddExperienceOpen(false); }} className="p-1 hover:bg-muted rounded-md">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable Form */}
                                <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-5">
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
                                                placeholder="e.g. Google"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Company URL */}
                                    <div>
                                        <label className="text-sm font-medium">Company website</label>
                                        <div className="relative mt-2">
                                            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input
                                                value={expCompanyUrl}
                                                onChange={(e) => setExpCompanyUrl(e.target.value)}
                                                placeholder="e.g. https://www.google.com"
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

                                    {/* Start Date & End Date - Same Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Start date*</label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Select value={expStartMonth} onValueChange={setExpStartMonth}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Month" /></SelectTrigger>
                                                    <SelectContent>{months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                                                </Select>
                                                <Select value={expStartYear} onValueChange={setExpStartYear}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Year" /></SelectTrigger>
                                                    <SelectContent>{years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">End date*</label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Select value={expIsCurrentRole ? "Present" : expEndMonth} onValueChange={(val) => { if (val === "Present") { setExpIsCurrentRole(true); setExpEndMonth(""); setExpEndYear(""); } else { setExpIsCurrentRole(false); setExpEndMonth(val); } }}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Month" /></SelectTrigger>
                                                    <SelectContent><SelectItem value="Present">Present</SelectItem>{months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                                                </Select>
                                                <Select value={expEndYear} onValueChange={setExpEndYear} disabled={expIsCurrentRole}>
                                                    <SelectTrigger className={cn("w-full", expIsCurrentRole && "opacity-50")}><SelectValue placeholder="Year" /></SelectTrigger>
                                                    <SelectContent>{years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent>
                                                </Select>
                                            </div>
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
                                    <Button variant="outline" onClick={() => { resetExperienceForm(); setEditingExperienceId(null); setIsAddExperienceOpen(false); }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={saveOrUpdateExperience}
                                        disabled={!expTitle || !expEmploymentType || !expCompanyName || !expStartMonth || !expStartYear || !expDescription}
                                    >
                                        {editingExperienceId ? 'Save changes' : 'Add experience'}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Education Modals */}
                {/* Add Education with AI Modal */}
                <AnimatePresence>
                    {isAddEducationWithAIOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                            onClick={(e) => e.target === e.currentTarget && setIsAddEducationWithAIOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl border-2 border-blue-400 dark:border-blue-500 flex flex-col max-h-[75vh]"
                            >
                                {/* Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Sparkles className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">Add education with AI</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Paste in the relevant section from your resume or LinkedIn and let our AI extract your education for you.
                                            </p>
                                        </div>
                                        <button onClick={() => setIsAddEducationWithAIOpen(false)} className="p-1 hover:bg-muted rounded-md">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div>
                                        <label className="text-sm font-medium">Education*</label>
                                        <Textarea
                                            value={aiEducationText}
                                            onChange={(e) => setAiEducationText(e.target.value)}
                                            placeholder="Paste in the education section from your resume or LinkedIn here..."
                                            className="mt-2 min-h-[120px] resize-none"
                                            maxLength={16000}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {(16000 - aiEducationText.length).toLocaleString()} characters left
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30 rounded-b-xl flex items-center justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsAddEducationWithAIOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={!aiEducationText.trim()}
                                    >
                                        Add with AI
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Education Modal */}
                <AnimatePresence>
                    {isAddEducationOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                            onClick={(e) => e.target === e.currentTarget && setIsAddEducationOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl border-2 border-blue-400 dark:border-blue-500 flex flex-col max-h-[75vh]"
                            >
                                {/* Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Flag className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{editingEducationId ? 'Edit education' : 'Add education'}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Share your educational background and academic achievements.
                                            </p>
                                        </div>
                                        <button onClick={() => { resetEducationForm(); setEditingEducationId(null); setIsAddEducationOpen(false); }} className="p-1 hover:bg-muted rounded-md">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable Form */}
                                <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-5">
                                    {/* School */}
                                    <div>
                                        <label className="text-sm font-medium">School*</label>
                                        <Input
                                            value={eduSchool}
                                            onChange={(e) => setEduSchool(e.target.value.slice(0, 80))}
                                            placeholder="Ex: Harvard University"
                                            className="mt-2"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">80 characters</p>
                                    </div>

                                    {/* School URL */}
                                    <div>
                                        <label className="text-sm font-medium">School URL*</label>
                                        <Input
                                            value={eduSchoolUrl}
                                            onChange={(e) => setEduSchoolUrl(e.target.value)}
                                            placeholder="Ex: https://www.harvard.edu"
                                            className="mt-2"
                                        />
                                    </div>

                                    {/* Degree */}
                                    <div>
                                        <label className="text-sm font-medium">Degree</label>
                                        <Input
                                            value={eduDegree}
                                            onChange={(e) => setEduDegree(e.target.value)}
                                            placeholder="Ex: Bachelor of Arts"
                                            className="mt-2"
                                        />
                                    </div>

                                    {/* Field of Study */}
                                    <div>
                                        <label className="text-sm font-medium">Field of study</label>
                                        <Input
                                            value={eduFieldOfStudy}
                                            onChange={(e) => setEduFieldOfStudy(e.target.value)}
                                            placeholder="Ex: Computer Science"
                                            className="mt-2"
                                        />
                                    </div>

                                    {/* Grade */}
                                    <div>
                                        <label className="text-sm font-medium">Grade</label>
                                        <Input
                                            value={eduGrade}
                                            onChange={(e) => setEduGrade(e.target.value)}
                                            placeholder="Ex: 3.8"
                                            className="mt-2"
                                        />
                                    </div>

                                    {/* Activities */}
                                    <div>
                                        <label className="text-sm font-medium">Activities</label>
                                        <Textarea
                                            value={eduActivities}
                                            onChange={(e) => setEduActivities(e.target.value.slice(0, 400))}
                                            placeholder="Ex: Student Government, Debate Club"
                                            className="mt-2 min-h-[80px] resize-none"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">400 characters</p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            value={eduDescription}
                                            onChange={(e) => setEduDescription(e.target.value.slice(0, 400))}
                                            placeholder="e.g. Graduated with honors, specialized in Machine Learning and AI. Led research projects in Natural Language Processing."
                                            className="mt-2 min-h-[100px] resize-none"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">400 characters</p>
                                    </div>

                                    {/* Currently Studying Checkbox */}
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="currentlyStudying"
                                            checked={eduIsCurrentlyStudying}
                                            onCheckedChange={(checked) => {
                                                setEduIsCurrentlyStudying(checked as boolean);
                                                if (checked) {
                                                    setEduEndYear("");
                                                }
                                            }}
                                        />
                                        <label htmlFor="currentlyStudying" className="text-sm cursor-pointer">
                                            I am currently studying at this institution
                                        </label>
                                    </div>

                                    {/* Start Year & End Year */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Start year*</label>
                                            <Select value={eduStartYear} onValueChange={setEduStartYear}>
                                                <SelectTrigger className="mt-2 w-full">
                                                    <SelectValue placeholder="YYYY" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((y) => (
                                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">End year</label>
                                            <Select
                                                value={eduIsCurrentlyStudying ? "Present" : eduEndYear}
                                                onValueChange={(val) => {
                                                    if (val === "Present") {
                                                        setEduIsCurrentlyStudying(true);
                                                        setEduEndYear("");
                                                    } else {
                                                        setEduIsCurrentlyStudying(false);
                                                        setEduEndYear(val);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="mt-2 w-full">
                                                    <SelectValue placeholder="YYYY" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Present">Present</SelectItem>
                                                    {years.map((y) => (
                                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30 rounded-b-xl flex items-center justify-end gap-3">
                                    <Button variant="outline" onClick={() => { resetEducationForm(); setEditingEducationId(null); setIsAddEducationOpen(false); }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={saveOrUpdateEducation}
                                        disabled={!eduSchool || !eduSchoolUrl || !eduStartYear}
                                    >
                                        {editingEducationId ? 'Save changes' : 'Add education'}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Projects Modals */}
                {/* Add Project with AI Modal */}
                <AnimatePresence>
                    {isAddProjectWithAIOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                            onClick={(e) => e.target === e.currentTarget && setIsAddProjectWithAIOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl border-2 border-blue-400 dark:border-blue-500 flex flex-col max-h-[75vh]"
                            >
                                <div className="p-6 pb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Sparkles className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">Add project with AI</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Paste in details about your project and let our AI extract the information for you.
                                            </p>
                                        </div>
                                        <button onClick={() => setIsAddProjectWithAIOpen(false)} className="p-1 hover:bg-muted rounded-md">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div>
                                        <label className="text-sm font-medium">Project details*</label>
                                        <Textarea
                                            value={aiProjectText}
                                            onChange={(e) => setAiProjectText(e.target.value)}
                                            placeholder="Paste project details here..."
                                            className="mt-2 min-h-[120px] resize-none"
                                            maxLength={16000}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">{(16000 - aiProjectText.length).toLocaleString()} characters left</p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30 rounded-b-xl flex items-center justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsAddProjectWithAIOpen(false)}>Cancel</Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!aiProjectText.trim()}>Add with AI</Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Project Modal */}
                <AnimatePresence>
                    {isAddProjectOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                            onClick={(e) => e.target === e.currentTarget && setIsAddProjectOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl border-2 border-blue-400 dark:border-blue-500 flex flex-col max-h-[75vh]"
                            >
                                <div className="p-6 pb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <FolderKanban className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{editingProjectId ? 'Edit project' : 'Add project'}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Showcase your work and side projects.</p>
                                        </div>
                                        <button onClick={() => { resetProjectForm(); setEditingProjectId(null); setIsAddProjectOpen(false); }} className="p-1 hover:bg-muted rounded-md">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-5">
                                    <div>
                                        <label className="text-sm font-medium">Project name*</label>
                                        <Input value={projName} onChange={(e) => setProjName(e.target.value.slice(0, 80))} placeholder="Ex: E-commerce Platform" className="mt-2" />
                                        <p className="text-xs text-muted-foreground mt-1">80 characters</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Project URL</label>
                                        <Input value={projUrl} onChange={(e) => setProjUrl(e.target.value)} placeholder="Ex: https://github.com/user/project" className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description*</label>
                                        <Textarea value={projDescription} onChange={(e) => setProjDescription(e.target.value.slice(0, 500))} placeholder="Describe your project, its purpose, and your role..." className="mt-2 min-h-[100px] resize-none" />
                                        <p className="text-xs text-muted-foreground mt-1">500 characters</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Technologies</label>
                                        {projTechnologies.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                                                {projTechnologies.map((tech) => (
                                                    <span key={tech} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                                                        {tech}
                                                        <button onClick={() => removeTechFromProject(tech)} className="hover:text-red-600"><Minus className="size-3" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="relative mt-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input value={projTechSearch} onChange={(e) => setProjTechSearch(e.target.value)} placeholder="Search technologies..." className="pl-10" />
                                        </div>
                                        {projTechSearch && (
                                            <div className="mt-2 border rounded-lg max-h-32 overflow-y-auto">
                                                {allTechs.filter(t => t.name.toLowerCase().includes(projTechSearch.toLowerCase()) && !projTechnologies.includes(t.name)).slice(0, 5).map((tech) => (
                                                    <button key={tech.name} onClick={() => addTechToProject(tech.name)} className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                                                        <Plus className="size-3" /> {tech.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Start date</label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Select value={projStartMonth} onValueChange={setProjStartMonth}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Month" /></SelectTrigger>
                                                    <SelectContent>{months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                                                </Select>
                                                <Select value={projStartYear} onValueChange={setProjStartYear}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Year" /></SelectTrigger>
                                                    <SelectContent>{years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">End date</label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Select value={projIsOngoing ? "Present" : projEndMonth} onValueChange={(val) => { if (val === "Present") { setProjIsOngoing(true); setProjEndMonth(""); setProjEndYear(""); } else { setProjIsOngoing(false); setProjEndMonth(val); } }}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Month" /></SelectTrigger>
                                                    <SelectContent><SelectItem value="Present">Present</SelectItem>{months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                                                </Select>
                                                <Select value={projEndYear} onValueChange={setProjEndYear} disabled={projIsOngoing}>
                                                    <SelectTrigger className={cn("w-full", projIsOngoing && "opacity-50")}><SelectValue placeholder="Year" /></SelectTrigger>
                                                    <SelectContent>{years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="ongoingProject" checked={projIsOngoing} onCheckedChange={(checked) => { setProjIsOngoing(checked as boolean); if (checked) { setProjEndMonth(""); setProjEndYear(""); } }} />
                                        <label htmlFor="ongoingProject" className="text-sm cursor-pointer">This is an ongoing project</label>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30 rounded-b-xl flex items-center justify-end gap-3">
                                    <Button variant="outline" onClick={() => { resetProjectForm(); setEditingProjectId(null); setIsAddProjectOpen(false); }}>Cancel</Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={saveOrUpdateProject} disabled={!projName || !projDescription}>{editingProjectId ? 'Save changes' : 'Add project'}</Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Certifications Modals */}
                {/* Add Certification with AI Modal */}
                <AnimatePresence>
                    {isAddCertificationWithAIOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                            onClick={(e) => e.target === e.currentTarget && setIsAddCertificationWithAIOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl border-2 border-blue-400 dark:border-blue-500 flex flex-col max-h-[75vh]"
                            >
                                <div className="p-6 pb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Sparkles className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">Add certification with AI</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Paste certification details and let our AI extract the information.</p>
                                        </div>
                                        <button onClick={() => setIsAddCertificationWithAIOpen(false)} className="p-1 hover:bg-muted rounded-md">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div>
                                        <label className="text-sm font-medium">Certification details*</label>
                                        <Textarea value={aiCertificationText} onChange={(e) => setAiCertificationText(e.target.value)} placeholder="Paste certification details here..." className="mt-2 min-h-[120px] resize-none" maxLength={16000} />
                                        <p className="text-xs text-muted-foreground mt-1">{(16000 - aiCertificationText.length).toLocaleString()} characters left</p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30 rounded-b-xl flex items-center justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsAddCertificationWithAIOpen(false)}>Cancel</Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!aiCertificationText.trim()}>Add with AI</Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Certification Modal */}
                <AnimatePresence>
                    {isAddCertificationOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-md p-4 left-0 md:left-[var(--sidebar-width)] transition-[left] duration-200"
                            onClick={(e) => e.target === e.currentTarget && setIsAddCertificationOpen(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl border-2 border-blue-400 dark:border-blue-500 flex flex-col max-h-[75vh]"
                            >
                                <div className="p-6 pb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Award className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{editingCertificationId ? 'Edit certification' : 'Add certification'}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Add your professional certifications and credentials.</p>
                                        </div>
                                        <button onClick={() => { resetCertificationForm(); setEditingCertificationId(null); setIsAddCertificationOpen(false); }} className="p-1 hover:bg-muted rounded-md">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-5">
                                    <div>
                                        <label className="text-sm font-medium">Certification name*</label>
                                        <Input value={certName} onChange={(e) => setCertName(e.target.value.slice(0, 100))} placeholder="Ex: AWS Solutions Architect" className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Issuing organization*</label>
                                        <Input value={certIssuingOrg} onChange={(e) => setCertIssuingOrg(e.target.value)} placeholder="Ex: Amazon Web Services" className="mt-2" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Issue date*</label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Select value={certIssueMonth} onValueChange={setCertIssueMonth}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Month" /></SelectTrigger>
                                                    <SelectContent>{months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                                                </Select>
                                                <Select value={certIssueYear} onValueChange={setCertIssueYear}>
                                                    <SelectTrigger className="w-full"><SelectValue placeholder="Year" /></SelectTrigger>
                                                    <SelectContent>{years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Expiration date</label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Select value={certDoesNotExpire ? "" : certExpirationMonth} onValueChange={setCertExpirationMonth} disabled={certDoesNotExpire}>
                                                    <SelectTrigger className={cn("w-full", certDoesNotExpire && "opacity-50")}><SelectValue placeholder="Month" /></SelectTrigger>
                                                    <SelectContent>{months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                                                </Select>
                                                <Select value={certDoesNotExpire ? "" : certExpirationYear} onValueChange={setCertExpirationYear} disabled={certDoesNotExpire}>
                                                    <SelectTrigger className={cn("w-full", certDoesNotExpire && "opacity-50")}><SelectValue placeholder="Year" /></SelectTrigger>
                                                    <SelectContent>{years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="noExpiration" checked={certDoesNotExpire} onCheckedChange={(checked) => { setCertDoesNotExpire(checked as boolean); if (checked) { setCertExpirationMonth(""); setCertExpirationYear(""); } }} />
                                        <label htmlFor="noExpiration" className="text-sm cursor-pointer">This credential does not expire</label>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Credential ID</label>
                                        <Input value={certCredentialId} onChange={(e) => setCertCredentialId(e.target.value)} placeholder="Ex: ABC123XYZ" className="mt-2" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Credential URL</label>
                                        <Input value={certCredentialUrl} onChange={(e) => setCertCredentialUrl(e.target.value)} placeholder="Ex: https://verify.credential.com/..." className="mt-2" />
                                    </div>
                                </div>
                                <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30 rounded-b-xl flex items-center justify-end gap-3">
                                    <Button variant="outline" onClick={() => { resetCertificationForm(); setEditingCertificationId(null); setIsAddCertificationOpen(false); }}>Cancel</Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={saveOrUpdateCertification} disabled={!certName || !certIssuingOrg || !certIssueMonth || !certIssueYear}>{editingCertificationId ? 'Save changes' : 'Add certification'}</Button>
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
                    overlayClassName="bg-white/20 dark:bg-black/20 backdrop-blur-md left-0 md:left-[16rem] transition-[left] duration-300"
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

            {/* Import Resume Modal */}
            <ImportResumeModal
                open={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportComplete={handleImportComplete}
            />
        </div >
    );
}
