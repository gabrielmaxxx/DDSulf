import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
}

interface CustomChartProps {
  data: ChartDataPoint[];
  type?: 'line' | 'area' | 'bar';
  primaryColor?: string;
  secondaryColor?: string;
  height?: number;
  showGrid?: boolean;
}

export function CustomChart({
  data,
  type = 'area',
  primaryColor = '#0f172a', // Deep slate default
  secondaryColor = '#f43f5e', // Highlight Rose default
  height = 240,
  showGrid = true
}: CustomChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={primaryColor} 
              strokeWidth={2} 
              activeDot={{ r: 6 }} 
              dot={{ r: 3, strokeWidth: 1 }}
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill={primaryColor} 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
          </BarChart>
        );
      case 'area':
      default:
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={primaryColor} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#primaryGrad)" 
            />
          </AreaChart>
        );
    }
  };

  return (
    <div style={{ width: '100%', height }} className="font-sans">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-[11px] font-sans space-y-1">
        <p className="font-bold opacity-75">{label}</p>
        <p className="font-mono text-amber-400">
          Valor: <span className="text-white font-bold">{payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default CustomChart;
