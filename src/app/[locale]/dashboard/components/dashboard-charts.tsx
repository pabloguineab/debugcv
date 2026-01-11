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

// --- Radar Chart Multiple ---
const radarData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]

const radarConfig = {
    desktop: {
        label: "Engagement",
        color: BLUE_PRIMARY,
    },
    mobile: {
        label: "Outreach",
        color: BLUE_SECONDARY,
    },
} satisfies ChartConfig

export function DashboardRadarChart() {
    return (
        <Card>
            <CardHeader className="items-center pb-2">
                <CardTitle className="text-sm">Global Presence</CardTitle>
                <CardDescription className="text-xs">
                    Regional metrics
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={radarConfig}
                    className="mx-auto h-[150px]"
                >
                    <RadarChart data={radarData}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <PolarAngleAxis dataKey="month" tick={{ fontSize: 9 }} />
                        <PolarGrid />
                        <Radar
                            dataKey="desktop"
                            fill="var(--color-desktop)"
                            fillOpacity={0.5}
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                        />
                        <Radar
                            dataKey="mobile"
                            fill="var(--color-mobile)"
                            fillOpacity={0.5}
                            stroke="var(--color-mobile)"
                            strokeWidth={2}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-1 text-xs pt-2 items-center justify-center text-center">
                <div className="flex items-center gap-2 font-medium leading-none justify-center">
                    Growing in 3 regions <TrendingUp className="h-3 w-3 text-blue-500" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground justify-center">
                    Jan - Jun 2025
                </div>
            </CardFooter>
        </Card>
    )
}

// --- Radial Chart Shape ---
const radialData = [
    { browser: "safari", visitors: 72, fill: BLUE_PRIMARY },
]

const radialConfig = {
    visitors: {
        label: "Visitors",
    },
    safari: {
        label: "Safari",
        color: BLUE_PRIMARY,
    },
} satisfies ChartConfig

export function DashboardRadialChart() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-2">
                <CardTitle className="text-sm">Completion Rate</CardTitle>
                <CardDescription className="text-xs">Profile status</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={radialConfig}
                    className="mx-auto h-[150px]"
                >
                    <RadialBarChart
                        data={radialData}
                        endAngle={260}
                        innerRadius={70}
                        outerRadius={105}
                        startAngle={0}
                        barSize={12}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[76, 64]}
                        />
                        <RadialBar dataKey="visitors" background cornerRadius={10} fill={BLUE_PRIMARY} />
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
                                                    72%
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 16}
                                                    className="fill-muted-foreground text-[10px]"
                                                >
                                                    Completed
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
                    Good progress <TrendingUp className="h-3 w-3 text-blue-500" />
                </div>
                <div className="leading-none text-muted-foreground text-center">
                    Finish resume to reach 100%
                </div>
            </CardFooter>
        </Card>
    )
}

// --- Line Chart Multiple ---
const lineData = [
    { month: "Jan", desktop: 186, mobile: 80 },
    { month: "Feb", desktop: 305, mobile: 200 },
    { month: "Mar", desktop: 237, mobile: 120 },
    { month: "Apr", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]

const lineConfig = {
    desktop: {
        label: "Apps",
        color: BLUE_PRIMARY,
    },
    mobile: {
        label: "Interviews",
        color: BLUE_SECONDARY,
    },
} satisfies ChartConfig

export function DashboardLineChart() {
    return (
        <Card>
            <CardHeader className="items-center pb-2">
                <CardTitle className="text-sm">Application History</CardTitle>
                <CardDescription className="text-xs">Apps vs Interviews</CardDescription>
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
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 10 }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="desktop"
                            type="monotone"
                            stroke={BLUE_PRIMARY}
                            strokeWidth={2}
                            dot={{ r: 2, fill: BLUE_PRIMARY }}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            dataKey="mobile"
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
                    High conversion rate <TrendingUp className="h-3 w-3 text-blue-500" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground justify-center">
                    Last 6 months activity
                </div>
            </CardFooter>
        </Card>
    )
}
