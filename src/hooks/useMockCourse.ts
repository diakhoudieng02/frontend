// src/hooks/useMockCourse.ts
import { useState, useEffect } from 'react';
import { mockCourseWithOutputs, mockCourseWithoutOutputs, mockCoursePartialOutputs } from '@/data/mockCourseData';

const MOCK_MODES = {
  FULL: 'full',
  EMPTY: 'empty',
  PARTIAL: 'partial',
  ERROR: 'error'
} as const;

type MockMode = typeof MOCK_MODES[keyof typeof MOCK_MODES];

export function useMockCourse(enableMock: boolean = false, mode: MockMode = 'full') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!enableMock) return;
    
    setLoading(true);
    
    // Simuler un délai réseau
    const timer = setTimeout(() => {
      switch(mode) {
        case 'full':
          setData(mockCourseWithOutputs);
          break;
        case 'empty':
          setData(mockCourseWithoutOutputs);
          break;
        case 'partial':
          setData(mockCoursePartialOutputs);
          break;
        case 'error':
          setData(null);
          break;
      }
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [enableMock, mode]);
  
  return { data, loading };
}