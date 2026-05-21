'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type DateRange = 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days' | 'This Year' | 'All Time';

interface DateFilterContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>('Last 30 Days');

  return (
    <DateFilterContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
}
