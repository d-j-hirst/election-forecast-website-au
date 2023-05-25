export const useWarning = (election, seatName) => {
  return (
    (election === '2023nsw' &&
      (seatName === 'Kiama' || seatName === 'Port Macquarie')) ||
    (election === '2025fed' && seatName === 'Calare') ||
    (election === '2024qld' && seatName === 'Mirani')
  );
};
