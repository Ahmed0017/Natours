/*eslint-disable*/
import axios from 'axios';

import { showAlert } from './alerts';

export const verifyTwilio = async (phone, code) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/verifyTwilio',
      data: {
        phone,
        code
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'signed up successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
