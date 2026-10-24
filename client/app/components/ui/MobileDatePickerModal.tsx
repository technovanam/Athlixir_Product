'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function MobileDatePickerModal({
  isOpen,
  onClose,
  title = 'Select Date',
  value,
  onChange,
}: MobileDatePickerModalProps) {
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  // Parse initial date or default to 2000-01-01
  const initialDate = value ? new Date(value) : new Date(2000, 0, 1);
  const [selectedYear, setSelectedYear] = useState(
    isNaN(initialDate.getFullYear()) ? 2000 : initialDate.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    isNaN(initialDate.getMonth()) ? 0 : initialDate.getMonth()
  );
  const [selectedDay, setSelectedDay] = useState(
    isNaN(initialDate.getDate()) ? 15 : initialDate.getDate()
  );

  const yearScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          setSelectedYear(y);
          setSelectedMonth(m);
          setSelectedDay(d);
        }
      }
    }
  }, [value, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setViewMode('days');
    }
  }, [isOpen]);

  // Auto-scroll to selected year when switching to 'years' view
  useEffect(() => {
    if (viewMode === 'years' && yearScrollRef.current) {
      const selectedEl = yearScrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [viewMode]);

  // Compute days in month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  // Get starting day of the week (0 = Sun, 1 = Mon ... adjust for Mon start)
  const firstDayIndex = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7;

  // Make sure day does not exceed maximum days in month
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleConfirm = () => {
    const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
    const formattedDay = String(selectedDay).padStart(2, '0');
    const result = `${selectedYear}-${formattedMonth}-${formattedDay}`;
    onChange(result);
    onClose();
  };

  const currentYearNum = new Date().getFullYear();
  const yearOptions = Array.from({ length: 75 }, (_, i) => currentYearNum - 70 + i);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer / Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-[440px] bg-white rounded-t-[32px] sm:rounded-[28px] shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
            style={{
              boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Grab Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-[#EBEBEB] rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pt-3 pb-3 flex items-center justify-between border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFF2EE' }}
                >
                  <CalendarIcon size={16} color="#FF4F21" />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Mazzard', sans-serif",
                      fontWeight: 600,
                      fontSize: '17px',
                      color: '#1D1B20',
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Mazzard', sans-serif",
                      fontSize: '12px',
                      color: '#FF4F21',
                      fontWeight: 600,
                    }}
                  >
                    {MONTH_NAMES[selectedMonth]} {selectedDay}, {selectedYear}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-[#FAFAFA] border border-[#EFEFEF] flex items-center justify-center text-zinc-500 hover:text-zinc-900 active:scale-95 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Subheader / Mode Switchers */}
            <div className="px-6 pt-3 pb-2 flex items-center justify-between bg-[#FCFCFC] border-b border-[#F4F4F4]">
              {viewMode === 'days' ? (
                <>
                  <div className="flex items-center gap-2">
                    {/* Month Picker Pill */}
                    <button
                      type="button"
                      onClick={() => setViewMode('months')}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#EBEBEB] flex items-center gap-1.5 text-xs font-semibold text-[#1D1B20] hover:border-[#FF4F21] active:scale-95 transition shadow-sm cursor-pointer"
                    >
                      <span>{MONTH_NAMES[selectedMonth]}</span>
                      <span className="text-[#FF4F21] text-[10px]">▼</span>
                    </button>

                    {/* Year Picker Pill */}
                    <button
                      type="button"
                      onClick={() => setViewMode('years')}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#EBEBEB] flex items-center gap-1.5 text-xs font-semibold text-[#1D1B20] hover:border-[#FF4F21] active:scale-95 transition shadow-sm cursor-pointer"
                    >
                      <span>{selectedYear}</span>
                      <span className="text-[#FF4F21] text-[10px]">▼</span>
                    </button>
                  </div>

                  {/* Previous / Next Month Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="h-8 w-8 rounded-full bg-white border border-[#EBEBEB] flex items-center justify-center text-zinc-700 hover:text-[#FF4F21] hover:border-[#FF4F21] active:scale-90 transition shadow-sm cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="h-8 w-8 rounded-full bg-white border border-[#EBEBEB] flex items-center justify-center text-zinc-700 hover:text-[#FF4F21] hover:border-[#FF4F21] active:scale-90 transition shadow-sm cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setViewMode('days')}
                    className="flex items-center gap-1 text-xs font-semibold text-[#FF4F21] hover:underline cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    <span>Back to Calendar</span>
                  </button>
                  <span className="text-xs font-semibold text-zinc-500">
                    {viewMode === 'months' ? 'Select Month' : 'Select Year'}
                  </span>
                </div>
              )}
            </div>

            {/* Body content based on active view mode */}
            <div className="p-4 overflow-y-auto flex-1 max-h-[340px]">
              {/* 1. DAYS VIEW */}
              {viewMode === 'days' && (
                <div className="px-2">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {DAYS_OF_WEEK.map((d) => (
                      <span
                        key={d}
                        style={{
                          fontFamily: "'Mazzard', sans-serif",
                          fontWeight: 600,
                          fontSize: '12px',
                          color: '#8C8C8C',
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Day Cells Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {/* Empty padding cells */}
                    {Array.from({ length: firstDayIndex }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="h-9 w-9" />
                    ))}

                    {/* Actual Days */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const isSelected = selectedDay === dayNum;
                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() => setSelectedDay(dayNum)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#FF4F21' : 'transparent',
                            color: isSelected ? '#FFFFFF' : '#1D1B20',
                            fontWeight: isSelected ? 700 : 500,
                            fontFamily: "'Mazzard', sans-serif",
                            fontSize: '14px',
                            boxShadow: isSelected ? '0px 2px 8px rgba(255, 79, 33, 0.4)' : 'none',
                          }}
                          className="mx-auto flex items-center justify-center active:scale-90 transition-all cursor-pointer hover:bg-orange-50"
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. MONTHS APP VIEW */}
              {viewMode === 'months' && (
                <div className="grid grid-cols-3 gap-2.5 py-1">
                  {MONTH_NAMES.map((mName, idx) => {
                    const isSelected = selectedMonth === idx;
                    return (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(idx);
                          setViewMode('days');
                        }}
                        style={{
                          backgroundColor: isSelected ? '#FF4F21' : '#FAFAFA',
                          color: isSelected ? '#FFFFFF' : '#1D1B20',
                          borderColor: isSelected ? '#FF4F21' : '#EBEBEB',
                          boxShadow: isSelected ? '0px 2px 8px rgba(255, 79, 33, 0.35)' : 'none',
                        }}
                        className="py-3 px-2 rounded-2xl border text-center transition active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 hover:border-[#FF4F21]"
                      >
                        <span className="font-bold text-sm">{MONTH_SHORT[idx]}</span>
                        <span
                          className="text-[11px]"
                          style={{ color: isSelected ? '#FFE8E0' : '#8C8C8C' }}
                        >
                          {mName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. YEARS APP VIEW */}
              {viewMode === 'years' && (
                <div
                  ref={yearScrollRef}
                  className="grid grid-cols-4 gap-2 py-1 max-h-[300px] overflow-y-auto pr-1"
                >
                  {yearOptions.map((yr) => {
                    const isSelected = selectedYear === yr;
                    return (
                      <button
                        key={yr}
                        type="button"
                        data-selected={isSelected ? 'true' : 'false'}
                        onClick={() => {
                          setSelectedYear(yr);
                          setViewMode('days');
                        }}
                        style={{
                          backgroundColor: isSelected ? '#FF4F21' : '#FAFAFA',
                          color: isSelected ? '#FFFFFF' : '#1D1B20',
                          borderColor: isSelected ? '#FF4F21' : '#EBEBEB',
                          boxShadow: isSelected ? '0px 2px 8px rgba(255, 79, 33, 0.35)' : 'none',
                        }}
                        className="py-2.5 rounded-xl border text-center font-bold text-xs transition active:scale-95 cursor-pointer hover:border-[#FF4F21]"
                      >
                        {yr}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Confirm Action */}
            <div
              className="p-4 pt-2 border-t border-[#EBEBEB] bg-white"
              style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
            >
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: '#FF4F21',
                  borderRadius: '26px',
                  fontFamily: "'Mazzard', sans-serif",
                  fontWeight: 600,
                  fontSize: '15px',
                  color: '#FFFFFF',
                  boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.15)',
                }}
                className="flex items-center justify-center active:scale-[0.98] transition cursor-pointer"
              >
                Set Date ({MONTH_SHORT[selectedMonth]} {selectedDay}, {selectedYear})
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
