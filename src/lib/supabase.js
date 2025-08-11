import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://auvpuouphxdkrajmnruo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnB1b3VwaHhka3Jham1ucnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDE0ODAsImV4cCI6MjA2NjQxNzQ4MH0.HTG2xJa6wueogx9TyNLb3bcCngdD3xSJAzEE-z0R7Jg';

const customFetch = async (input, init) => {
  let retries = 3;
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(input, init);
      
      if (response.status >= 500 && response.status <= 599) {
          throw new Error(`Server error with status ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, Math.pow(2, i) * 300));
      }
    }
  }

  throw lastError;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  }
});