import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { SessionData } from '@/hooks/useSessionsData';
import { 
  Filter, 
  X, 
  ChevronDown, 
  Calendar as CalendarIcon,
  Users,
  Dumbbell,
  RotateCcw
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface ClassPerformanceFilterSectionProps {
  data: SessionData[];
  filters: {
    dateRange: { start: Date | null; end: Date | null };
    classTypes: string[];
    trainers: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export const ClassPerformanceFilterSection: React.FC<ClassPerformanceFilterSectionProps> = ({
  data,
  filters,
  onFiltersChange
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Extract unique values for filters
  const uniqueClassTypes = useMemo(() => {
    const types = new Set(data.map(session => session.cleanedClass).filter(Boolean));
    return Array.from(types).sort();
  }, [data]);

  const uniqueTrainers = useMemo(() => {
    const trainers = new Set(data.map(session => session.trainerName).filter(Boolean));
    return Array.from(trainers).sort();
  }, [data]);

  const handleClassTypeToggle = (classType: string) => {
    const updatedTypes = filters.classTypes.includes(classType)
      ? filters.classTypes.filter(t => t !== classType)
      : [...filters.classTypes, classType];
    
    onFiltersChange({ ...filters, classTypes: updatedTypes });
  };

  const handleTrainerToggle = (trainer: string) => {
    const updatedTrainers = filters.trainers.includes(trainer)
      ? filters.trainers.filter(t => t !== trainer)
      : [...filters.trainers, trainer];
    
    onFiltersChange({ ...filters, trainers: updatedTrainers });
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        start: range?.from || null,
        end: range?.to || null
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: { start: null, end: null },
      classTypes: [],
      trainers: []
    });
  };

  const activeFiltersCount = filters.classTypes.length + filters.trainers.length + 
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0);

  return (
    <Card className="border border-slate-200 bg-gradient-to-r from-slate-50/50 to-blue-50/50 shadow-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Advanced Filters</h3>
                <p className="text-sm text-slate-600">Customize your class performance analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  {activeFiltersCount} active
                </Badge>
              )}
              <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-6 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date Range
                </label>
                <DatePickerWithRange
                  value={{
                    from: filters.dateRange.start || undefined,
                    to: filters.dateRange.end || undefined
                  }}
                  onChange={handleDateRangeChange}
                  className="w-full"
                />
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <div className="text-xs text-slate-600">
                    {filters.dateRange.start && formatDate(filters.dateRange.start.toISOString())}
                    {filters.dateRange.start && filters.dateRange.end && ' - '}
                    {filters.dateRange.end && formatDate(filters.dateRange.end.toISOString())}
                  </div>
                )}
              </div>

              {/* Class Types Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Class Types
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between text-left font-normal"
                    >
                      {filters.classTypes.length === 0 
                        ? "Select class types..." 
                        : `${filters.classTypes.length} selected`
                      }
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Class Types</h4>
                        {filters.classTypes.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, classTypes: [] })}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {uniqueClassTypes.map((classType) => (
                          <div key={classType} className="flex items-center space-x-2">
                            <Checkbox
                              id={`class-${classType}`}
                              checked={filters.classTypes.includes(classType)}
                              onCheckedChange={() => handleClassTypeToggle(classType)}
                            />
                            <label
                              htmlFor={`class-${classType}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {classType}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {filters.classTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.classTypes.slice(0, 3).map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => handleClassTypeToggle(type)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                    {filters.classTypes.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{filters.classTypes.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Trainers Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Trainers
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between text-left font-normal"
                    >
                      {filters.trainers.length === 0 
                        ? "Select trainers..." 
                        : `${filters.trainers.length} selected`
                      }
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Trainers</h4>
                        {filters.trainers.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, trainers: [] })}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {uniqueTrainers.map((trainer) => (
                          <div key={trainer} className="flex items-center space-x-2">
                            <Checkbox
                              id={`trainer-${trainer}`}
                              checked={filters.trainers.includes(trainer)}
                              onCheckedChange={() => handleTrainerToggle(trainer)}
                            />
                            <label
                              htmlFor={`trainer-${trainer}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {trainer}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {filters.trainers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.trainers.slice(0, 2).map((trainer) => (
                      <Badge key={trainer} variant="secondary" className="text-xs">
                        {trainer.split(' ')[0]}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => handleTrainerToggle(trainer)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                    {filters.trainers.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{filters.trainers.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Clear All Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Actions</label>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  disabled={activeFiltersCount === 0}
                  className="w-full gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};