export const useWarning = (election, seatName) => {
  return (
    (election === '2023nsw' &&
      (seatName === 'Kiama' || seatName === 'Port Macquarie')) ||
    (election === '2024qld' && seatName === 'Mirani') ||
    (election === '2025fed' && seatName === 'Calare') ||
    (election === '2026sa' &&
      (seatName === 'Narungga' || seatName === 'MacKillop')) ||
    (election === '2026vic' &&
      (seatName === 'Prahran' || seatName === 'Narracan')) ||
    (election === '2027nsw' && seatName === 'Kiama')
  );
};
