'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Sparkles, Target, Plus, ArrowDown, Globe, Building2, CheckCircle2 } from 'lucide-react';
import { searchJobs, type Job } from '@/app/actions/search-jobs';
import { getUserCvCriteria } from '@/app/actions/get-user-cv-criteria';
import { CompanyLogo } from "@/components/company-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";


export default function JobSearchPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [isRemote, setIsRemote] = useState(false);
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
    const [searched, setSearched] = useState(false);
    const [analyzingCv, setAnalyzingCv] = useState(false);
    const [page, setPage] = useState(1);
    const [visibleCount, setVisibleCount] = useState(12);
    const [searchQueries, setSearchQueries] = useState<string[]>([]);
    const [nextQueryIndex, setNextQueryIndex] = useState(0);
    const [error, setError] = useState<'rate_limit' | 'general' | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/auth/signin");
        }
    }, [status, router]);

    // Filter remote
    useEffect(() => {
        if (isRemote) {
            setDisplayedJobs(jobs.filter(job => job.job_is_remote));
        } else {
            setDisplayedJobs(jobs);
        }
    }, [jobs, isRemote]);

    // Handlers
    const handleAnalyzeCV = async () => {
        setAnalyzingCv(true);
        setLoading(true);
        try {
            const criteria = await getUserCvCriteria();

            if (!criteria) {
                alert("⚠️ No encontramos tu CV. Por favor ve al 'ATS Scanner' y sube tu CV más reciente.");
                setLoading(false);
                setAnalyzingCv(false);
                return;
            }

            const queries = criteria.search_queries || [];
            const mainQuery = queries[0] || criteria.role;
            const newLocation = criteria.location || '';

            let displayQuery = mainQuery;
            if (newLocation) {
                const fullSuffix = ` in ${newLocation}`;
                const city = newLocation.split(',')[0].trim();
                const citySuffix = ` in ${city}`;

                if (displayQuery.toLowerCase().endsWith(fullSuffix.toLowerCase())) {
                    displayQuery = displayQuery.slice(0, -fullSuffix.length).trim();
                } else if (city && displayQuery.toLowerCase().endsWith(citySuffix.toLowerCase())) {
                    displayQuery = displayQuery.slice(0, -citySuffix.length).trim();
                }
            }

            setQuery(displayQuery);
            setLocation(newLocation);

            await setAllQueriesAndRunFirstBatch(queries, mainQuery, newLocation);
            await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error: any) {
            console.error("Error analyzing CV:", error);
            if (error?.message === 'RATE_LIMIT_EXCEEDED') {
                setError('rate_limit');
            } else {
                setError('general');
            }
        } finally {
            setAnalyzingCv(false);
            setLoading(false);
        }
    };

    const setAllQueriesAndRunFirstBatch = async (queries: string[], mainQuery: string, locationVal: string) => {
        setSearchQueries(queries);
        const queriesToRun = queries.slice(0, 2);
        if (queriesToRun.length === 0) queriesToRun.push(mainQuery);
        setNextQueryIndex(2);
        setPage(1);
        setVisibleCount(12);

        const count = await runBatchSearch(queriesToRun, locationVal, true, 1);

        if (count < 12 && queries.length > 2) {
            const nextBatch = queries.slice(2, 4);
            setNextQueryIndex(4);
            await runBatchSearch(nextBatch, locationVal, false, 1);
        }
    };

    const runBatchSearch = async (queriesToRun: string[], locationVal: string, resetJobs: boolean, pageNum: number = 1): Promise<number> => {
        try {
            setError(null);
            const searchPromises = queriesToRun.map(q => {
                let finalQ = q;
                const locTrimmed = locationVal.trim();

                if (locTrimmed) {
                    const qLower = q.toLowerCase();
                    const city = locTrimmed.split(',')[0].trim().toLowerCase();

                    const hasLocation = qLower.includes(city) ||
                        qLower.includes(' in ') ||
                        qLower.includes(locTrimmed.toLowerCase());

                    if (!hasLocation) {
                        finalQ = `${q} in ${city}`;
                    }
                }

                console.log(`[runBatchSearch] Final query: "${finalQ}"`);

                return searchJobs(finalQ, {
                    remote_jobs_only: false,
                    date_posted: 'month',
                    num_pages: 2,
                    page: pageNum
                });
            });

            const resultsArray = await Promise.all(searchPromises);
            const allNewJobs = resultsArray.flat();

            // Deduplicate by job_id
            const uniqueNewJobs = allNewJobs.filter((job, index, self) =>
                index === self.findIndex((j) => (
                    j.job_id === job.job_id
                ))
            );

            if (resetJobs) {
                setJobs(uniqueNewJobs);
                setDisplayedJobs(uniqueNewJobs);
                setSearched(true);
            } else {
                setJobs(prev => [...prev, ...uniqueNewJobs]);
                setDisplayedJobs(prev => [...prev, ...uniqueNewJobs]);
            }

            return uniqueNewJobs.length;
        } catch (err: any) {
            if (err?.message === 'RATE_LIMIT_EXCEEDED') {
                setError('rate_limit');
            }
            throw err;
        }
    };

    const handleSearch = async (overrideQuery?: string, overrideRemote?: boolean, overrideLocation?: string) => {
        const q = overrideQuery || query;
        const loc = overrideLocation !== undefined ? overrideLocation : location;

        if (!q.trim()) return;

        setLoading(true);
        setSearched(true);

        try {
            setSearchQueries([q]);
            setNextQueryIndex(1);
            setPage(1);
            setVisibleCount(12);
            await runBatchSearch([q], loc, true, 1);
        } catch (error: any) {
            console.error("Search failed", error);
            if (error?.message === 'RATE_LIMIT_EXCEEDED') {
                setError('rate_limit');
            } else {
                setError('general');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (loading || loadingMore) return;
        const remainingHidden = displayedJobs.length - visibleCount;

        if (remainingHidden >= 12) {
            setVisibleCount(prev => prev + 12);
            return;
        }

        setLoadingMore(true);

        try {
            let count = 0;
            if (nextQueryIndex < searchQueries.length) {
                const nextBatch = searchQueries.slice(nextQueryIndex, nextQueryIndex + 2);
                setNextQueryIndex(prev => prev + 2);
                count = await runBatchSearch(nextBatch, location, false, 1);
            } else {
                const nextPage = page + 1;
                setPage(nextPage);
                count = await runBatchSearch([query], location, false, nextPage);
            }

            if (count > 0 || remainingHidden > 0) {
                setVisibleCount(prev => prev + 12);
            } else {
                alert("No more jobs found.");
            }
        } catch (error) {
            console.error("Load more failed", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Auto-search on mount if params exist
    const initRef = React.useRef(false);
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const q = searchParams.get('q');
        const l = searchParams.get('l');
        const remote = searchParams.get('remote');
        const trigger = searchParams.get('trigger');

        if (q) setQuery(q);
        if (l) setLocation(l);
        if (remote === 'true') setIsRemote(true);

        const performAction = async () => {
            if (trigger === 'analyze') {
                await handleAnalyzeCV();
            } else if (q) {
                await handleSearch(q, remote === 'true', l || '');
            }
        };

        performAction();
    }, [searchParams]);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-white">
                        <Target className="w-6 h-6 text-blue-600" />
                        Job Search
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Find opportunities tailored to your profile
                    </p>
                </div>

                <Button
                    onClick={handleAnalyzeCV}
                    disabled={loading || analyzingCv}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {analyzingCv ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Analyzing CV...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Auto-Match with AI
                        </div>
                    )}
                </Button>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-4 md:p-6 grid gap-4 md:grid-cols-12 items-end">
                    <div className="md:col-span-5 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Job title, keywords, or company"
                                className="pl-9 h-12 text-base"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-4 space-y-2">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="City, state, or zip code"
                                className="pl-9 h-12 text-base"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-3 flex gap-2">
                        <Button
                            variant={isRemote ? "default" : "outline"}
                            onClick={() => setIsRemote(!isRemote)}
                            className={`flex-1 h-12 text-base ${isRemote ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                        >
                            <Globe className="w-4 h-4 mr-2" />
                            Remote
                        </Button>
                        <Button onClick={() => handleSearch()} disabled={loading} className="flex-1 h-12 text-base font-bold">
                            {loading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                "Search"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results Area */}
            <div className="space-y-6">

                {loading && !searched && (
                    <div className="flex justify-center py-20">
                        <Empty className="w-full max-w-md bg-white dark:bg-slate-900/50 border rounded-xl shadow-sm">
                            <EmptyHeader>
                                <EmptyMedia variant="icon" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                    <Spinner className="h-5 w-5" />
                                </EmptyMedia>
                                <EmptyTitle>Searching for jobs...</EmptyTitle>
                                <EmptyDescription>
                                    We are scanning multiple platforms to find the best matches for you.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                )}

                {error === 'rate_limit' && (
                    <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <Sparkles className="h-12 w-12 text-amber-500 mb-4" />
                            <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">AI is taking a break</h3>
                            <p className="text-amber-700 dark:text-amber-300 mt-2 max-w-md">
                                We've hit the search limit. Please wait a few minutes before trying again.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {searched && displayedJobs.length === 0 && !loading && !error && (
                    <div className="flex justify-center py-12">
                        <Empty className="w-full max-w-md bg-white dark:bg-slate-900/50 border rounded-xl shadow-sm">
                            <EmptyHeader>
                                <EmptyMedia variant="icon" className="bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    <Briefcase className="h-5 w-5" />
                                </EmptyMedia>
                                <EmptyTitle>No jobs found</EmptyTitle>
                                <EmptyDescription>
                                    Try adjusting your search terms or location.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                )}

                {displayedJobs.length > 0 && (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {displayedJobs.length} Jobs Found
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedJobs.slice(0, visibleCount).map((job, index) => (
                                <JobCard key={job.job_id} job={job} index={index} />
                            ))}
                        </div>

                        {visibleCount < displayedJobs.length && (
                            <div className="flex justify-center py-8">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="min-w-[150px]"
                                >
                                    {loadingMore ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                                    ) : (
                                        <>
                                            Load More
                                            <ArrowDown className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function JobCard({ job, index }: { job: Job; index: number }) {
    const providerInfo = getProviderInfo(job.job_publisher);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 group relative overflow-hidden dark:bg-slate-900/50">
                <div className="absolute top-0 right-0 p-4 z-10">
                    {providerInfo.badge}
                </div>

                <CardContent className="p-6 flex-grow">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="shrink-0">
                            <CompanyLogo
                                company={job.employer_name}
                                logo={job.employer_logo || undefined}
                                size="md" // Assuming 'md' is valid, otherwise I'll check CompanyLogo props
                            />
                        </div>
                        <div className="min-w-0 flex-1 pr-8">
                            <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                {job.job_title}
                            </h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                {job.employer_name}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="truncate">
                                {job.job_city ? `${job.job_city}, ${job.job_country}` : "Location not specified"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 shrink-0" />
                            <span className="capitalize">
                                {job.job_employment_type?.toLowerCase().replace('_', ' ') || 'Full time'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {job.job_is_remote && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Remote
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                            {formatJobDate(job.job_posted_at_timestamp)}
                        </Badge>
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 mt-auto border-t bg-muted/20 dark:bg-muted/10">
                    <a
                        href={job.job_apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            buttonVariants({ variant: providerInfo.variant as any }),
                            `w-full mt-4 ${providerInfo.buttonClass}`
                        )}
                    >
                        Apply on {providerInfo.name}
                    </a>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

function formatJobDate(timestamp: number): string {
    if (!timestamp || timestamp < 1577836800) return "Recent"; // Jan 1 2020

    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function getProviderInfo(publisher: string) {
    const p = (publisher || '').toLowerCase();

    // Default
    let info = {
        name: "Company Site",
        badge: null as React.ReactNode,
        buttonClass: "",
        variant: "default"
    };

    if (p.includes('linkedin')) {
        info = {
            name: "LinkedIn",
            badge: <Badge className="bg-[#0077b5] hover:bg-[#0077b5]">LinkedIn</Badge>,
            buttonClass: "bg-[#0077b5] hover:bg-[#005885] text-white",
            variant: "default"
        };
    } else if (p.includes('indeed')) {
        info = {
            name: "Indeed",
            badge: <Badge className="bg-[#2164f3] hover:bg-[#2164f3]">Indeed</Badge>,
            buttonClass: "bg-white text-[#2164f3] border-[#2164f3] hover:bg-slate-50",
            variant: "outline"
        };
    } else if (p.includes('glassdoor')) {
        info = {
            name: "Glassdoor",
            badge: <Badge className="bg-[#0caa41] hover:bg-[#0caa41]">Glassdoor</Badge>,
            buttonClass: "bg-[#0caa41] hover:bg-[#098833] text-white",
            variant: "default"
        };
    } else if (p.includes('upwork')) {
        info = {
            name: "Upwork",
            badge: <Badge className="bg-[#14a800] hover:bg-[#14a800]">Upwork</Badge>,
            buttonClass: "bg-[#14a800] hover:bg-[#0f8600] text-white",
            variant: "default"
        };
    }

    return info;
}
