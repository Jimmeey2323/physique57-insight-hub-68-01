import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionData } from '@/hooks/useSessionsData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Activity 
} from 'lucide-react';

interface ClassPerformanceChartsProps {
  data: SessionData[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export const ClassPerformanceCharts: React.FC<ClassPerformanceChartsProps> = ({ data }) => {
  const [activeChart, setActiveChart] = useState<'attendance' | 'revenue' | 'distribution' | 'trends'>('attendance');

  // Class format attendance data
  const classAttendanceData = useMemo(() => {
    const classStats = data.reduce((acc, session) => {
      const className = session.cleanedClass || 'Unknown';
      if (!acc[className]) {
        acc[className] = {
          className,
          totalSessions: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          totalCapacity: 0
        };
      }
      acc[className].totalSessions += 1;
      acc[className].totalAttendance += session.checkedInCount || 0;
      acc[className].totalRevenue += session.totalPaid || 0;
      acc[className].totalCapacity += session.capacity || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(classStats)
      .map((stat: any) => ({
        ...stat,
        avgFillRate: stat.totalCapacity > 0 ? (stat.totalAttendance / stat.totalCapacity * 100) : 0,
        avgRevenue: stat.totalSessions > 0 ? stat.totalRevenue / stat.totalSessions : 0
      }))
      .sort((a: any, b: any) => b.totalAttendance - a.totalAttendance)
      .slice(0, 10);
  }, [data]);

  // Monthly trends data
  const monthlyTrendsData = useMemo(() => {
    const monthlyStats = data.reduce((acc, session) => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          sessions: 0,
          attendance: 0,
          revenue: 0,
          capacity: 0
        };
      }
      
      acc[monthKey].sessions += 1;
      acc[monthKey].attendance += session.checkedInCount || 0;
      acc[monthKey].revenue += session.totalPaid || 0;
      acc[monthKey].capacity += session.capacity || 0;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyStats)
      .map((stat: any) => ({
        ...stat,
        fillRate: stat.capacity > 0 ? (stat.attendance / stat.capacity * 100) : 0
      }))
      .sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [data]);

  // Class distribution data for pie chart
  const classDistributionData = useMemo(() => {
    const distribution = data.reduce((acc, session) => {
      const className = session.cleanedClass || 'Unknown';
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [data]);

  const chartConfigs = [
    {
      id: 'attendance',
      title: 'Class Attendance Performance',
      icon: BarChart3,
      description: 'Total attendance by class format'
    },
    {
      id: 'revenue',
      title: 'Revenue Performance',
      icon: TrendingUp,
      description: 'Revenue generation by class format'
    },
    {
      id: 'distribution',
      title: 'Class Distribution',
      icon: PieChartIcon,
      description: 'Session distribution across formats'
    },
    {
      id: 'trends',
      title: 'Monthly Trends',
      icon: Activity,
      description: 'Performance trends over time'
    }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'attendance':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={classAttendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="className" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => [
                  name === 'totalAttendance' ? `${value} students` : value,
                  name === 'totalAttendance' ? 'Total Attendance' : name
                ]}
              />
              <Bar dataKey="totalAttendance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={classAttendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="className" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Total Revenue']}
              />
              <Bar dataKey="totalRevenue" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={classDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {classDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'trends':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlyTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="attendance" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name="Attendance"
              />
              <Area 
                type="monotone" 
                dataKey="sessions" 
                stackId="2"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart Controls */}
      <div className="lg:col-span-1">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Chart Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {chartConfigs.map((config) => {
              const Icon = config.icon;
              return (
                <Button
                  key={config.id}
                  variant={activeChart === config.id ? "default" : "outline"}
                  className="w-full justify-start gap-3 h-auto p-3"
                  onClick={() => setActiveChart(config.id as any)}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{config.title}</div>
                    <div className="text-xs opacity-70">{config.description}</div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Chart Display */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const config = chartConfigs.find(c => c.id === activeChart);
                if (config) {
                  const Icon = config.icon;
                  return (
                    <>
                      <Icon className="w-5 h-5" />
                      {config.title}
                    </>
                  );
                }
                return null;
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};