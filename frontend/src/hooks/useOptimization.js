// ============================================================
// CUSTOM HOOKS
// ============================================================

import { useState, useEffect, useRef } from 'react';

// ============================================================
// USE DEBOUNCE HOOK
// ============================================================
// Delays function execution until user stops typing
// Prevents excessive API calls
// Usage: const debouncedValue = useDebounce(value, 500)
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timer to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel timer if value changes before delay ends
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// ============================================================
// USE DEBOUNCE CALLBACK HOOK
// ============================================================
// Debounce a function call
// Usage: const debouncedSearch = useDebouncedCallback(searchFunction, 500)
export const useDebouncedCallback = (callback, delay = 500) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = (...args) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// ============================================================
// USE REQUEST CACHE HOOK
// ============================================================
// Cache API responses to prevent duplicate requests
// Usage: const { data, loading, error } = useCachedRequest(url, options)
export const useCachedRequest = (url, options = {}) => {
  const cacheRef = useRef(new Map());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCacheKey = () => `${url}_${JSON.stringify(options)}`;

  const fetchData = async () => {
    const cacheKey = getCacheKey();

    // Return cached data if available
    if (cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      setData(cachedData);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Request failed');
      }

      // Store in cache
      cacheRef.current.set(cacheKey, result);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    cacheRef.current.clear();
  };

  return { data, loading, error, fetchData, clearCache };
};

// ============================================================
// USE ASYNC STATE HOOK
// ============================================================
// Manage loading, error, and success states easily
// Usage: const { isLoading, error, success, execute } = useAsyncState()
export const useAsyncState = (asyncFunction, immediate = false) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const execute = async (...args) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await asyncFunction(...args);
      setSuccess(true);
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Execute immediately on mount if specified
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return { isLoading, error, success, execute };
};

// ============================================================
// USE PREVIOUS VALUE HOOK
// ============================================================
// Tracks previous value of a state
// Useful for comparing old and new values
export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
