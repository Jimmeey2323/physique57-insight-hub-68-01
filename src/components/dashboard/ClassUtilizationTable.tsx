import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SessionData } from '@/hooks/useSessionsData';
import { UniformTrainerTable } from './UniformTrainerTable';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { 
  BarChart3, 
  Clock, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Calendar
} from 'lucide-react';

interface ClassUtilizationTableProps {
  data: SessionData[];
}

type MetricType = 'capacityUtilization' | 'timeSlotEfficiency' | 'sessionDensity' | 'underperformingSessions' | 'peakUtilization';

export const ClassUtilizationTable: React.FC<ClassUtilizationTableProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('capacityUtilization');

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
          underperformingSessions: 0, // Less than 30% capacity
          peakSessions: 0, // More than 80% capacity
          monthlyData: {} as Record<string, { 
            sessions: number; 
            attendance: number; 
            capacity: number; 
            underperformingSessions: number; 
            peakSessions: number 
          }>
        };
      }
      
      if (!acc[className].monthlyData[monthKey]) {
        acc[className].monthlyData[monthKey] = { 
          sessions: 0, 
          attendance: 0, 
          capacity: 0, 
          underperformingSessions: 0, 
          peakSessions: 0 
        };
      }
      
      const fillRate = session.capacity > 0 ? (session.checkedInCount || 0) / session.capacity : 0;
      const isUnderperforming = fillRate < 0.3;
      const isPeak = fillRate > 0.8;
      
      acc[className].totalSessions += 1;
      acc[className].totalAttendance += session.checkedInCount || 0;
      acc[className].totalCapacity += session.capacity || 0;
      if (isUnderperforming) acc[className].underperformingSessions += 1;
      if (isPeak) acc[className].peakSessions += 1;
      
      acc[className].monthlyData[monthKey].sessions += 1;
      acc[className].monthlyData[monthKey].attendance += session.checkedInCount || 0;
      acc[className].monthlyData[monthKey].capacity += session.capacity || 0;
      if (isUnderperforming) acc[className].monthlyData[monthKey].underperformingSessions += 1;
      if (isPeak) acc[className].monthlyData[monthKey].peakSessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Get last two months for comparison
    const allMonths = Array.from(new Set(data.map(session => 
      new Date(session.date).toISOString().slice(0, 7)
    ))).sort();
    const currentMonth = allMonths[allMonths.length - 1];
    const previousMonth = allMonths[allMonths.length - 2];

    return Object.values(classStats).map((stat: any) => {
      const currentData = stat.monthlyData[currentMonth] || { 
        sessions: 0, 
        attendance: 0, 
        capacity: 0, 
        underperformingSessions: 0, 
        peakSessions: 0 
      };
      const previousData = stat.monthlyData[previousMonth] || { 
        sessions: 0, 
        attendance: 0, 
        capacity: 0, 
        underperformingSessions: 0, 
        peakSessions: 0 
      };
      
      // Current month calculations
      const currentCapacityUtilization = currentData.capacity > 0 ? (currentData.attendance / currentData.capacity * 100) : 0;
      const currentTimeSlotEfficiency = currentData.sessions > 0 ? (currentData.attendance / currentData.sessions) : 0;
      const currentSessionDensity = currentData.sessions > 0 ? (currentData.attendance / currentData.sessions / 15 * 100) : 0; // Assuming average class size of 15
      const currentUnderperformingRate = currentData.sessions > 0 ? (currentData.underperformingSessions / currentData.sessions * 100) : 0;
      const currentPeakUtilization = currentData.sessions > 0 ? (currentData.peakSessions / currentData.sessions * 100) : 0;
      
      // Previous month calculations
      const previousCapacityUtilization = previousData.capacity > 0 ? (previousData.attendance / previousData.capacity * 100) : 0;
      const previousTimeSlotEfficiency = previousData.sessions > 0 ? (previousData.attendance / previousData.sessions) : 0;
      const previousSessionDensity = previousData.sessions > 0 ? (previousData.attendance / previousData.sessions / 15 * 100) : 0;
      const previousUnderperformingRate = previousData.sessions > 0 ? (previousData.underperformingSessions / previousData.sessions * 100) : 0;
      const previousPeakUtilization = previousData.sessions > 0 ? (previousData.peakSessions / previousData.sessions * 100) : 0;
      
      // Overall calculations
      const overallCapacityUtilization = stat.totalCapacity > 0 ? (stat.totalAttendance / stat.totalCapacity * 100) : 0;
      const overallTimeSlotEfficiency = stat.totalSessions > 0 ? (stat.totalAttendance / stat.totalSessions) : 0;
      const overallSessionDensity = stat.totalSessions > 0 ? (stat.totalAttendance / stat.totalSessions / 15 * 100) : 0;
      const overallUnderperformingRate = stat.totalSessions > 0 ? (stat.underperformingSessions / stat.totalSessions * 100) : 0;
      const overallPeakUtilization = stat.totalSessions > 0 ? (stat.peakSessions / stat.totalSessions * 100) : 0;
      
      return {
        className: stat.className,
        totalSessions: stat.totalSessions,
        overallCapacityUtilization,
        overallTimeSlotEfficiency,
        overallSessionDensity,
        overallUnderperformingRate,
        overallPeakUtilization,
        
        // Current month
        currentCapacityUtilization,
        currentTimeSlotEfficiency,
        currentSessionDensity,
        currentUnderperformingSessions: currentData.underperformingSessions,
        currentPeakUtilization,
        
        // Previous month
        previousCapacityUtilization,
        previousTimeSlotEfficiency,
        previousSessionDensity,
        previousUnderperformingSessions: previousData.underperformingSessions,
        previousPeakUtilization,
        
        // Changes
        capacityUtilizationChange: currentCapacityUtilization - previousCapacityUtilization,
        timeSlotEfficiencyChange: currentTimeSlotEfficiency - previousTimeSlotEfficiency,
        sessionDensityChange: currentSessionDensity - previousSessionDensity,
        underperformingSessionsChange: currentData.underperformingSessions - previousData.underperformingSessions,
        peakUtilizationChange: currentPeakUtilization - previousPeakUtilization
      };
    }).sort((a, b) => b.overallCapacityUtilization - a.overallCapacityUtilization);
  }, [data]);

  const metrics = [
    { 
      id: 'capacityUtilization' as MetricType, 
      label: 'Capacity Utilization %', 
      icon: BarChart3,
      color: 'orange'
    },
    { 
      id: 'timeSlotEfficiency' as MetricType, 
      label: 'Time Slot Efficiency', 
      icon: Clock,
      color: 'blue'
    },
    { 
      id: 'sessionDensity' as MetricType, 
      label: 'Session Density %', 
      icon: Target,
      color: 'green'
    },
    { 
      id: 'underperformingSessions' as MetricType, 
      label: 'Underperforming Sessions', 
      icon: AlertTriangle,
      color: 'red'
    },
    { 
      id: 'peakUtilization' as MetricType, 
      label: 'Peak Utilization %', 
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const getChangeIcon = (change: number, isInverse = false) => {
    const isPositive = isInverse ? change < 0 : change > 0;
    if (isPositive) return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (!isPositive && change !== 0) return <TrendingDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getChangeColor = (change: number, isInverse = false) => {
    const isPositive = isInverse ? change < 0 : change > 0;
    if (isPositive) return 'text-green-600';
    if (!isPositive && change !== 0) return 'text-red-600';
    return 'text-gray-400';
  };

  const columns = [
    {
      key: 'className' as keyof typeof tableData[0],
      header: 'Class Format',
      render: (value: any) => (
        <div className="font-medium text-orange-800">{value}</div>
      ),
      className: 'min-w-40'
    },
    {
      key: 'currentCapacityUtilization' as keyof typeof tableData[0],
      header: 'Current Month',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'capacityUtilization': return `${item.currentCapacityUtilization.toFixed(1)}%`;
            case 'timeSlotEfficiency': return formatNumber(item.currentTimeSlotEfficiency);
            case 'sessionDensity': return `${item.currentSessionDensity.toFixed(1)}%`;
            case 'underperformingSessions': return formatNumber(item.currentUnderperformingSessions);
            case 'peakUtilization': return `${item.currentPeakUtilization.toFixed(1)}%`;
            default: return '0';
          }
        };
        return <div className="font-medium">{getValue()}</div>;
      },
      align: 'center' as const
    },
    {
      key: 'previousCapacityUtilization' as keyof typeof tableData[0],
      header: 'Previous Month',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'capacityUtilization': return `${item.previousCapacityUtilization.toFixed(1)}%`;
            case 'timeSlotEfficiency': return formatNumber(item.previousTimeSlotEfficiency);
            case 'sessionDensity': return `${item.previousSessionDensity.toFixed(1)}%`;
            case 'underperformingSessions': return formatNumber(item.previousUnderperformingSessions);
            case 'peakUtilization': return `${item.previousPeakUtilization.toFixed(1)}%`;
            default: return '0';
          }
        };
        return <div className="font-medium">{getValue()}</div>;
      },
      align: 'center' as const
    },
    {
      key: 'capacityUtilizationChange' as keyof typeof tableData[0],
      header: 'Change',
      render: (value: any, item: any) => {
        const getChange = () => {
          switch (selectedMetric) {
            case 'capacityUtilization': return item.capacityUtilizationChange;
            case 'timeSlotEfficiency': return item.timeSlotEfficiencyChange;
            case 'sessionDensity': return item.sessionDensityChange;
            case 'underperformingSessions': return item.underperformingSessionsChange;
            case 'peakUtilization': return item.peakUtilizationChange;
            default: return 0;
          }
        };
        
        const change = getChange();
        const isInverse = selectedMetric === 'underperformingSessions';
        const isPercentage = ['capacityUtilization', 'sessionDensity', 'peakUtilization'].includes(selectedMetric);
        
        const displayValue = isPercentage
          ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
          : `${change >= 0 ? '+' : ''}${formatNumber(Math.abs(change))}`;
        
        return (
          <div className={`flex items-center gap-1 ${getChangeColor(change, isInverse)}`}>
            {getChangeIcon(change, isInverse)}
            <span className="font-medium">{displayValue}</span>
          </div>
        );
      },
      align: 'center' as const
    },
    {
      key: 'overallCapacityUtilization' as keyof typeof tableData[0],
      header: 'Overall Total',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'capacityUtilization': return `${item.overallCapacityUtilization.toFixed(1)}%`;
            case 'timeSlotEfficiency': return formatNumber(item.overallTimeSlotEfficiency);
            case 'sessionDensity': return `${item.overallSessionDensity.toFixed(1)}%`;
            case 'underperformingSessions': return formatNumber(item.underperformingSessions);
            case 'peakUtilization': return `${item.overallPeakUtilization.toFixed(1)}%`;
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
      <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
        <div className="text-sm font-medium text-orange-800 mb-2 w-full">Select Utilization Metric:</div>
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