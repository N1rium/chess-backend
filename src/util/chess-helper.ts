/* ================================================ ELO ========================================================== */

/* Get expected ELO */
export const expectedELO = (a, b) => {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
};

/* Get updated ELO from expected */
export const updateELO = (expected, result, current, k = 20) => {
  return Math.round(current + k * (result - expected));
};

/* Get expected ELO and update it */
export const eloChange = (a, b, res, k = 20) => {
  const expected = expectedELO(a, b);
  return updateELO(expected, res, a, k);
};

//https://support.chess.com/article/330-why-are-there-different-ratings-in-live-chess
export const getTimeFromTimeControl = (minutes, increment, avgMoves = 40) => {
  const minutesInMilliseconds = minutes * 60 * 1000;
  return minutesInMilliseconds + avgMoves * (increment * 1000);
};

export const getRatingFromTimeControl = (
  minutes,
  increment,
  avgMoves = 40,
): string => {
  const ms = getTimeFromTimeControl(minutes, increment, avgMoves);
  const MINUTE = 1000 * 60;
  if (ms <= MINUTE * 3) return 'BULLET';
  if (ms <= MINUTE * 10) return 'BLITZ';
  if (ms <= MINUTE * 25) return 'RAPID';
  return 'CLASSICAL';
};
