/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const updateUser = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'data'
          ? 'http://localhost:3000/api/v1/users/updateMe'
          : 'http://localhost:3000/api/v1/users/updateMyPassword',
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
