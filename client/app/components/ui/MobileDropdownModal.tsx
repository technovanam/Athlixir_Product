'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
  subtext?: string;
}

interface MobileDropdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: Option[] | string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export default function MobileDropdownModal({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: MobileDropdownModalProps) {
  const normalizedOptions: Option[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-[440px] bg-[#FFFFFF] rounded-t-[32px] sm:rounded-[28px] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Grab Handle */}
            <div className="w-full pt-3 pb-1 flex justify-center sm:hidden">
              <div className="w-10 h-1.5 bg-zinc-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-[#EBEBEB]">
              <h3
                style={{
                  fontFamily: "'Mazzard', sans-serif",
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#1D1B20',
                }}
              >
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-[#FAFAFA] border border-[#EFEFEF] flex items-center justify-center text-zinc-500 hover:text-zinc-900 active:scale-95 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Options List */}
            <div className="p-4 space-y-2.5 overflow-y-auto max-h-[50vh]">
              {normalizedOptions.map((opt) => {
                const isSelected = selectedValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSelect(opt.value);
                      onClose();
                    }}
                    style={{
                      boxSizing: 'border-box',
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: '20px',
                      backgroundColor: isSelected ? '#FFF8F5' : '#FFFFFF',
                      border: isSelected ? '1.5px solid #FF4F21' : '1px solid #EBEBEB',
                      boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.06)',
                    }}
                    className="flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "'Mazzard', sans-serif",
                          fontWeight: 600,
                          fontSize: '15px',
                          color: isSelected ? '#FF4F21' : '#1D1B20',
                        }}
                      >
                        {opt.label}
                      </div>
                      {opt.subtext && (
                        <div
                          style={{
                            fontFamily: "'Mazzard', sans-serif",
                            fontSize: '12px',
                            color: '#6E6D6D',
                            marginTop: '2px',
                          }}
                        >
                          {opt.subtext}
                        </div>
                      )}
                    </div>

                    <div
                      className="rounded-full flex items-center justify-center shrink-0 ml-3"
                      style={{
                        width: '22px',
                        height: '22px',
                        backgroundColor: isSelected ? '#FF4F21' : '#EBEBEB',
                      }}
                    >
                      {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Safe Area Padding */}
            <div
              className="p-4 pt-2 border-t border-[#EBEBEB]"
              style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  height: '50px',
                  backgroundColor: '#FF4F21',
                  borderRadius: '24px',
                  fontFamily: "'Mazzard', sans-serif",
                  fontWeight: 600,
                  fontSize: '15px',
                  color: '#FFFFFF',
                }}
                className="flex items-center justify-center active:scale-[0.98] transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
