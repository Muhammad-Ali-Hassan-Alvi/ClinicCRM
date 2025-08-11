import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://auvpuouphxdkrajmnruo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnB1b3VwaHhka3Jham1ucnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDE0ODAsImV4cCI6MjA2NjQxNzQ4MH0.HTG2xJa6wueogx9TyNLb3bcCngdD3xSJAzEE-z0R7Jg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);