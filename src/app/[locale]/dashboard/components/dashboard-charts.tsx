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
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
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
                            fillOpacity={0.6}
                        />
                        <Radar dataKey="mobile" fill="var(--color-mobile)" />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Growing in 3 regions <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    January - June 2025
                </div>
            </CardFooter>
        </Card>
    )
}

// --- Radial Chart Shape ---
const radialData = [
    { browser: "safari", visitors: 1260, fill: "var(--color-safari)" },
]

const radialConfig = {
    visitors: {
        label: "Visitors",
    },
    safari: {
        label: "Safari",
        color: "hsl(var(--chart-2))",
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
                        endAngle={100}
                        innerRadius={80}
                        outerRadius={140}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[86, 74]}
                        />
                        <RadialBar dataKey="visitors" background cornerRadius={10} />
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
                    Good progress <TrendingUp className="h-4 w-4" />
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
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Interviews",
        color: "hsl(var(--chart-2))",
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
                        }}
                    >
                        <CartesianGrid vertical={false} />
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
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="mobile"
                            type="monotone"
                            stroke="var(--color-mobile)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            High conversion rate <TrendingUp className="h-4 w-4" />
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
