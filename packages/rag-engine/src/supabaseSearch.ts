import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);

export async function searchLegalCases(queryEmbedding: number[]) {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  }

  const { data, error } = await supabase.rpc('match_courtlistener', {
    query_embedding: queryEmbedding,
    match_threshold: 0.6,
    match_count: 5,
  });

  if (error) {
    console.error('Vector search failed:', error);
    throw error;
  }

  return data;
}
