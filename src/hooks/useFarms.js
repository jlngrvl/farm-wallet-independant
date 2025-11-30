import { useState, useEffect } from 'react';

/**
 * Hook to load and manage farms data from farms.json
 * @returns {Object} { farms, loading, error, refreshFarms }
 */
export const useFarms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFarms = async () => {
    setLoading(true);
    setError(null);

    try {
      // Import farms.json directly using Vite's import feature
      const farmsData = await import('../data/farms.json');
      
      // Support multiple formats:
      // 1. Direct array (new format): [{ id, name, ... }]
      // 2. Object with farms property: { farms: [...] }
      // 3. Default export with array
      // 4. Default export with farms property
      let farmsArray = null;
      
      if (Array.isArray(farmsData.default)) {
        // Direct array import (new format)
        farmsArray = farmsData.default;
      } else if (farmsData.default && Array.isArray(farmsData.default.farms)) {
        // Object with farms property (old format)
        farmsArray = farmsData.default.farms;
      } else if (Array.isArray(farmsData.farms)) {
        // Named export with farms property
        farmsArray = farmsData.farms;
      } else if (Array.isArray(farmsData)) {
        // Direct array (edge case)
        farmsArray = farmsData;
      }
      
      if (farmsArray && farmsArray.length > 0) {
        console.log(`✅ Loaded ${farmsArray.length} farms`);
        setFarms(farmsArray);
      } else {
        console.warn('⚠️ No farms found in farms.json');
        setFarms([]);
      }
    } catch (err) {
      console.error('Failed to load farms:', err);
      setError(err.message || 'Failed to load farms data');
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  return {
    farms,
    loading,
    error,
    refreshFarms: loadFarms
  };
};

/**
 * Hook to get a single farm by ID
 * @param {string} farmId - The farm ID to find
 * @returns {Object} { farm, loading, error }
 */
export const useFarm = (farmId) => {
  const { farms, loading, error } = useFarms();
  const [farm, setFarm] = useState(null);

  useEffect(() => {
    if (!loading && farms.length > 0 && farmId) {
      const foundFarm = farms.find(f => f.id === farmId);
      setFarm(foundFarm || null);
    }
  }, [farms, loading, farmId]);

  return {
    farm,
    loading,
    error
  };
};
