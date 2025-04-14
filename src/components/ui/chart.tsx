"use client"

import type * as React from "react"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"

// Define chart config type
export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

// ChartContainer component
interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  // Create CSS variables for chart colors
  const style = Object.entries(config).reduce(
    (acc, [key, value]) => {
      acc[`--color-${key}`] = value.color
      return acc
    },
    {} as Record<string, string>,
  )

  return (
    <div className={cn("chart-container", className)} style={style} {...props}>
      {children}
    </div>
  )
}

interface BarChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
      borderRadius: number
    }[]
  }
  className?: string
  showLegend?: boolean
  showTooltip?: boolean
  showGrid?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  [key: string]: any
}

export function BarChart({
  data,
  className,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  ...props
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsBarChart
        data={data.labels.map((label, index) => ({
          name: label,
          ...data.datasets.reduce((acc, dataset) => {
            acc[dataset.label] = dataset.data[index];
            return acc;
          }, {} as Record<string, number>),
        }))}
        {...props}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
        {showXAxis && <XAxis dataKey="name" />}
        {showYAxis && <YAxis />}
        {showTooltip && <Tooltip content={<ChartTooltipContent />} />}
        {showLegend && <Legend />}
        {props.children || <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

interface LineChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
      tension: number
    }[]
  }
  className?: string
  showLegend?: boolean
  showTooltip?: boolean
  showGrid?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  [key: string]: any
}

export function LineChart({
  data,
  className,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  ...props
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsLineChart
        data={data.labels.map((label, index) => ({
          name: label,
          ...data.datasets.reduce((acc, dataset) => {
            acc[dataset.label] = dataset.data[index];
            return acc;
          }, {} as Record<string, number>),
        }))}
        {...props}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
        {showXAxis && <XAxis dataKey="name" />}
        {showYAxis && <YAxis />}
        {showTooltip && <Tooltip content={<ChartTooltipContent />} />}
        {showLegend && <Legend />}
        {props.children || (
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

interface PieChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string[]
      borderWidth: number
      borderColor: string
    }[]
  }
  className?: string
  showLegend?: boolean
  showTooltip?: boolean
  innerRadius?: number
  outerRadius?: number
  [key: string]: any
}

export function PieChart({
  data,
  className,
  showLegend = true,
  showTooltip = true,
  innerRadius = 0,
  outerRadius = 80,
  ...props
}: PieChartProps) {
  const COLORS = ["var(--color-primary)", "var(--color-secondary)", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsPieChart {...props}>
        {showTooltip && <Tooltip content={<ChartTooltipContent />} />}
        {showLegend && <Legend />}
        <Pie
          data={data.labels.map((label, index) => ({
            name: label,
            value: data.datasets[0].data[index],
            color: data.datasets[0].backgroundColor[index],
          }))}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {data.labels.map((label, index) => (
            <Cell
              key={`cell-${index}`}
              fill={data.datasets[0].backgroundColor[index] || COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

// ChartTooltip component
interface ChartTooltipContentProps extends Omit<TooltipProps<any, any>, "active"> {
  className?: string
}

export function ChartTooltipContent({ className, payload, label, ...props }: ChartTooltipContentProps & { content?: React.ReactNode }) {
  if (!payload || !payload.length) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
      {label && <div className="font-medium">{label}</div>}
      <div className="flex flex-col gap-0.5">
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            <span className="font-medium">{item.name || item.dataKey}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Export a simple ChartTooltip wrapper for consistency
export function ChartTooltip(props: any) {
  return <Tooltip {...props} />
}
