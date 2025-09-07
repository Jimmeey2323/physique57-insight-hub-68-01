import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SessionData } from '@/hooks/useSessionsData';
import { UniformTrainerTable } from './UniformTrainerTable';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { 
  Target, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Clock
} from 'lucide-react';

interface ClassEfficiencyTableProps {
  data: SessionData[];
}

type MetricType = 'utilization' | 'emptySessions' | 'efficiency' | 'productivity' | 'wasteRate';

export const ClassEfficiencyTable: React.FC<ClassEfficiencyTableProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('utilization');

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
          emptySessions: 0,
          monthlyData: {} as Record<string, { sessions: number; attendance: number; capacity: number; emptySessions: number }>
        };
      }
      
      if (!acc[className].monthlyData[monthKey]) {
        acc[className].monthlyData[monthKey] = { sessions: 0, attendance: 0, capacity: 0, emptySessions: 0 };
      }
      
      const isEmpty = (session.checkedInCount || 0) === 0;
      
      acc[className].totalSessions += 1;
      acc[className].totalAttendance += session.checkedInCount || 0;
      acc[className].totalCapacity += session.capacity || 0;
      if (isEmpty) acc[className].emptySessions += 1;
      
      acc[className].monthlyData[monthKey].sessions += 1;
      acc[className].monthlyData[monthKey].attendance += session.checkedInCount || 0;
      acc[className].monthlyData[monthKey].capacity += session.capacity || 0;
      if (isEmpty) acc[className].monthlyData[monthKey].emptySessions += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Get last two months for comparison
    const allMonths = Array.from(new Set(data.map(session => 
      new Date(session.date).toISOString().slice(0, 7)
    ))).sort();
    const currentMonth = allMonths[allMonths.length - 1];
    const previousMonth = allMonths[allMonths.length - 2];

    return Object.values(classStats).map((stat: any) => {
      const currentData = stat.monthlyData[currentMonth] || { sessions: 0, attendance: 0, capacity: 0, emptySessions: 0 };
      const previousData = stat.monthlyData[previousMonth] || { sessions: 0, attendance: 0, capacity: 0, emptySessions: 0 };
      
      // Current month calculations
      const currentUtilization = currentData.sessions > 0 ? ((currentData.sessions - currentData.emptySessions) / currentData.sessions * 100) : 0;
      const currentEfficiency = currentData.capacity > 0 ? (currentData.attendance / currentData.capacity * 100) : 0;
      const currentProductivity = currentData.sessions > 0 ? currentData.attendance / currentData.sessions : 0;
      const currentWasteRate = currentData.sessions > 0 ? (currentData.emptySessions / currentData.sessions * 100) : 0;
      
      // Previous month calculations
      const previousUtilization = previousData.sessions > 0 ? ((previousData.sessions - previousData.emptySessions) / previousData.sessions * 100) : 0;
      const previousEfficiency = previousData.capacity > 0 ? (previousData.attendance / previousData.capacity * 100) : 0;
      const previousProductivity = previousData.sessions > 0 ? previousData.attendance / previousData.sessions : 0;
      const previousWasteRate = previousData.sessions > 0 ? (previousData.emptySessions / previousData.sessions * 100) : 0;
      
      // Overall calculations
      const overallUtilization = stat.totalSessions > 0 ? ((stat.totalSessions - stat.emptySessions) / stat.totalSessions * 100) : 0;
      const overallEfficiency = stat.totalCapacity > 0 ? (stat.totalAttendance / stat.totalCapacity * 100) : 0;
      const overallProductivity = stat.totalSessions > 0 ? stat.totalAttendance / stat.totalSessions : 0;
      const overallWasteRate = stat.totalSessions > 0 ? (stat.emptySessions / stat.totalSessions * 100) : 0;
      
      return {
        className: stat.className,
        totalSessions: stat.totalSessions,
        emptySessions: stat.emptySessions,
        overallUtilization,
        overallEfficiency,
        overallProductivity,
        overallWasteRate,
        
        // Current month
        currentUtilization,
        currentEmptySessions: currentData.emptySessions,
        currentEfficiency,
        currentProductivity,
        currentWasteRate,
        
        // Previous month
        previousUtilization,
        previousEmptySessions: previousData.emptySessions,
        previousEfficiency,
        previousProductivity,
        previousWasteRate,
        
        // Changes
        utilizationChange: currentUtilization - previousUtilization,
        emptySessionsChange: currentData.emptySessions - previousData.emptySessions,
        efficiencyChange: currentEfficiency - previousEfficiency,
        productivityChange: currentProductivity - previousProductivity,
        wasteRateChange: currentWasteRate - previousWasteRate
      };
    }).sort((a, b) => b.overallUtilization - a.overallUtilization);
  }, [data]);

  const metrics = [
    { 
      id: 'utilization' as MetricType, 
      label: 'Utilization Rate %', 
      icon: Target,
      color: 'green'
    },
    { 
      id: 'emptySessions' as MetricType, 
      label: 'Empty Sessions', 
      icon: AlertTriangle,
      color: 'red'
    },
    { 
      id: 'efficiency' as MetricType, 
      label: 'Fill Efficiency %', 
      icon: Zap,
      color: 'blue'
    },
    { 
      id: 'productivity' as MetricType, 
      label: 'Avg Productivity', 
      icon: TrendingUp,
      color: 'purple'
    },
    { 
      id: 'wasteRate' as MetricType, 
      label: 'Waste Rate %', 
      icon: Clock,
      color: 'orange'
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
        <div className="font-medium text-green-800">{value}</div>
      ),
      className: 'min-w-40'
    },
    {
      key: 'currentUtilization' as keyof typeof tableData[0],
      header: 'Current Month',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'utilization': return `${item.currentUtilization.toFixed(1)}%`;
            case 'emptySessions': return formatNumber(item.currentEmptySessions);
            case 'efficiency': return `${item.currentEfficiency.toFixed(1)}%`;
            case 'productivity': return formatNumber(item.currentProductivity);
            case 'wasteRate': return `${item.currentWasteRate.toFixed(1)}%`;
            default: return '0';
          }
        };
        return <div className="font-medium">{getValue()}</div>;
      },
      align: 'center' as const
    },
    {
      key: 'previousUtilization' as keyof typeof tableData[0],
      header: 'Previous Month',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'utilization': return `${item.previousUtilization.toFixed(1)}%`;
            case 'emptySessions': return formatNumber(item.previousEmptySessions);
            case 'efficiency': return `${item.previousEfficiency.toFixed(1)}%`;
            case 'productivity': return formatNumber(item.previousProductivity);
            case 'wasteRate': return `${item.previousWasteRate.toFixed(1)}%`;
            default: return '0';
          }
        };
        return <div className="font-medium">{getValue()}</div>;
      },
      align: 'center' as const
    },
    {
      key: 'utilizationChange' as keyof typeof tableData[0],
      header: 'Change',
      render: (value: any, item: any) => {
        const getChange = () => {
          switch (selectedMetric) {
            case 'utilization': return item.utilizationChange;
            case 'emptySessions': return item.emptySessionsChange;
            case 'efficiency': return item.efficiencyChange;
            case 'productivity': return item.productivityChange;
            case 'wasteRate': return item.wasteRateChange;
            default: return 0;
          }
        };
        
        const change = getChange();
        const isInverse = selectedMetric === 'emptySessions' || selectedMetric === 'wasteRate';
        const isPercentage = ['utilization', 'efficiency', 'wasteRate'].includes(selectedMetric);
        
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
      key: 'overallUtilization' as keyof typeof tableData[0],
      header: 'Overall Total',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'utilization': return `${item.overallUtilization.toFixed(1)}%`;
            case 'emptySessions': return formatNumber(item.emptySessions);
            case 'efficiency': return `${item.overallEfficiency.toFixed(1)}%`;
            case 'productivity': return formatNumber(item.overallProductivity);
            case 'wasteRate': return `${item.overallWasteRate.toFixed(1)}%`;
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
      <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="text-sm font-medium text-green-800 mb-2 w-full">Select Efficiency Metric:</div>
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