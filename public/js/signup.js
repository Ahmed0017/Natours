/*eslint-disable*/
import axios from 'axios';

import { showAlert } from './alerts';

export const signup = async (data, email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'We sent you a code! Please check your email.');

      const phoneObj = JSON.parse(localStorage.getItem('phone'));

      if (phoneObj) localStorage.removeItem('phone');

      localStorage.setItem('email', JSON.stringify({ email }));

      window.setTimeout(() => {
        location.assign('/verify');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
