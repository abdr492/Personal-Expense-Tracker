const VITE_KEY = (import.meta as any).env.VITE_EXCHANGE_RATE_API_KEY;
// Use the open API (no key required) if the provided key is invalid or missing
const FREE_URL = "https://open.er-api.com/v6/latest";
const KEYED_URL = `https://v6.exchangerate-api.com/v6/${VITE_KEY}/latest`;

export interface ExchangeRates {
  [currency: string]: number;
}

// Fallback rates if API fails completely
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.33,
  JPY: 151.41,
  AED: 3.67,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.91,
  CNY: 7.24,
  SGD: 1.35,
  BRL: 5.12,
  MXN: 16.89,
  RUB: 91.50,
  TRY: 32.35
};

export async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRates> {
  // If we have a key, try the premium/keyed endpoint first
  // Otherwise, use the free open endpoint
  const url = VITE_KEY ? `${KEYED_URL}/${baseCurrency}` : `${FREE_URL}/${baseCurrency}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.result === 'success') {
      return data.conversion_rates || data.rates;
    } 
    
    // If the keyed endpoint failed with auth errors, retry with the free endpoint
    if (VITE_KEY && (data['error-type'] === 'invalid-key' || data['error-type'] === 'inactive-account')) {
      console.warn(`ExchangeRate-API: Key error (${data['error-type']}). Retrying with free endpoint.`);
      const freeResponse = await fetch(`${FREE_URL}/${baseCurrency}`);
      const freeData = await freeResponse.json();
      if (freeData.result === 'success') {
        return freeData.rates;
      }
    }

    console.error('ExchangeRate-API error:', data['error-type'] || 'Unknown error');
    return FALLBACK_RATES;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return FALLBACK_RATES;
  }
}
