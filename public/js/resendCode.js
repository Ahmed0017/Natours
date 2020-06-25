/* eslint-disable */
import axios from 'axios';

import { showAlert } from './alerts';

export const resendCode = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/resendCode',
      data
    });

    if ((res.data.status = 'success')) {
      showAlert('success', res.data.message);
      const { email, phone } = data;

      if (email) {
        window.setTimeout(() => {
          location.assign('/verify');
        }, 2500);
      }

      if (phone) {
        const emailObj = JSON.parse(localStorage.getItem('email'));

        if (emailObj) localStorage.removeItem('email');

        localStorage.setItem('phone', JSON.stringify({ phone }));

        window.setTimeout(() => {
          location.assign('/verify');
        }, 2500);
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
