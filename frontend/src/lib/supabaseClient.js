import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://edsdmewyiahhrkyngunp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkc2RtZXd5aWFoaHJreW5ndW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDUzNTgsImV4cCI6MjEwODE4MTM1OH0.maSB2H-VvOffzevas6DsdRQyTsWakUJkQ5tj2-8Q3LM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
