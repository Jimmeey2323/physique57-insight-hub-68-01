import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionData } from '@/hooks/useSessionsData';
import { UniformTrainerTable } from './UniformTrainerTable';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface ClassAttendanceTableProps {
  data: SessionData[];
}

type MetricType = 'attendance' | 'sessions' | 'fillRate' | 'avgAttendance' | 'capacity';

export const ClassAttendanceTable: React.FC<ClassAttendanceTableProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('attendance');

  const tableData = useMemo(() => {
    const classStats = data.reduce((acc, session) => {
      const className = session.cleanedClass || 'Unknown';
      const monthKey = new Date(session.date).toISOString().slice(0, 7); // YYYY-MM
      
      if (!acc[className]) {
        acc[className] = {
          className,
          totalSessions: 0,
          totalAttendance: 0,
          totalCapacity: 0,
          monthlyData: {} as Record<string, { sessions: number; attendance: number; capacity: number }>
        };
      }
      
      if (!acc[className].monthlyData[monthKey]) {
        acc[className].monthlyData[monthKey] = { sessions: 0, attendance: 0, capacity: 0 };
      }
      
      acc[className].totalSessions += 1;
      acc[className].totalAttendance += session.checkedInCount || 0;
      acc[className].totalCapacity += session.capacity || 0;
      
      acc[className].monthlyData[monthKey].sessions += 1;
      acc[className].monthlyData[monthKey].attendance += session.checkedInCount || 0;
      acc[className].monthlyData[monthKey].capacity += session.capacity || 0;
      
      return acc;
    }, {} as Record<string, any>);

    // Get last two months for comparison
    const allMonths = Array.from(new Set(data.map(session => 
      new Date(session.date).toISOString().slice(0, 7)
    ))).sort();
    const currentMonth = allMonths[allMonths.length - 1];
    const previousMonth = allMonths[allMonths.length - 2];

    return Object.values(classStats).map((stat: any) => {
      const currentData = stat.monthlyData[currentMonth] || { sessions: 0, attendance: 0, capacity: 0 };
      const previousData = stat.monthlyData[previousMonth] || { sessions: 0, attendance: 0, capacity: 0 };
      
      const currentFillRate = currentData.capacity > 0 ? (currentData.attendance / currentData.capacity * 100) : 0;
      const previousFillRate = previousData.capacity > 0 ? (previousData.attendance / previousData.capacity * 100) : 0;
      const currentAvgAttendance = currentData.sessions > 0 ? currentData.attendance / currentData.sessions : 0;
      const previousAvgAttendance = previousData.sessions > 0 ? previousData.attendance / previousData.sessions : 0;
      
      return {
        className: stat.className,
        totalSessions: stat.totalSessions,
        totalAttendance: stat.totalAttendance,
        totalCapacity: stat.totalCapacity,
        overallFillRate: stat.totalCapacity > 0 ? (stat.totalAttendance / stat.totalCapacity * 100) : 0,
        overallAvgAttendance: stat.totalSessions > 0 ? stat.totalAttendance / stat.totalSessions : 0,
        
        // Current month
        currentAttendance: currentData.attendance,
        currentSessions: currentData.sessions,
        currentFillRate,
        currentAvgAttendance,
        currentCapacity: currentData.capacity,
        
        // Previous month
        previousAttendance: previousData.attendance,
        previousSessions: previousData.sessions,
        previousFillRate,
        previousAvgAttendance,
        previousCapacity: previousData.capacity,
        
        // Changes
        attendanceChange: currentData.attendance - previousData.attendance,
        sessionsChange: currentData.sessions - previousData.sessions,
        fillRateChange: currentFillRate - previousFillRate,
        avgAttendanceChange: currentAvgAttendance - previousAvgAttendance,
        capacityChange: currentData.capacity - previousData.capacity
      };
    }).sort((a, b) => b.totalAttendance - a.totalAttendance);
  }, [data]);

  const metrics = [
    { 
      id: 'attendance' as MetricType, 
      label: 'Total Attendance', 
      icon: Users,
      color: 'blue'
    },
    { 
      id: 'sessions' as MetricType, 
      label: 'Total Sessions', 
      icon: Calendar,
      color: 'green'
    },
    { 
      id: 'fillRate' as MetricType, 
      label: 'Fill Rate %', 
      icon: Target,
      color: 'purple'
    },
    { 
      id: 'avgAttendance' as MetricType, 
      label: 'Avg Attendance', 
      icon: Users,
      color: 'orange'
    },
    { 
      id: 'capacity' as MetricType, 
      label: 'Total Capacity', 
      icon: Calendar,
      color: 'indigo'
    }
  ];

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-400';
  };

  const columns = [
    {
      key: 'className' as keyof typeof tableData[0],
      header: 'Class Format',
      render: (value: any) => (
        <div className="font-medium text-blue-800">{value}</div>
      ),
      className: 'min-w-40'
    },
    {
      key: 'currentAttendance' as keyof typeof tableData[0],
      header: 'Current Month',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'attendance': return formatNumber(item.currentAttendance);
            case 'sessions': return formatNumber(item.currentSessions);
            case 'fillRate': return `${item.currentFillRate.toFixed(1)}%`;
            case 'avgAttendance': return formatNumber(item.currentAvgAttendance);
            case 'capacity': return formatNumber(item.currentCapacity);
            default: return '0';
          }
        };
        return <div className="font-medium">{getValue()}</div>;
      },
      align: 'center' as const
    },
    {
      key: 'previousAttendance' as keyof typeof tableData[0],
      header: 'Previous Month',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'attendance': return formatNumber(item.previousAttendance);
            case 'sessions': return formatNumber(item.previousSessions);
            case 'fillRate': return `${item.previousFillRate.toFixed(1)}%`;
            case 'avgAttendance': return formatNumber(item.previousAvgAttendance);
            case 'capacity': return formatNumber(item.previousCapacity);
            default: return '0';
          }
        };
        return <div className="font-medium">{getValue()}</div>;
      },
      align: 'center' as const
    },
    {
      key: 'attendanceChange' as keyof typeof tableData[0],
      header: 'Change',
      render: (value: any, item: any) => {
        const getChange = () => {
          switch (selectedMetric) {
            case 'attendance': return item.attendanceChange;
            case 'sessions': return item.sessionsChange;
            case 'fillRate': return item.fillRateChange;
            case 'avgAttendance': return item.avgAttendanceChange;
            case 'capacity': return item.capacityChange;
            default: return 0;
          }
        };
        
        const change = getChange();
        const displayValue = selectedMetric === 'fillRate' 
          ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
          : `${change >= 0 ? '+' : ''}${formatNumber(Math.abs(change))}`;
        
        return (
          <div className={`flex items-center gap-1 ${getChangeColor(change)}`}>
            {getChangeIcon(change)}
            <span className="font-medium">{displayValue}</span>
          </div>
        );
      },
      align: 'center' as const
    },
    {
      key: 'totalAttendance' as keyof typeof tableData[0],
      header: 'Overall Total',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'attendance': return formatNumber(item.totalAttendance);
            case 'sessions': return formatNumber(item.totalSessions);
            case 'fillRate': return `${item.overallFillRate.toFixed(1)}%`;
            case 'avgAttendance': return formatNumber(item.overallAvgAttendance);
            case 'capacity': return formatNumber(item.totalCapacity);
            default: return '0';
          }
        };
        return <div className="font-semibold text-slate-800">{getValue()}</div>;
      },
      align: 'center' as const
    }
  ];

  return (
    <div className="space-y-4">
      {/* Metric Selector Bar */}
      <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-sm font-medium text-blue-800 mb-2 w-full">Select Metric:</div>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Button
              key={metric.id}
              variant={selectedMetric === metric.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMetric(metric.id)}
              className={`gap-2 ${
                selectedMetric === metric.id 
                  ? `bg-${metric.color}-600 hover:bg-${metric.color}-700` 
                  : `border-${metric.color}-200 text-${metric.color}-700 hover:bg-${metric.color}-50`
              }`}
            >
              <Icon className="w-4 h-4" />
              {metric.label}
            </Button>
          );
        })}
      </div>

      {/* Table */}
      <UniformTrainerTable
        data={tableData}
        columns={columns}
        maxHeight="500px"
        stickyHeader={true}
        showFooter={false}
      />
    </div>
  );
};