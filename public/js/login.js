/*eslint-disable*/
import axios from 'axios';

import { showAlert, hideAlert } from './alerts';
import { resendCode } from './resendCode';

export const login = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);

    if (err.response.data.message.startsWith('Your account is not yet verified!')) {
      handleNotVerifiedError();
    }
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout'
    });

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/login');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', 'There is an error! Try again.');
  }
};

const handleNotVerifiedError = () => {
  const value = document.getElementById('emailOrPhone').value;
  const resendEl = document.getElementById('resend');
  if (resendEl) resendEl.parentElement.removeChild(resendEl);

  const el = document.getElementById('container');
  const markup = `<button data-value=${value} id='resend'>Resend code?</button>`;
  el.insertAdjacentHTML('afterbegin', markup);

  const resend = document.getElementById('resend');
  resend.addEventListener('click', async () => {
    hideAlert();
    const regEx = /^\d{3}-\d{3}-\d{4}$/;
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (regEx.test(value)) {
      await resendCode({ phone: value });
      return;
    }

    if (re.test(value)) {
      await resendCode({ email: value });
      return;
    }
  });
};
