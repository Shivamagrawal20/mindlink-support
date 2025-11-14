import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { moodAPI } from '@/lib/api';

interface CheckInStatus {
  needsCheckIn: boolean;
  isLoading: boolean;
  lastCheckIn: Date | null;
}

/**
 * Hook to check if user needs to complete daily mood check-in
 * Checks:
 * 1. On login (if no check-in today)
 * 2. After 24 hours since last check-in
 * 3. Daily reset at midnight
 */
export const useDailyCheckIn = () => {
  const { user, isAuthenticated } = useUser();
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus>({
    needsCheckIn: false,
    isLoading: true,
    lastCheckIn: null,
  });

  const checkIfNeedsCheckIn = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCheckInStatus({
        needsCheckIn: false,
        isLoading: false,
        lastCheckIn: null,
      });
      return;
    }

    try {
      setCheckInStatus(prev => ({ ...prev, isLoading: true }));
      const response = await moodAPI.getLastCheckIn();
      
      const hasCheckedInToday = response.hasCheckedInToday || false;
      const lastCheckInStr = response.lastCheckIn;
      
      if (hasCheckedInToday) {
        // User has checked in today, but check if it's been 24 hours
        if (lastCheckInStr) {
          const lastCheckIn = new Date(lastCheckInStr);
          const now = new Date();
          const hoursSinceCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
          
          // If it's been more than 24 hours, they need to check in again
          if (hoursSinceCheckIn >= 24) {
            setCheckInStatus({
              needsCheckIn: true,
              isLoading: false,
              lastCheckIn,
            });
            return;
          }
        }
        
        setCheckInStatus({
          needsCheckIn: false,
          isLoading: false,
          lastCheckIn: lastCheckInStr ? new Date(lastCheckInStr) : null,
        });
      } else {
        // User hasn't checked in today - they need to
        setCheckInStatus({
          needsCheckIn: true,
          isLoading: false,
          lastCheckIn: lastCheckInStr ? new Date(lastCheckInStr) : null,
        });
      }
    } catch (error: any) {
      console.error('Error checking check-in status:', error);
      
      // Handle authentication errors - user needs to sign in
      if (error.isAuthError || error.message?.includes('Not authorized')) {
        setCheckInStatus({
          needsCheckIn: false, // Don't show check-in if not authenticated
          isLoading: false,
          lastCheckIn: null,
        });
        return;
      }
      
      // If it's a connection error, don't assume they need check-in
      // This prevents showing check-in when backend is down
      if (error.message?.includes('Cannot connect to server') || 
          error.message?.includes('ERR_CONNECTION_REFUSED') ||
          error.message?.includes('Failed to fetch')) {
        setCheckInStatus({
          needsCheckIn: false, // Don't force check-in if backend is down
          isLoading: false,
          lastCheckIn: null,
        });
        return;
      }
      
      // On other errors, assume they need to check in (safe default)
      setCheckInStatus({
        needsCheckIn: true,
        isLoading: false,
        lastCheckIn: null,
      });
    }
  }, [user, isAuthenticated]);

  // Check on mount and when user changes
  useEffect(() => {
    checkIfNeedsCheckIn();
  }, [checkIfNeedsCheckIn]);

  // Check at midnight (daily reset)
  useEffect(() => {
    if (!isAuthenticated) return;

    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    // Set timeout for midnight check
    const midnightTimeout = setTimeout(() => {
      checkIfNeedsCheckIn();
      // Set interval to check every day at midnight
      const dailyInterval = setInterval(() => {
        checkIfNeedsCheckIn();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, [isAuthenticated, checkIfNeedsCheckIn]);

  // Also check every hour to catch 24-hour mark
  useEffect(() => {
    if (!isAuthenticated) return;

    const hourlyInterval = setInterval(() => {
      checkIfNeedsCheckIn();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(hourlyInterval);
  }, [isAuthenticated, checkIfNeedsCheckIn]);

  return {
    needsCheckIn: checkInStatus.needsCheckIn,
    isLoading: checkInStatus.isLoading,
    lastCheckIn: checkInStatus.lastCheckIn,
    refresh: checkIfNeedsCheckIn,
  };
};

