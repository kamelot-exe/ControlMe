"use client";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "./Card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartData {
  name: string;
  [key: string]: string | number;
}

interface ChartProps {
  title?: string;
  description?: string;
  data: ChartData[];
  type?: "line" | "area" | "bar";
  dataKey: string;
  color?: string;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-light rounded-xl p-4 border border-white/20 shadow-lg">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-foreground/80" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? `$${entry.value.toFixed(2)}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Chart({
  title,
  description,
  data,
  type = "line",
  dataKey,
  color = "#ffffff",
  className,
}: ChartProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 20, left: 0, bottom: 20 },
    };

    switch (type) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)" 
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${dataKey})`}
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)" 
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={dataKey} 
              fill={color} 
              radius={[8, 8, 0, 0]}
              stroke={color}
              strokeWidth={1}
            />
          </BarChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)" 
              style={{ fontSize: "12px" }}
              tick={{ fill: "rgba(255,255,255,0.6)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 5, strokeWidth: 2, stroke: "#050816" }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="animate-fade-in">
          <ResponsiveContainer width="100%" height={350}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
