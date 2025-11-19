import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data from an API
 *
 * @param {string} url - The API endpoint to fetch from
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {Array} dependencies - Dependencies array to trigger refetch
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useFetch = (url, options = {}, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (result.success || response.ok) {
        setData(result);
      } else {
        setError(result.message || 'An error occurred');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
