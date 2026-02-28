import { supabase } from './supabase';

// Загрузить все опубликованные практики
export async function fetchPractices() {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .eq('is_published', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching practices:', error);
    return [];
  }

  // Маппинг snake_case → camelCase (чтобы не ломать текущие компоненты)
  return data.map(p => ({
    id: p.id,
    title: p.title,
    duration: p.duration,
    durationSec: p.duration_seconds,
    intensity: p.intensity,
    category: p.category,
    context: p.context,
    level: p.level,
    science: p.science,
    preview: p.preview,
    technique: p.technique,
    color: p.color,
    accentColor: p.accent_color,
    genType: p.gen_type,
    breathPattern: p.breath_pattern,
    pattern: toPatternArray(p.breath_pattern),
    audioUrl: p.audio_url,
    isFree: p.is_free,
  }));
}

// Загрузить одну практику по id
export async function fetchPractice(id) {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching practice:', error);
    return null;
  }

  return data;
}

// breath_pattern JSONB → простой массив [вдох, задержка, выдох, задержка] для Player
function toPatternArray(bp) {
  if (!Array.isArray(bp) || bp.length === 0) return [4, 4, 4, 4];
  const arr = [0, 0, 0, 0];
  let holdIdx = 1;
  for (const ph of bp) {
    if (ph.name === 'вдох') { arr[0] = ph.duration; holdIdx = 1; }
    else if (ph.name === 'выдох') { arr[2] = ph.duration; holdIdx = 3; }
    else if (ph.name === 'задержка') { arr[holdIdx] = ph.duration; holdIdx = 3; }
  }
  return arr;
}
