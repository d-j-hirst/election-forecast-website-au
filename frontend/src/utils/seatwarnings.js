export const useWarning = (election, seatName) => {
  return (
    (election === '2023nsw' &&
      (seatName === 'Kiama' || seatName === 'Port Macquarie')) ||
    (election === '2024qld' && seatName === 'Mirani') ||
    (election === '2026sa' &&
      (seatName === 'Mount Gambier' ||
        seatName === 'Narungga' ||
        seatName === 'MacKillop')) ||
    (election === '2026vic' &&
      (seatName === 'Prahran' || seatName === 'Narracan')) ||
    (election === '2027nsw' && seatName === 'Kiama') ||
    (election === '2028fed' && seatName === 'Calare')
  );
};
