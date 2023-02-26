export const useWarning = (election, seatName) => {
  return (
    election === '2023nsw' &&
    (seatName === 'Kiama' ||
      seatName === 'Orange' ||
      seatName === 'Murray' ||
      seatName == 'Barwon' ||
      seatName == 'Balmain')
  );
};
