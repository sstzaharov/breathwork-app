import { supabase } from './supabase';

// Создать или обновить пользователя из Telegram
export async function upsertUser(telegramUser) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      telegram_id: telegramUser.id,
      username: telegramUser.username || null,
      first_name: telegramUser.first_name || null,
      last_name: telegramUser.last_name || null,
      photo_url: telegramUser.photo_url || null,
      language_code: telegramUser.language_code || 'ru',
      last_active_at: new Date().toISOString(),
    }, {
      onConflict: 'telegram_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user:', error);
    return null;
  }

  return data;
}

// Записать начало сессии
export async function startSession(userId, practiceId) {
  const hour = new Date().getHours();
  const contextTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

  const { data, error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      practice_id: practiceId,
      context_time: contextTime,
    })
    .select()
    .single();

  if (error) {
    console.error('Error starting session:', error);
    return null;
  }

  return data;
}

// Завершить сессию
export async function finishSession(sessionId, durationListened, completed) {
  const { error } = await supabase
    .from('user_sessions')
    .update({
      finished_at: new Date().toISOString(),
      duration_listened: durationListened,
      completed,
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error finishing session:', error);
  }
}

// Получить статистику пользователя
export async function getUserStats(userId) {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('practice_id, duration_listened, completed, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stats:', error);
    return { totalSessions: 0, totalMinutes: 0, completedSessions: 0, recentSessions: [] };
  }

  return {
    totalSessions: data.length,
    totalMinutes: Math.round(data.reduce((sum, s) => sum + s.duration_listened, 0) / 60),
    completedSessions: data.filter(s => s.completed).length,
    recentSessions: data.slice(0, 10),
  };
}
