import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionData } from '@/hooks/useSessionsData';
import { 
  Users, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  UserCheck,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface ClassPerformanceMetricCardsProps {
  data: SessionData[];
}

export const ClassPerformanceMetricCards: React.FC<ClassPerformanceMetricCardsProps> = ({ data }) => {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalSessions: 0,
        totalAttendance: 0,
        avgFillRate: 0,
        totalRevenue: 0,
        avgRevenuePerSession: 0,
        emptySessions: 0,
        totalCapacity: 0,
        utilizationRate: 0
      };
    }

    const totalSessions = data.length;
    const totalAttendance = data.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const totalCapacity = data.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const totalRevenue = data.reduce((sum, session) => sum + (session.totalPaid || 0), 0);
    const emptySessions = data.filter(session => (session.checkedInCount || 0) === 0).length;
    
    const avgFillRate = totalCapacity > 0 ? (totalAttendance / totalCapacity) * 100 : 0;
    const avgRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;
    const utilizationRate = totalSessions > 0 ? ((totalSessions - emptySessions) / totalSessions) * 100 : 0;

    return {
      totalSessions,
      totalAttendance,
      avgFillRate,
      totalRevenue,
      avgRevenuePerSession,
      emptySessions,
      totalCapacity,
      utilizationRate
    };
  }, [data]);

  const metricCards = [
    {
      title: 'Total Sessions',
      value: formatNumber(metrics.totalSessions),
      icon: Calendar,
      description: 'Sessions analyzed',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: null
    },
    {
      title: 'Total Attendance',
      value: formatNumber(metrics.totalAttendance),
      icon: Users,
      description: 'Students attended',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: null
    },
    {
      title: 'Average Fill Rate',
      value: `${metrics.avgFillRate.toFixed(1)}%`,
      icon: Target,
      description: 'Capacity utilization',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      change: null
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      description: 'Revenue generated',
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      change: null
    },
    {
      title: 'Avg Revenue/Session',
      value: formatCurrency(metrics.avgRevenuePerSession),
      icon: TrendingUp,
      description: 'Per session revenue',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      change: null
    },
    {
      title: 'Empty Sessions',
      value: formatNumber(metrics.emptySessions),
      icon: AlertTriangle,
      description: 'Zero attendance',
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      change: null
    },
    {
      title: 'Total Capacity',
      value: formatNumber(metrics.totalCapacity),
      icon: UserCheck,
      description: 'Maximum capacity',
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100',
      change: null
    },
    {
      title: 'Utilization Rate',
      value: `${metrics.utilizationRate.toFixed(1)}%`,
      icon: BarChart3,
      description: 'Non-empty sessions',
      gradient: 'from-teal-500 to-teal-600',
      bgGradient: 'from-teal-50 to-teal-100',
      change: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={index} 
            className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br ${metric.bgGradient}`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
              <div className={`w-full h-full bg-gradient-to-br ${metric.gradient} rounded-full opacity-20`} />
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};