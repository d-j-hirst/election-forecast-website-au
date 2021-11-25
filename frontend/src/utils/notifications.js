import { toast } from 'react-toastify';

// Function for noitifying the user of any errors.
// Internally uses the react-toastify library
export const notifyError = (error, options) => {
  error = error || 'Something went wrong.';
  toast.error(error.toString(), options);
};
