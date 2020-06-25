/* eslint-disable */
import '@babel/polyfill';

import { showAlert } from './alerts';
import { login, logout } from './login';
import { signup } from './signup';
import { signupPhone } from './signupPhone';
import { verifyTwilio } from './verifyTwilio';
import { verify } from './verify';
import { forgotPassword } from './forgotPassword';
import { displayMap } from './mapbox';
import { updateUser } from './updateUser';
import { bookTour } from './stripe';
import { resetPassword } from './resetPassword';
import { resendCode } from './resendCode';

//DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupEmailForm = document.querySelector('.form__email--signup');
const signupPhoneForm = document.querySelector('.form__phone--signup');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const btnSocial = document.querySelectorAll('.btn__form--social');

const verifyContinueForm = document.querySelector('.form__verify--continue');
const forgotPasswordForm = document.querySelector('.form__forgotPassword--continue');
const resetPasswordForm = document.querySelector('.form__resetPassword--continue');

const resend = document.getElementById('resendCode');

if (resend) {
  resend.addEventListener('click', async () => {
    const phoneObj = JSON.parse(localStorage.getItem('phone'));
    const emailObj = JSON.parse(localStorage.getItem('email'));

    const query = Qs.parse(location.search, { ignoreQueryPrefix: true });
    const { resetPassword } = query;

    if (
      phoneObj &&
      (resetPassword ||
        document.referrer === 'http://localhost:3000/forgotPassword' ||
        localStorage.getItem('resetPassword'))
    ) {
      const { phone } = phoneObj;
      await forgotPassword({ phone });
      return localStorage.removeItem('resetPassword');
    }

    if (
      emailObj &&
      (resetPassword ||
        document.referrer === 'http://localhost:3000/forgotPassword' ||
        localStorage.getItem('resetPassword'))
    ) {
      const { email } = emailObj;
      await forgotPassword({ email });
      return localStorage.removeItem('resetPassword');
    }

    if (phoneObj) {
      const { phone } = phoneObj;
      return await resendCode({ phone });
    }

    if (emailObj) {
      const { email } = emailObj;
      return await resendCode({ email });
    }
  });
}

if (signupPhoneForm) {
  signupPhoneForm.addEventListener('submit', async e => {
    e.preventDefault();

    e.submitter.textContent = 'Processing...';

    const el = document.getElementById('select');
    const countryCode = el.options[el.selectedIndex].value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const photo = document.getElementById('photo').files[0];

    const form = new FormData();

    form.append('name', name);
    form.append('countryCode', countryCode);
    form.append('phone', phone);
    form.append('password', password);
    form.append('passwordConfirm', [passwordConfirm]);
    form.append('photo', photo);

    const err = await signupPhone(form, phone);

    if (err) e.submitter.textContent = 'Signup';
  });
}

if (verifyContinueForm) {
  verifyContinueForm.addEventListener('submit', async e => {
    e.preventDefault();

    const code = document.getElementById('code').value;

    const query = Qs.parse(location.search, { ignoreQueryPrefix: true });
    const { resetPassword } = query;

    if (resetPassword) {
      await verify(code, 'resetPassword');
      return;
    }

    const phoneObj = JSON.parse(localStorage.getItem('phone'));
    const emailObj = JSON.parse(localStorage.getItem('email'));

    // This mean the user delete the localStorage!
    if (!phoneObj && !emailObj) return showAlert('error', 'Something went wrong!');

    if (phoneObj) {
      const { phone } = phoneObj;
      await verifyTwilio(phone, code);
      return;
    }

    await verify(code, 'normal');
  });
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();

    const emailOrPhone = document.getElementById('emailOrPhone').value;

    const regEx = /^\d{3}-\d{3}-\d{4}$/;
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!regEx.test(emailOrPhone.toLowerCase()) && !re.test(emailOrPhone.toLowerCase())) {
      return showAlert('error', 'Please enter a valid email address or mobile number');
    }

    if (regEx.test(emailOrPhone)) {
      return await forgotPassword({ phone: emailOrPhone });
    }

    if (re.test(emailOrPhone.toLowerCase())) {
      return await forgotPassword({ email: emailOrPhone });
    }
  });
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();

    const { token } = document.getElementById('hasToken').dataset;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    await resetPassword(token, password, passwordConfirm);
  });
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const emailOrPhone = document.getElementById('emailOrPhone').value;
    const password = document.getElementById('password').value;

    const regEx = /^\d{3}-\d{3}-\d{4}$/;
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!regEx.test(emailOrPhone.toLowerCase()) && !re.test(emailOrPhone.toLowerCase())) {
      return showAlert('error', 'Please enter a valid email address or mobile number');
    }

    if (regEx.test(emailOrPhone.toLowerCase())) {
      login({ phone: emailOrPhone, password });
    }

    if (re.test(emailOrPhone.toLowerCase())) {
      login({ email: emailOrPhone, password });
    }
  });
}

if (signupEmailForm) {
  signupEmailForm.addEventListener('submit', async e => {
    e.preventDefault();
    e.submitter.textContent = 'Processing...';

    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('password', document.getElementById('password').value);
    form.append('passwordConfirm', document.getElementById('passwordConfirm').value);
    form.append('photo', document.getElementById('photo').files[0]);

    const email = document.getElementById('email').value;

    await signup(form, email);

    e.submitter.textContent = 'signup';
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const photo = document.getElementById('photo').files[0];

    const email = document.getElementById('email');
    const phone = document.getElementById('phone');

    const form = new FormData();

    form.append('name', name);
    form.append('photo', photo);

    if (email) form.append('email', email.value);
    if (phone) form.append('phone', phone.value);

    updateUser(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUser({ passwordCurrent, password, passwordConfirm }, 'password');

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn--save-password').textContent = 'save password';
  });
}

if (bookBtn)
  bookBtn.addEventListener('click', async e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;

    await bookTour(tourId);

    e.target.textContent = 'BOOK TOUR NOW!';
  });

if (btnSocial) {
  btnSocial.forEach(item => {
    item.addEventListener('click', () => {
      item.textContent = 'Processing...';
    });
  });
}
