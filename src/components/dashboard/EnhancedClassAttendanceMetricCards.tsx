import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, Target, TrendingUp, Star, Clock, DollarSign, MapPin, BarChart3, Award, Activity, Zap, Building2, ArrowUp, ArrowDown } from 'lucide-react';
import { SessionData } from '@/hooks/useSessionsData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface EnhancedClassAttendanceMetricCardsProps {
  data: SessionData[];
}
export const EnhancedClassAttendanceMetricCards: React.FC<EnhancedClassAttendanceMetricCardsProps> = ({
  data
}) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;
    const totalSessions = data.length;
    const totalAttendance = data.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const totalCapacity = data.reduce((sum, session) => sum + (session.capacity || 0), 0);
    const totalRevenue = data.reduce((sum, session) => sum + (session.totalPaid || 0), 0);
    const totalBooked = data.reduce((sum, session) => sum + (session.bookedCount || 0), 0);
    const totalLateCancelled = data.reduce((sum, session) => sum + (session.lateCancelledCount || 0), 0);
    const uniqueClasses = [...new Set(data.map(session => session.cleanedClass || session.classType).filter(Boolean))];
    const uniqueTrainers = [...new Set(data.map(session => session.trainerName).filter(Boolean))];
    const uniqueLocations = [...new Set(data.map(session => session.location).filter(Boolean))];
    const avgAttendance = totalSessions > 0 ? Math.round(totalAttendance / totalSessions) : 0;
    const fillRate = totalCapacity > 0 ? Math.round(totalAttendance / totalCapacity * 100) : 0;
    const avgRevenue = totalSessions > 0 ? Math.round(totalRevenue / totalSessions) : 0;
    const bookingRate = totalCapacity > 0 ? Math.round(totalBooked / totalCapacity * 100) : 0;
    const cancellationRate = totalBooked > 0 ? Math.round(totalLateCancelled / totalBooked * 100) : 0;
    const noShowRate = totalBooked > 0 ? Math.round((totalBooked - totalAttendance - totalLateCancelled) / totalBooked * 100) : 0;

    // Peak hours analysis
    const hourlyData = data.reduce((acc, session) => {
      const hour = session.time?.split(':')[0] || 'Unknown';
      if (!acc[hour]) acc[hour] = {
        sessions: 0,
        attendance: 0
      };
      acc[hour].sessions += 1;
      acc[hour].attendance += session.checkedInCount || 0;
      return acc;
    }, {} as Record<string, {
      sessions: number;
      attendance: number;
    }>);
    const peakHour = Object.entries(hourlyData).sort(([, a], [, b]) => b.attendance - a.attendance)[0];

    // Day of week analysis
    const dayData = data.reduce((acc, session) => {
      const day = session.dayOfWeek || 'Unknown';
      if (!acc[day]) acc[day] = {
        sessions: 0,
        attendance: 0
      };
      acc[day].sessions += 1;
      acc[day].attendance += session.checkedInCount || 0;
      return acc;
    }, {} as Record<string, {
      sessions: number;
      attendance: number;
    }>);
    const peakDay = Object.entries(dayData).sort(([, a], [, b]) => b.attendance - a.attendance)[0];

    // Best performing class by average attendance
    const classPerformance = data.reduce((acc, session) => {
      const className = session.cleanedClass || session.classType || 'Unknown';
      if (!acc[className]) {
        acc[className] = {
          totalAttendance: 0,
          sessionCount: 0,
          revenue: 0
        };
      }
      acc[className].totalAttendance += session.checkedInCount || 0;
      acc[className].sessionCount += 1;
      acc[className].revenue += session.totalPaid || 0;
      return acc;
    }, {} as Record<string, {
      totalAttendance: number;
      sessionCount: number;
      revenue: number;
    }>);
    const bestClass = Object.entries(classPerformance).map(([name, stats]) => ({
      name,
      avgAttendance: Math.round(stats.totalAttendance / stats.sessionCount),
      totalRevenue: stats.revenue
    })).sort((a, b) => b.avgAttendance - a.avgAttendance)[0];

    // Trainer performance
    const trainerPerformance = data.reduce((acc, session) => {
      const trainer = session.trainerName || 'Unknown';
      if (!acc[trainer]) {
        acc[trainer] = {
          sessions: 0,
          attendance: 0,
          revenue: 0
        };
      }
      acc[trainer].sessions += 1;
      acc[trainer].attendance += session.checkedInCount || 0;
      acc[trainer].revenue += session.totalPaid || 0;
      return acc;
    }, {} as Record<string, {
      sessions: number;
      attendance: number;
      revenue: number;
    }>);
    const topTrainer = Object.entries(trainerPerformance).map(([name, stats]) => ({
      name,
      avgAttendance: Math.round(stats.attendance / stats.sessions),
      totalSessions: stats.sessions
    })).sort((a, b) => b.avgAttendance - a.avgAttendance)[0];
    return {
      totalSessions,
      totalAttendance,
      avgAttendance,
      fillRate,
      avgRevenue,
      totalRevenue,
      bookingRate,
      cancellationRate,
      noShowRate,
      uniqueClasses: uniqueClasses.length,
      uniqueTrainers: uniqueTrainers.length,
      uniqueLocations: uniqueLocations.length,
      peakHour: peakHour ? {
        hour: peakHour[0],
        attendance: peakHour[1].attendance
      } : null,
      peakDay: peakDay ? {
        day: peakDay[0],
        attendance: peakDay[1].attendance
      } : null,
      bestClass,
      topTrainer
    };
  }, [data]);
  if (!metrics) return null;
  const cards = [{
    title: 'Total Sessions',
    value: metrics.totalSessions.toLocaleString(),
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    description: 'Total class sessions conducted',
    trend: '+12%',
    trendUp: true,
    details: [`Avg per day: ${Math.round(metrics.totalSessions / 30)}`, `${metrics.uniqueClasses} unique formats`, `${metrics.uniqueTrainers} trainers involved`]
  }, {
    title: 'Total Attendance',
    value: metrics.totalAttendance.toLocaleString(),
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
    borderColor: 'border-green-200',
    description: 'Total participants across all sessions',
    trend: '+8%',
    trendUp: true,
    details: [`Peak day: ${metrics.peakDay?.day} (${metrics.peakDay?.attendance})`, `Peak hour: ${metrics.peakHour?.hour}:00 (${metrics.peakHour?.attendance})`, `Avg per session: ${metrics.avgAttendance}`]
  }, {
    title: 'Average Attendance',
    value: metrics.avgAttendance.toString(),
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
    borderColor: 'border-purple-200',
    description: 'Average attendees per session',
    progress: metrics.avgAttendance / 25 * 100,
    details: [`Fill rate: ${metrics.fillRate}%`, `Booking rate: ${metrics.bookingRate}%`, `Best class avg: ${metrics.bestClass?.avgAttendance || 0}`]
  }, {
    title: 'Fill Rate',
    value: `${metrics.fillRate}%`,
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
    borderColor: 'border-orange-200',
    description: 'Capacity utilization rate',
    progress: metrics.fillRate,
    trend: metrics.fillRate >= 75 ? '+5%' : '-2%',
    trendUp: metrics.fillRate >= 75,
    details: [`Booking rate: ${metrics.bookingRate}%`, `No-show rate: ${metrics.noShowRate}%`, `Cancellation rate: ${metrics.cancellationRate}%`]
  }, {
    title: 'Total Revenue',
    value: `₹${metrics.totalRevenue.toLocaleString()}`,
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    borderColor: 'border-emerald-200',
    description: 'Total revenue generated',
    trend: '+15%',
    trendUp: true,
    details: [`Avg per session: ₹${metrics.avgRevenue.toLocaleString()}`, `Top class revenue: ₹${metrics.bestClass?.totalRevenue.toLocaleString() || 0}`, `Revenue per attendee: ₹${Math.round(metrics.totalRevenue / metrics.totalAttendance)}`]
  }, {
    title: 'Class Formats',
    value: metrics.uniqueClasses.toString(),
    icon: Star,
    color: 'text-indigo-600',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    borderColor: 'border-indigo-200',
    description: 'Unique class formats offered',
    details: [`Top format: ${metrics.bestClass?.name || 'N/A'}`, `Avg attendance: ${metrics.bestClass?.avgAttendance || 0}`, `${metrics.uniqueLocations} locations`]
  }, {
    title: 'Peak Performance',
    value: metrics.peakDay?.day || 'N/A',
    icon: Award,
    color: 'text-rose-600',
    bgColor: 'bg-gradient-to-br from-rose-50 to-rose-100',
    borderColor: 'border-rose-200',
    description: 'Best performing day',
    details: [`Peak attendance: ${metrics.peakDay?.attendance || 0}`, `Peak hour: ${metrics.peakHour?.hour || 'N/A'}:00`, `Top trainer: ${metrics.topTrainer?.name || 'N/A'}`]
  }, {
    title: 'Active Trainers',
    value: metrics.uniqueTrainers.toString(),
    icon: Users,
    color: 'text-cyan-600',
    bgColor: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
    borderColor: 'border-cyan-200',
    description: 'Trainers conducting sessions',
    details: [`Top trainer: ${metrics.topTrainer?.name || 'N/A'}`, `Avg attendance: ${metrics.topTrainer?.avgAttendance || 0}`, `Sessions: ${metrics.topTrainer?.totalSessions || 0}`]
  }];
  return <TooltipProvider>
      
    </TooltipProvider>;
};