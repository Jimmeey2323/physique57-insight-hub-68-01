import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionData } from '@/hooks/useSessionsData';
import { ClassPerformanceFilterSection } from './ClassPerformanceFilterSection';
import { ClassPerformanceMetricCards } from './ClassPerformanceMetricCards';
import { ClassPerformanceCharts } from './ClassPerformanceCharts';
import { ClassAttendanceTable } from './ClassAttendanceTable';
import { ClassEfficiencyTable } from './ClassEfficiencyTable';
import { ClassRevenueTable } from './ClassRevenueTable';
import { ClassUtilizationTable } from './ClassUtilizationTable';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

interface ClassPerformanceAnalysisSectionProps {
  data: SessionData[];
}

const locations = [
  { id: 'all', name: 'All Locations', fullName: 'All Locations' },
  { id: 'kwality', name: 'Kwality House', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

export const ClassPerformanceAnalysisSection: React.FC<ClassPerformanceAnalysisSectionProps> = ({ data }) => {
  const [activeLocation, setActiveLocation] = useState('all');
  const [filters, setFilters] = useState({
    dateRange: { start: null as Date | null, end: null as Date | null },
    classTypes: [] as string[],
    trainers: [] as string[]
  });

  // Filter data by location
  const locationFilteredData = useMemo(() => {
    if (activeLocation === 'all') return data;
    
    const selectedLocation = locations.find(loc => loc.id === activeLocation);
    if (!selectedLocation) return data;

    return data.filter(session => {
      if (session.location === selectedLocation.fullName) return true;
      
      const sessionLoc = session.location?.toLowerCase() || '';
      const targetLoc = selectedLocation.fullName.toLowerCase();
      
      if (selectedLocation.id === 'kwality' && sessionLoc.includes('kwality')) return true;
      if (selectedLocation.id === 'supreme' && sessionLoc.includes('supreme')) return true;
      if (selectedLocation.id === 'kenkere' && sessionLoc.includes('kenkere')) return true;
      
      return false;
    });
  }, [data, activeLocation]);

  // Apply additional filters
  const filteredData = useMemo(() => {
    let filtered = [...locationFilteredData];

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.date);
        if (filters.dateRange.start && sessionDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && sessionDate > filters.dateRange.end) return false;
        return true;
      });
    }

    // Class types filter
    if (filters.classTypes.length > 0) {
      filtered = filtered.filter(session => 
        filters.classTypes.includes(session.cleanedClass)
      );
    }

    // Trainers filter
    if (filters.trainers.length > 0) {
      filtered = filtered.filter(session => 
        filters.trainers.includes(session.trainerName)
      );
    }

    return filtered;
  }, [locationFilteredData, filters]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full px-6 py-3 border border-blue-200">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-800">Class Performance Analytics</span>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Comprehensive Class Analysis
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Deep dive into class format performance, attendance patterns, revenue analytics, and operational efficiency metrics
        </p>
      </div>

      {/* Filter Section */}
      <ClassPerformanceFilterSection 
        data={data} 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {/* Location Tabs */}
      <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
        <CardContent className="p-2">
          <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl h-auto gap-2">
              {locations.map((location) => (
                <TabsTrigger
                  key={location.id}
                  value={location.id}
                  className="rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-md"
                >
                  <div className="text-center">
                    <div className="font-bold">{location.name}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {locations.map((location) => (
              <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
                {/* Metric Cards */}
                <ClassPerformanceMetricCards data={filteredData} />
                
                {/* Interactive Charts */}
                <ClassPerformanceCharts data={filteredData} />
                
                {/* Performance Tables */}
                <div className="space-y-8">
                  {/* Attendance Performance Table */}
                  <Card className="border border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Users className="w-5 h-5" />
                        Class Attendance Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ClassAttendanceTable data={filteredData} />
                    </CardContent>
                  </Card>

                  {/* Efficiency Analysis Table */}
                  <Card className="border border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <TrendingUp className="w-5 h-5" />
                        Class Efficiency Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ClassEfficiencyTable data={filteredData} />
                    </CardContent>
                  </Card>

                  {/* Revenue Performance Table */}
                  <Card className="border border-purple-200 bg-gradient-to-br from-purple-50/50 to-violet-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <DollarSign className="w-5 h-5" />
                        Revenue Performance Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ClassRevenueTable data={filteredData} />
                    </CardContent>
                  </Card>

                  {/* Utilization Analysis Table */}
                  <Card className="border border-orange-200 bg-gradient-to-br from-orange-50/50 to-red-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <BarChart3 className="w-5 h-5" />
                        Class Utilization Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ClassUtilizationTable data={filteredData} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};