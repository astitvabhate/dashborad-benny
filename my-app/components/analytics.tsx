"use client"

import * as React from "react"
import {
    IconBrandInstagram,
    IconBrandYoutube,
    IconTrendingUp,
} from "@tabler/icons-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Import types and helpers if needed, or define locally if they are small
// For this extract, we'll assume the props pass the necessary data

interface AnalyticsProps {
    data: any[]
    totalYoutubeViews: number
    totalInstagramViews: number
    chartConfig: ChartConfig
    tierColors: Record<string, string>
    formatNumber: (num: number) => string
}

const getTierColor = (tier: string) => {
    switch (tier) {
        case "Nano": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
        case "Micro": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
        case "Macro": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
        case "Mega": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
    }
}

export function Analytics({
    data,
    totalYoutubeViews,
    totalInstagramViews,
    chartConfig,
    tierColors,
    formatNumber,
}: AnalyticsProps) {
    const [timeRange, setTimeRange] = React.useState<"month" | "3months" | "year">("month")

    // Memoized analytics data generation
    const analytics = React.useMemo(() => {
        const youtubeCreators = data.filter(c => c.platform === "youtube")
        const instagramCreators = data.filter(c => c.platform === "instagram")

        // Generate daily/monthly data based on range
        const viewData = []
        const now = new Date()
        let points = 30
        let interval = "day"

        if (timeRange === "3months") {
            points = 90
        } else if (timeRange === "year") {
            points = 12
            interval = "month"
        }

        for (let i = points - 1; i >= 0; i--) {
            const date = new Date(now)
            if (interval === "day") {
                date.setDate(now.getDate() - i)
            } else {
                date.setMonth(now.getMonth() - i)
            }

            const label = interval === "day"
                ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                : date.toLocaleDateString('en-US', { month: 'short' })

            // Randomish but trending data
            const factor = (points - i) / points
            viewData.push({
                label,
                youtube: Math.floor(totalYoutubeViews * (0.02 + Math.random() * 0.01) * (interval === "day" ? 1 : 10) * factor),
                instagram: Math.floor(totalInstagramViews * (0.018 + Math.random() * 0.012) * (interval === "day" ? 1 : 10) * factor),
            })
        }

        return {
            platformData: [
                { name: "YouTube", views: totalYoutubeViews, creators: youtubeCreators.length },
                { name: "Instagram", views: totalInstagramViews, creators: instagramCreators.length },
            ],
            tierData: [
                { tier: "Nano", count: data.filter(c => c.tier === "Nano").length },
                { tier: "Micro", count: data.filter(c => c.tier === "Micro").length },
                { tier: "Macro", count: data.filter(c => c.tier === "Macro").length },
                { tier: "Mega", count: data.filter(c => c.tier === "Mega").length },
            ],
            viewData
        }
    }, [data, totalYoutubeViews, totalInstagramViews, timeRange])

    return (
        <div className="flex flex-col gap-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border bg-white/50 dark:bg-zinc-900/50 p-6 hover:border-red-500/30 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-[0.1em] font-bold">
                        <IconBrandYoutube className="size-4 text-red-500" />
                        YouTube Views
                    </div>
                    <div className="text-3xl font-bold mt-3 text-zinc-900 dark:text-zinc-100">{formatNumber(totalYoutubeViews)}</div>
                </div>
                <div className="rounded-2xl border bg-white/50 dark:bg-zinc-900/50 p-6 hover:border-purple-500/30 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-[0.1em] font-bold">
                        <IconBrandInstagram className="size-4 text-purple-500" />
                        Instagram Views
                    </div>
                    <div className="text-3xl font-bold mt-3 text-zinc-900 dark:text-zinc-100">{formatNumber(totalInstagramViews)}</div>
                </div>
                <div className="rounded-2xl border bg-white/50 dark:bg-zinc-900/50 p-6 hover:border-green-500/30 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-[0.1em] font-bold">
                        <IconTrendingUp className="size-4 text-green-500" />
                        Total Views
                    </div>
                    <div className="text-3xl font-bold mt-3 text-zinc-900 dark:text-zinc-100">
                        {formatNumber(totalYoutubeViews + totalInstagramViews)}
                    </div>
                </div>
                <div className="rounded-2xl border bg-white/50 dark:bg-zinc-900/50 p-6 hover:border-blue-500/30 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-[0.1em] font-bold">
                        Total Creators
                    </div>
                    <div className="text-3xl font-bold mt-3 text-zinc-900 dark:text-zinc-100">{data.length}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Views Over Time Chart */}
                <div className="rounded-2xl border bg-white/50 dark:bg-zinc-900/50 p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-zinc-400 font-medium text-lg">Views Over Time</h3>
                        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                            <SelectTrigger className="w-[150px] h-9 text-xs bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-200 font-medium shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-lg">
                                <SelectItem value="month" className="text-zinc-700 dark:text-zinc-200 focus:bg-zinc-100 dark:focus:bg-zinc-800">Recent Month</SelectItem>
                                <SelectItem value="3months" className="text-zinc-700 dark:text-zinc-200 focus:bg-zinc-100 dark:focus:bg-zinc-800">Last 3 Months</SelectItem>
                                <SelectItem value="year" className="text-zinc-700 dark:text-zinc-200 focus:bg-zinc-100 dark:focus:bg-zinc-800">Last Year</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <AreaChart data={analytics.viewData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                interval={timeRange === "month" ? 5 : timeRange === "3months" ? 15 : 0}
                                tick={{ fontSize: 10, fill: '#71717a' }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatNumber(value)}
                                tick={{ fontSize: 10, fill: '#71717a' }}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-lg text-zinc-800 dark:text-zinc-100" />}
                                formatter={(value: number) => formatNumber(value)}
                            />

                            <Area
                                type="monotone"
                                dataKey="youtube"
                                stackId="1"
                                stroke="#ef4444"
                                fill="url(#colorYoutube)"
                            />
                            <Area
                                type="monotone"
                                dataKey="instagram"
                                stackId="1"
                                stroke="#a855f7"
                                fill="url(#colorInstagram)"
                            />
                            <defs>
                                <linearGradient id="colorYoutube" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    </ChartContainer>
                </div>

                {/* Platform Distribution Chart */}
                <div className="rounded-2xl border bg-white/50 dark:bg-zinc-900/50 p-6">
                    <h3 className="text-zinc-400 font-medium text-lg mb-8">Platform Distribution</h3>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <BarChart data={analytics.platformData}>
                            <defs>
                                <linearGradient id="barYoutube" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="barInstagram" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#9333ea" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#71717a', fontWeight: 500 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatNumber(value)}
                                tick={{ fontSize: 10, fill: '#a1a1aa' }}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-lg text-zinc-800 dark:text-zinc-100" />}
                                formatter={(value: number) => formatNumber(value)}
                            />

                            <Bar
                                dataKey="views"
                                radius={[8, 8, 0, 0]}
                                name="Views"
                            >
                                {analytics.platformData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.name === "YouTube" ? "url(#barYoutube)" : "url(#barInstagram)"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>

            {/* Tier Distribution */}
            <div className="rounded-2xl border bg-white/50 dark:bg-zinc-900/50 p-6 mt-4">
                <h3 className="text-zinc-500 dark:text-zinc-400 font-medium text-lg mb-8">Creator Tier Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analytics.tierData.map((tier) => (
                        <div key={tier.tier} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all hover:scale-[1.02] hover:shadow-md">
                            <Badge className={`${getTierColor(tier.tier)} px-4 py-1.5 text-[10px] font-bold rounded-full border`}>
                                {tier.tier}
                            </Badge>
                            <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">{tier.count}</div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] font-bold">creators</div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
