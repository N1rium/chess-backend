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
