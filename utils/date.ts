interface FormatDateOptions {
  showTime?: boolean;
  monthStyle?: 'short' | 'long';
  dayStyle?: 'numeric' | '2-digit';
}

/**
 * Normalisasi tanggal dari backend (ISO penuh "2026-09-16T00:00:00.000Z")
 * atau plain "YYYY-MM-DD" menjadi "YYYY-MM-DD" -- format yang diminta DTO
 * backend dan validasi form. ISO selalu diawali YYYY-MM-DD, jadi slice aman.
 */
export function toDateString(value?: string | null): string {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export function formatDate(dateStr?: string, options: FormatDateOptions = {}): string {
  if (!dateStr) return '-';
  const { showTime = false, monthStyle = 'short', dayStyle = 'numeric' } = options;
  try {
    const d = new Date(dateStr);
    const opts: Intl.DateTimeFormatOptions = {
      day: dayStyle,
      month: monthStyle,
      year: 'numeric',
    };
    if (showTime) {
      opts.hour = '2-digit';
      opts.minute = '2-digit';
    }
    return d.toLocaleDateString('id-ID', opts);
  } catch {
    return dateStr;
  }
}
