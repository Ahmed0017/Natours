/* eslint-disable */
import axios from 'axios';

import { showAlert } from './alerts';

export const forgotPassword = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/forgotPassword',
      data
    });

    if ((res.data.status = 'success')) {
      showAlert('success', res.data.message);
      localStorage.setItem('resetPassword', 'true');

      const { email, phone } = data;

      if (email) {
        const phoneObj = JSON.parse(localStorage.getItem('phone'));

        if (phoneObj) localStorage.removeItem('phone');

        localStorage.setItem('email', JSON.stringify({ email }));
      }

      if (phone) {
        const emailObj = JSON.parse(localStorage.getItem('email'));

        if (emailObj) localStorage.removeItem('email');

        localStorage.setItem('phone', JSON.stringify({ phone }));
      }

      window.setTimeout(() => {
        location.assign('/verify?resetPassword=true');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
