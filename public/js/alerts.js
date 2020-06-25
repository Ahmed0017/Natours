/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  hideAlert();
  const el = document.querySelector('body');
  const markup = `<div class='alert alert--${type}'>${msg}</div>`;
  el.insertAdjacentHTML('beforebegin', markup);
  setTimeout(hideAlert, 10000);
};
