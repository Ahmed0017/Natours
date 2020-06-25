/*eslint-disable*/
import axios from 'axios';

import { showAlert } from './alerts';

export const signupPhone = async (data, phone) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/signupPhone',
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'We sent you a code! Please check your Phone.');

      const emailObj = JSON.parse(localStorage.getItem('email'));

      if (emailObj) localStorage.removeItem('email');

      localStorage.setItem('phone', JSON.stringify({ phone }));

      window.setTimeout(() => {
        location.assign('/verify');
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
    return err.response.data;
  }
};
