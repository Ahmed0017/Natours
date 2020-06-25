/*eslint-disable*/
import axios from 'axios';

import { showAlert } from './alerts';

export const resetPassword = async (token, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/resetPassword/${token}`,
      data: {
        password,
        passwordConfirm
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password reseted successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
