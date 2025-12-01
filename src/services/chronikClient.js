/**
 * Chronik Client Manager - Singleton with caching and fallback
 * Provides centralized Chronik client access with connection strategies
 */

import { ChronikClient, ConnectionStrategy } from 'chronik-client';

// Chronik URLs to try
const CHRONIK_URLS = [
  'https://chronik.be.cash/xec',
  'https://chronik.pay2stay.com/xec',
  'https://chronik.fabien.cash/xec'
];

// Cache configuration
const CACHE_TTL = 30000; // 30 seconds
const TIMEOUT_MS = 8000; // 8 second timeout for connection attempts

class ChronikManager {
  constructor() {
    this.chronikClient = null;
    this.initPromise = null;
    this.blockchainInfoCache = null;
    this.blockchainInfoCacheTime = 0;
  }

  /**
   * Helper to wrap promises with timeout
   */
  async withTimeout(promise, timeoutMs = TIMEOUT_MS) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
      )
    ]);
  }

  /**
   * Initialize Chronik client with fallback strategy
   */
  async initializeChronik() {
    if (this.chronikClient) {
      return this.chronikClient;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      const urlsToTry = [...CHRONIK_URLS];

      // Try env override first
      if (import.meta.env.VITE_CHRONIK_URL) {
        urlsToTry.unshift(import.meta.env.VITE_CHRONIK_URL);
      }

      console.log('🔄 Initializing Chronik client...');

      // Strategy 1: Try ClosestFirst strategy
      try {
        console.log('  Strategy 1: Trying ClosestFirst...');
        const client = await this.withTimeout(
          ChronikClient.useStrategy(ConnectionStrategy.ClosestFirst, urlsToTry),
          TIMEOUT_MS
        );
        // Test connection
        await this.withTimeout(client.blockchainInfo(), 3000);
        console.log('  ✅ ClosestFirst strategy connected');
        this.chronikClient = client;
        return client;
      } catch (err) {
        console.warn('  ⚠️ ClosestFirst failed:', err.message);
      }

      // Strategy 2: Try AsOrdered strategy
      try {
        console.log('  Strategy 2: Trying AsOrdered...');
        const client = await this.withTimeout(
          ChronikClient.useStrategy(ConnectionStrategy.AsOrdered, urlsToTry),
          TIMEOUT_MS
        );
        await this.withTimeout(client.blockchainInfo(), 3000);
        console.log('  ✅ AsOrdered strategy connected');
        this.chronikClient = client;
        return client;
      } catch (err) {
        console.warn('  ⚠️ AsOrdered failed:', err.message);
      }

      // Strategy 3: Try each URL directly
      for (const url of urlsToTry) {
        try {
          console.log(`  Strategy 3: Trying direct connection to ${url}...`);
          const client = new ChronikClient(url);
          await this.withTimeout(client.blockchainInfo(), 5000);
          console.log(`  ✅ Direct connection to ${url} succeeded`);
          this.chronikClient = client;
          return client;
        } catch (err) {
          console.warn(`  ⚠️ Direct connection to ${url} failed:`, err.message);
        }
      }

      // All strategies failed
      const error = new Error('All Chronik connection attempts failed');
      console.error('❌ Chronik initialization failed:', error.message);
      throw error;
    })();

    return this.initPromise;
  }

  /**
   * Get Chronik client instance (lazy initialization)
   */
  async getClient() {
    if (!this.chronikClient) {
      await this.initializeChronik();
    }
    return this.chronikClient;
  }

  /**
   * Get blockchain info with caching
   */
  async getBlockchainInfo(forceRefresh = false) {
    const now = Date.now();

    // Return cached data if available and fresh
    if (
      !forceRefresh &&
      this.blockchainInfoCache &&
      now - this.blockchainInfoCacheTime < CACHE_TTL
    ) {
      return this.blockchainInfoCache;
    }

    try {
      const client = await this.getClient();
      const info = await this.withTimeout(client.blockchainInfo(), 5000);
      
      // Update cache
      this.blockchainInfoCache = info;
      this.blockchainInfoCacheTime = now;
      
      return info;
    } catch (error) {
      console.error('Failed to get blockchain info:', error.message);
      
      // Return stale cache if available
      if (this.blockchainInfoCache) {
        console.warn('Returning stale blockchain info from cache');
        return this.blockchainInfoCache;
      }
      
      throw error;
    }
  }

  /**
   * Check connection health
   */
  async checkConnection() {
    try {
      const info = await this.getBlockchainInfo(true);
      return {
        connected: true,
        blockHeight: info.tipHeight,
        error: null
      };
    } catch (error) {
      return {
        connected: false,
        blockHeight: 0,
        error: error.message
      };
    }
  }

  /**
   * Reset client (force reconnection)
   */
  reset() {
    this.chronikClient = null;
    this.initPromise = null;
    this.blockchainInfoCache = null;
    this.blockchainInfoCacheTime = 0;
  }
}

// Singleton instance
const chronikManager = new ChronikManager();

export default chronikManager;
export { ChronikManager };
