// type = success / error;
export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<din class="alert alert--${type}">${msg}</dv>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};
