/**
 * Parses a date string in "YYYY-MM-DD" format and returns a Date object
 * corresponding to midnight UTC on that day. This is crucial for preventing
 * timezone-related off-by-one errors.
 * @param dateString - The date string to parse, e.g., "2024-08-15".
 * @returns A Date object set to UTC midnight.
 */
export const parseDateAsUTC = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  // Note: month is 0-indexed in JavaScript's Date constructor.
  return new Date(Date.UTC(year, month - 1, day));
};
