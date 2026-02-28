import { useState, useEffect } from 'react';
import { fetchPractices } from '../lib/practices-service';

// Хардкод как fallback (текущие данные)
import { practices as hardcodedPractices } from '../data/practices';

export function usePractices() {
  const [practices, setPractices] = useState(hardcodedPractices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchPractices();
        if (!cancelled && data.length > 0) {
          setPractices(data);
        }
        // Если data пустой — остаёмся на хардкоде
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { practices, loading, error };
}
