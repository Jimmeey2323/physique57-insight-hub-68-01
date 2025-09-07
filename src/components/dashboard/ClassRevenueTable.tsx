import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SessionData } from '@/hooks/useSessionsData';
import { UniformTrainerTable } from './UniformTrainerTable';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  Target
} from 'lucide-react';

interface ClassRevenueTableProps {
  data: SessionData[];
}

type MetricType = 'totalRevenue' | 'avgRevenuePerSession' | 'revenuePerAttendee' | 'revenueEfficiency' | 'revenueGrowth';

export const ClassRevenueTable: React.FC<ClassRevenueTableProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalRevenue');

  const tableData = useMemo(() => {
    const classStats = data.reduce((acc, session) => {
      const className = session.cleanedClass || 'Unknown';
      const monthKey = new Date(session.date).toISOString().slice(0, 7); // YYYY-MM
      
      if (!acc[className]) {
        acc[className] = {
          className,
          totalSessions: 0,
          totalAttendance: 0,
          totalRevenue: 0,
          monthlyData: {} as Record<string, { sessions: number; attendance: number; revenue: number }>
        };
      }
      
      if (!acc[className].monthlyData[monthKey]) {
        acc[className].monthlyData[monthKey] = { sessions: 0, attendance: 0, revenue: 0 };
      }
      
      acc[className].totalSessions += 1;
      acc[className].totalAttendance += session.checkedInCount || 0;
      acc[className].totalRevenue += session.totalPaid || 0;
      
      acc[className].monthlyData[monthKey].sessions += 1;
      acc[className].monthlyData[monthKey].attendance += session.checkedInCount || 0;
      acc[className].monthlyData[monthKey].revenue += session.totalPaid || 0;
      
      return acc;
    }, {} as Record<string, any>);

    // Get last two months for comparison
    const allMonths = Array.from(new Set(data.map(session => 
      new Date(session.date).toISOString().slice(0, 7)
    ))).sort();
    const currentMonth = allMonths[allMonths.length - 1];
    const previousMonth = allMonths[allMonths.length - 2];

    return Object.values(classStats).map((stat: any) => {
      const currentData = stat.monthlyData[currentMonth] || { sessions: 0, attendance: 0, revenue: 0 };
      const previousData = stat.monthlyData[previousMonth] || { sessions: 0, attendance: 0, revenue: 0 };
      
      // Current month calculations
      const currentAvgRevenuePerSession = currentData.sessions > 0 ? currentData.revenue / currentData.sessions : 0;
      const currentRevenuePerAttendee = currentData.attendance > 0 ? currentData.revenue / currentData.attendance : 0;
      const currentRevenueEfficiency = currentData.sessions > 0 ? (currentData.revenue / currentData.sessions) / 1000 : 0; // Revenue efficiency score
      
      // Previous month calculations
      const previousAvgRevenuePerSession = previousData.sessions > 0 ? previousData.revenue / previousData.sessions : 0;
      const previousRevenuePerAttendee = previousData.attendance > 0 ? previousData.revenue / previousData.attendance : 0;
      const previousRevenueEfficiency = previousData.sessions > 0 ? (previousData.revenue / previousData.sessions) / 1000 : 0;
      
      // Growth calculation
      const revenueGrowth = previousData.revenue > 0 ? ((currentData.revenue - previousData.revenue) / previousData.revenue * 100) : 0;
      
      // Overall calculations
      const overallAvgRevenuePerSession = stat.totalSessions > 0 ? stat.totalRevenue / stat.totalSessions : 0;
      const overallRevenuePerAttendee = stat.totalAttendance > 0 ? stat.totalRevenue / stat.totalAttendance : 0;
      const overallRevenueEfficiency = stat.totalSessions > 0 ? (stat.totalRevenue / stat.totalSessions) / 1000 : 0;
      
      return {
        className: stat.className,
        totalRevenue: stat.totalRevenue,
        overallAvgRevenuePerSession,
        overallRevenuePerAttendee,
        overallRevenueEfficiency,
        
        // Current month
        currentRevenue: currentData.revenue,
        currentAvgRevenuePerSession,
        currentRevenuePerAttendee,
        currentRevenueEfficiency,
        currentRevenueGrowth: revenueGrowth,
        
        // Previous month
        previousRevenue: previousData.revenue,
        previousAvgRevenuePerSession,
        previousRevenuePerAttendee,
        previousRevenueEfficiency,
        
        // Changes
        revenueChange: currentData.revenue - previousData.revenue,
        avgRevenuePerSessionChange: currentAvgRevenuePerSession - previousAvgRevenuePerSession,
        revenuePerAttendeeChange: currentRevenuePerAttendee - previousRevenuePerAttendee,
        revenueEfficiencyChange: currentRevenueEfficiency - previousRevenueEfficiency,
        revenueGrowthValue: revenueGrowth
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [data]);

  const metrics = [
    { 
      id: 'totalRevenue' as MetricType, 
      label: 'Total Revenue', 
      icon: DollarSign,
      color: 'purple'
    },
    { 
      id: 'avgRevenuePerSession' as MetricType, 
      label: 'Avg Revenue/Session', 
      icon: Calculator,
      color: 'blue'
    },
    { 
      id: 'revenuePerAttendee' as MetricType, 
      label: 'Revenue/Attendee', 
      icon: Target,
      color: 'green'
    },
    { 
      id: 'revenueEfficiency' as MetricType, 
      label: 'Revenue Efficiency', 
      icon: TrendingUp,
      color: 'orange'
    },
    { 
      id: 'revenueGrowth' as MetricType, 
      label: 'Revenue Growth %', 
      icon: TrendingUp,
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
        <div className="font-medium text-purple-800">{value}</div>
      ),
      className: 'min-w-40'
    },
    {
      key: 'currentRevenue' as keyof typeof tableData[0],
      header: 'Current Month',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'totalRevenue': return formatCurrency(item.currentRevenue);
            case 'avgRevenuePerSession': return formatCurrency(item.currentAvgRevenuePerSession);
            case 'revenuePerAttendee': return formatCurrency(item.currentRevenuePerAttendee);
            case 'revenueEfficiency': return `${item.currentRevenueEfficiency.toFixed(2)}`;
            case 'revenueGrowth': return `${item.currentRevenueGrowth.toFixed(1)}%`;
            default: return '₹0';
          }
        };
        return <div className="font-medium">{getValue()}</div>;
      },
      align: 'center' as const
    },
    {
      key: 'previousRevenue' as keyof typeof tableData[0],
      header: 'Previous Month',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'totalRevenue': return formatCurrency(item.previousRevenue);
            case 'avgRevenuePerSession': return formatCurrency(item.previousAvgRevenuePerSession);
            case 'revenuePerAttendee': return formatCurrency(item.previousRevenuePerAttendee);
            case 'revenueEfficiency': return `${item.previousRevenueEfficiency.toFixed(2)}`;
            case 'revenueGrowth': return '0.0%';
            default: return '₹0';
          }
        };
        return <div className="font-medium">{getValue()}</div>;
      },
      align: 'center' as const
    },
    {
      key: 'revenueChange' as keyof typeof tableData[0],
      header: 'Change',
      render: (value: any, item: any) => {
        const getChange = () => {
          switch (selectedMetric) {
            case 'totalRevenue': return item.revenueChange;
            case 'avgRevenuePerSession': return item.avgRevenuePerSessionChange;
            case 'revenuePerAttendee': return item.revenuePerAttendeeChange;
            case 'revenueEfficiency': return item.revenueEfficiencyChange;
            case 'revenueGrowth': return item.revenueGrowthValue;
            default: return 0;
          }
        };
        
        const change = getChange();
        const isPercentage = selectedMetric === 'revenueGrowth';
        const isCurrency = ['totalRevenue', 'avgRevenuePerSession', 'revenuePerAttendee'].includes(selectedMetric);
        
        const displayValue = isPercentage
          ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
          : isCurrency
          ? `${change >= 0 ? '+' : ''}${formatCurrency(Math.abs(change))}`
          : `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
        
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
      key: 'totalRevenue' as keyof typeof tableData[0],
      header: 'Overall Total',
      render: (value: any, item: any) => {
        const getValue = () => {
          switch (selectedMetric) {
            case 'totalRevenue': return formatCurrency(item.totalRevenue);
            case 'avgRevenuePerSession': return formatCurrency(item.overallAvgRevenuePerSession);
            case 'revenuePerAttendee': return formatCurrency(item.overallRevenuePerAttendee);
            case 'revenueEfficiency': return `${item.overallRevenueEfficiency.toFixed(2)}`;
            case 'revenueGrowth': return `${item.currentRevenueGrowth.toFixed(1)}%`;
            default: return '₹0';
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
      <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
        <div className="text-sm font-medium text-purple-800 mb-2 w-full">Select Revenue Metric:</div>
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