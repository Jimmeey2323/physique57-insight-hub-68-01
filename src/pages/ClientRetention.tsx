import React, { useEffect, useState } from 'react';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { ProfessionalLoader } from '@/components/dashboard/ProfessionalLoader';
import { AdvancedExportButton } from '@/components/ui/AdvancedExportButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Target, Users as UsersIcon, Eye, Calendar, PieChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NewClientFilterOptions } from '@/types/dashboard';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';
import { HeroSection } from '@/components/ui/HeroSection';
import { LocationTabs } from '@/components/ui/LocationTabs';

// Import enhanced components
import { EnhancedClientConversionFilterSection } from '@/components/dashboard/EnhancedClientConversionFilterSection';
import { ClientConversionDetailedDataTable } from '@/components/dashboard/ClientConversionDetailedDataTable';
import { EnhancedClientConversionMetrics } from '@/components/dashboard/EnhancedClientConversionMetrics';
import { ClientConversionAdvancedMetrics } from '@/components/dashboard/ClientConversionAdvancedMetrics';
import { ClientConversionDrillDownModal } from '@/components/dashboard/ClientConversionDrillDownModal';
import { ClientConversionTopBottomLists } from '@/components/dashboard/ClientConversionTopBottomLists';
import { ClientConversionCharts } from '@/components/dashboard/ClientConversionCharts';
import { ClientConversionMonthOnMonthTable } from '@/components/dashboard/ClientConversionMonthOnMonthTable';
import { ClientConversionYearOnYearTable } from '@/components/dashboard/ClientConversionYearOnYearTable';
import { ClientConversionMembershipTable } from '@/components/dashboard/ClientConversionMembershipTable';
import { ClientConversionEntityTable } from '@/components/dashboard/ClientConversionEntityTable';

