"use client"

import { TrendingUp } from "lucide-react"
import {
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    RadialBar,
    RadialBarChart,
    Line,
    LineChart,
    CartesianGrid,
    XAxis,
    PolarRadiusAxis,
    Label
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// --- Global Blue Theme Colors ---
const BLUE_PRIMARY = "#2563eb"; // blue-600
const BLUE_SECONDARY = "#60a5fa"; // blue-400

// --- 1. RADAR CHART: Interview Readiness (Skill Gap Analysis) ---
const radarData = [
    { skill: "Coding", current: 85, market: 60 },
    { skill: "System Design", current: 55, market: 65 },
    { skill: "Behavioral", current: 78, market: 55 },
    { skill: "Communication", current: 82, market: 58 },
    { skill: "Resume Impact", current: 90, market: 62 },
]

const radarConfig = {
    current: {
        label: "Current Score",
        color: BLUE_PRIMARY,
    },
    market: {
        label: "Market Avg",
        color: BLUE_SECONDARY,
    },
} satisfies ChartConfig

export function DashboardRadarChart() {
    return (
        <Card>
            <CardHeader className="items-center pb-2">
                <CardTitle className="text-sm">Interview Readiness</CardTitle>
                <CardDescription className="text-xs">
                    Based on AI Simulator results
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={radarConfig}
                    className="mx-auto h-[150px]"
                >
                    <RadarChart data={radarData}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 8 }} />
                        <PolarGrid />
                        <Radar
                            dataKey="current"
                            fill="var(--color-current)"
                            fillOpacity={0.5}
                            stroke="var(--color-current)"
                            strokeWidth={2}
                        />
                        <Radar
                            dataKey="market"
                            fill="var(--color-market)"
                            fillOpacity={0.3}
                            stroke="var(--color-market)"
                            strokeWidth={2}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-1 text-xs pt-2 items-center justify-center text-center">
                <div className="flex items-center gap-2 font-medium leading-none justify-center">
                    Strong in Coding <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground justify-center">
                    Needs focus on System Design
                </div>
            </CardFooter>
        </Card>
    )
}

// --- 2. RADIAL CHART: Average ATS Score ---
// Data will be dynamic

const radialConfig = {
    value: {
        label: "Score",
    },
    ats: {
        label: "ATS Score",
        color: BLUE_PRIMARY,
    },
} satisfies ChartConfig

interface DashboardRadialChartProps {
    score: number;
}

export function DashboardRadialChart({ score }: DashboardRadialChartProps) {
    const radialData = [
        { score: "ats", value: score, fill: BLUE_PRIMARY },
    ]

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-2">
                <CardTitle className="text-sm">Average ATS Score</CardTitle>
                <CardDescription className="text-xs">Optimization level across active resumes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={radialConfig}
                    className="mx-auto h-[130px]"
                >
                    <RadialBarChart
                        data={radialData}
                        endAngle={(score / 100) * 360}
                        innerRadius={55}
                        outerRadius={85}
                        startAngle={0}
                        barSize={10}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[62, 52]}
                        />
                        <RadialBar dataKey="value" background cornerRadius={10} fill={BLUE_PRIMARY} />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {score}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 16}
                                                    className="fill-muted-foreground text-[10px]"
                                                >
                                                    Match Rate
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-1 text-xs pt-2 items-center justify-center text-center">
                <div className="flex items-center gap-2 font-medium leading-none justify-center">
                    {score >= 80 ? "Great progress" : "Room for improvement"} <TrendingUp className={`h-3 w-3 ${score >= 80 ? "text-green-500" : "text-yellow-500"}`} />
                </div>
                <div className="leading-none text-muted-foreground text-center">
                    {score >= 80 ? "Keep optimizing your CVs" : "Optimize resumes to reach 85%+"}
                </div>
            </CardFooter>
        </Card>
    )
}

// --- 3. LINE CHART: Conversion Velocity ---
const lineData = [
    { week: "Week 1", applications: 12, interviews: 1 },
    { week: "Week 2", applications: 18, interviews: 2 },
    { week: "Week 3", applications: 8, interviews: 1 },
    { week: "Week 4", applications: 22, interviews: 4 },
    { week: "Week 5", applications: 15, interviews: 2 },
    { week: "Week 6", applications: 10, interviews: 2 },
]

const lineConfig = {
    applications: {
        label: "Applications Sent",
        color: BLUE_PRIMARY,
    },
    interviews: {
        label: "Interviews Booked",
        color: BLUE_SECONDARY,
    },
} satisfies ChartConfig

export function DashboardLineChart() {
    return (
        <Card>
            <CardHeader className="items-center pb-2">
                <CardTitle className="text-sm">Conversion Velocity</CardTitle>
                <CardDescription className="text-xs">Applications vs. Interviews</CardDescription>
            </CardHeader>
            <CardContent className="pb-0 pl-0">
                <ChartContainer config={lineConfig} className="mx-auto h-[150px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={lineData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 5,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="week"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 9 }}
                            tickFormatter={(value) => value.replace("Week ", "W")}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="applications"
                            type="monotone"
                            stroke={BLUE_PRIMARY}
                            strokeWidth={2}
                            dot={{ r: 2, fill: BLUE_PRIMARY }}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            dataKey="interviews"
                            type="monotone"
                            stroke={BLUE_SECONDARY}
                            strokeWidth={2}
                            dot={{ r: 2, fill: BLUE_SECONDARY }}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-1 text-xs pt-4 items-center justify-center text-center">
                <div className="flex items-center gap-2 font-medium leading-none justify-center">
                    High conversion rate <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground justify-center">
                    15% interview rate in last 30 days
                </div>
            </CardFooter>
        </Card>
    )
}
