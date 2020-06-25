/*eslint-disable*/
import axios from 'axios';

import { showAlert } from './alerts';

export const verify = async (code, type) => {
  try {
    const res = await axios({
      method: 'POST',
      url:
        type === 'normal'
          ? 'http://localhost:3000/api/v1/users/verify'
          : 'http://localhost:3000/api/v1/users/verifyPasswordResetToken',
      data: {
        code
      }
    });

    if (res.data.status === 'success' && res.data.data.user) {
      showAlert('success', 'Signed up successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }

    if (res.data.status === 'success' && res.data.message) {
      showAlert('success', res.data.message);
      window.setTimeout(() => {
        location.assign(`/resetPassword/${code}`);
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
