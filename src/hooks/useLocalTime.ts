'use client';

import { useEffect, useState } from 'react';

/** Live HH:MM:SS clock in a given IANA time zone. Empty string until mounted. */
export function useLocalTime(timeZone: string, withSeconds = true) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: withSeconds ? '2-digit' : undefined,
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [timeZone, withSeconds]);

  return time;
}
