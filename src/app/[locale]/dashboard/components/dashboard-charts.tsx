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
            <CardHeader className="items-center pb-4">
                <CardTitle>Global Presence</CardTitle>
                <CardDescription>
                    Regional engagement metrics
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={radarConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadarChart data={radarData}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <PolarAngleAxis dataKey="month" />
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
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Growing in 3 regions <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    January - June 2025
                </div>
            </CardFooter>
        </Card>
    )
}

// --- Radial Chart Shape ---
// Note: fill color must be set in data for RadialBar if not using config mapping perfectly, 
// but ChartContainer handles css vars.
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
            <CardHeader className="items-center pb-0">
                <CardTitle>Completion Rate</CardTitle>
                <CardDescription>Profile optimization status</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={radialConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadialBarChart
                        data={radialData}
                        endAngle={260} // Adjusted angle to look more like a gauge
                        innerRadius={80}
                        outerRadius={140}
                        startAngle={0}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[86, 74]}
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
                                                    className="fill-foreground text-4xl font-bold"
                                                >
                                                    72%
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground text-[16px]"
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
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Good progress <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Finish your resume to reach 100%
                </div>
            </CardFooter>
        </Card>
    )
}

// --- Line Chart Multiple ---
const lineData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]

const lineConfig = {
    desktop: {
        label: "Applications",
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
            <CardHeader>
                <CardTitle>Application History</CardTitle>
                <CardDescription>Applications vs Interviews</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={lineConfig}>
                    <LineChart
                        accessibilityLayer
                        data={lineData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 10,
                            bottom: 10,
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="desktop"
                            type="monotone"
                            stroke={BLUE_PRIMARY}
                            strokeWidth={2}
                            dot={{ r: 4, fill: BLUE_PRIMARY }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            dataKey="mobile"
                            type="monotone"
                            stroke={BLUE_SECONDARY}
                            strokeWidth={2}
                            dot={{ r: 4, fill: BLUE_SECONDARY }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            High conversion rate <TrendingUp className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Last 6 months activity
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