const ClientRetention = () => {
  const { data, loading } = useNewClientData();
  const { isLoading, setLoading } = useGlobalLoading();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [activeTab, setActiveTab] = useState('overview');
  const [drillDownModal, setDrillDownModal] = useState({ isOpen: false, client: null });
  
  // Get previous month date range function
  const getPreviousMonthRange = () => {
    const now = new Date();
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      start: formatDate(firstDayPreviousMonth),
      end: formatDate(lastDayPreviousMonth)
    };
  };
  
  // Filters state
  const [filters, setFilters] = useState<NewClientFilterOptions>(() => {
    const previousMonth = getPreviousMonthRange();
    return {
      dateRange: previousMonth,
      location: [],
      homeLocation: [],
      trainer: [],
      paymentMethod: [],
      retentionStatus: [],
      conversionStatus: [],
      isNew: [],
      minLTV: undefined,
      maxLTV: undefined
    };
  });

  useEffect(() => {
    setLoading(loading, 'Analyzing client conversion and retention patterns...');
  }, [loading, setLoading]);

  // Get unique values for filters (only 3 main locations)
  const uniqueLocations = React.useMemo(() => {
    const mainLocations = ['Kwality House, Kemps Corner', 'Supreme HQ, Bandra', 'Kenkere House, Bengaluru'];
    const locations = new Set<string>();
    data.forEach(client => {
      if (client.firstVisitLocation && mainLocations.includes(client.firstVisitLocation)) {
        locations.add(client.firstVisitLocation);
      }
      if (client.homeLocation && mainLocations.includes(client.homeLocation)) {
        locations.add(client.homeLocation);
      }
    });
    return Array.from(locations).filter(Boolean);
  }, [data]);

  const uniqueTrainers = React.useMemo(() => {
    const trainers = new Set<string>();
    data.forEach(client => {
      if (client.trainerName) trainers.add(client.trainerName);
    });
    return Array.from(trainers).filter(Boolean);
  }, [data]);

  const uniqueMembershipTypes = React.useMemo(() => {
    const types = new Set<string>();
    data.forEach(client => {
      if (client.membershipType) types.add(client.membershipType);
    });
    return Array.from(types).filter(Boolean);
  }, [data]);

  // Filter data based on selected location and filters
  const filteredData = React.useMemo(() => {
    console.log('Filtering data with location:', selectedLocation, 'and filters:', filters);
    let filtered = data;
    
    // Filter by selected location
    if (selectedLocation && selectedLocation !== 'All Locations') {
      filtered = filtered.filter(client => 
        client.firstVisitLocation === selectedLocation || client.homeLocation === selectedLocation
      );
    }
    
    // Apply date filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(client => {
        if (!client.createdDate) return true;
        const clientDate = new Date(client.createdDate);
        return clientDate >= startDate && clientDate <= endDate;
      });
    }
    
    // Apply location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(client => 
        filters.location.includes(client.firstVisitLocation || '') ||
        filters.location.includes(client.homeLocation || '')
      );
    }
    
    if (filters.trainer.length > 0) {
      filtered = filtered.filter(client => 
        filters.trainer.includes(client.trainerName || '')
      );
    }

    // Apply other filters
    if (filters.conversionStatus.length > 0) {
      filtered = filtered.filter(client => 
        filters.conversionStatus.includes(client.conversionStatus || '')
      );
    }

    if (filters.retentionStatus.length > 0) {
      filtered = filtered.filter(client => 
        filters.retentionStatus.includes(client.retentionStatus || '')
      );
    }

    if (filters.paymentMethod.length > 0) {
      filtered = filtered.filter(client => 
        filters.paymentMethod.includes(client.paymentMethod || '')
      );
    }

    if (filters.isNew.length > 0) {
      filtered = filtered.filter(client => 
        filters.isNew.includes(client.isNew || '')
      );
    }

    // Apply LTV filters
    if (filters.minLTV !== undefined) {
      filtered = filtered.filter(client => (client.ltv || 0) >= filters.minLTV!);
    }
    if (filters.maxLTV !== undefined) {
      filtered = filtered.filter(client => (client.ltv || 0) <= filters.maxLTV!);
    }
    
    console.log('Filtered data:', filtered.length, 'records');
    return filtered;
  }, [data, selectedLocation, filters]);

  if (isLoading) {
    return <ProfessionalLoader variant="conversion" subtitle="Analyzing client conversion and retention patterns..." />;
  }

  console.log('Rendering ClientRetention with data:', data.length, 'records, filtered:', filteredData.length);

  // Prepare location data for LocationTabs
  const locationData = [
    { 
      id: 'All Locations', 
      name: 'All Locations', 
      fullName: 'All Locations',
      count: data.length
    },
    {
      id: 'Kwality House, Kemps Corner',
      name: 'Kemps Corner',
      fullName: 'Kwality House, Kemps Corner',
      count: data.filter(client => 
        client.firstVisitLocation === 'Kwality House, Kemps Corner' || client.homeLocation === 'Kwality House, Kemps Corner'
      ).length
    },
    {
      id: 'Supreme HQ, Bandra',
      name: 'Bandra',
      fullName: 'Supreme HQ, Bandra',
      count: data.filter(client => 
        client.firstVisitLocation === 'Supreme HQ, Bandra' || client.homeLocation === 'Supreme HQ, Bandra'
      ).length
    },
    {
      id: 'Kenkere House, Bengaluru',
      name: 'Bengaluru',
      fullName: 'Kenkere House, Bengaluru',
      count: data.filter(client => 
        client.firstVisitLocation === 'Kenkere House, Bengaluru' || client.homeLocation === 'Kenkere House, Bengaluru'
      ).length
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <HeroSection 
        title="Client Conversion & Retention"
        subtitle="Comprehensive client acquisition and retention analysis across all customer touchpoints"
        icon={Users}
        variant="client"
      />

      <div className="container mx-auto px-6 py-8">
        <main className="space-y-8">
          {/* Enhanced Filter Section */}
          <EnhancedClientConversionFilterSection
            filters={filters}
            onFiltersChange={setFilters}
            locations={uniqueLocations}
            trainers={uniqueTrainers}
            membershipTypes={uniqueMembershipTypes}
          />

          {/* Consolidated Location Tabs */}
          <LocationTabs 
            locations={locationData}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            variant="buttons"
            showCounts={true}
          />

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-4">
                <TabsList className="grid w-full grid-cols-7 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger value="overview" className="text-sm font-medium">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-sm font-medium">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="text-sm font-medium">
                    <PieChart className="w-4 h-4 mr-2" />
                    Charts
                  </TabsTrigger>
                  <TabsTrigger value="monthonmonth" className="text-sm font-medium">
                    <Target className="w-4 h-4 mr-2" />
                    Month/Month
                  </TabsTrigger>
                  <TabsTrigger value="yearonyear" className="text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    Year/Year
                  </TabsTrigger>
                  <TabsTrigger value="memberships" className="text-sm font-medium">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Memberships
                  </TabsTrigger>
                  <TabsTrigger value="detailed" className="text-sm font-medium">
                    <Eye className="w-4 h-4 mr-2" />
                    Detailed
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            <TabsContent value="overview" className="space-y-8">
              <EnhancedClientConversionMetrics data={filteredData} />
              <ClientConversionAdvancedMetrics data={filteredData} />
              <ClientConversionTopBottomLists data={filteredData} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              <ClientConversionEntityTable data={filteredData} />
            </TabsContent>

            <TabsContent value="charts" className="space-y-8">
              <ClientConversionCharts data={filteredData} />
            </TabsContent>

            <TabsContent value="monthonmonth" className="space-y-8">
              <ClientConversionMonthOnMonthTable data={filteredData} />
            </TabsContent>

            <TabsContent value="yearonyear" className="space-y-8">
              <ClientConversionYearOnYearTable data={filteredData} />
            </TabsContent>

            <TabsContent value="memberships" className="space-y-8">
              <ClientConversionMembershipTable data={filteredData} />
            </TabsContent>

            <TabsContent value="detailed" className="space-y-8">
              <ClientConversionDetailedDataTable
                data={filteredData}
                onItemClick={(client) => setDrillDownModal({
                  isOpen: true,
                  client: client
                })}
              />
            </TabsContent>
          </Tabs>

          <AdvancedExportButton 
            newClientData={filteredData} 
            selectedLocation={selectedLocation}
          />
        </main>
      </div>

      <ClientConversionDrillDownModal 
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal({ isOpen: false, client: null })}
        client={drillDownModal.client}
      />
      
      <Footer />
    </div>
  );
};

export default ClientRetention;