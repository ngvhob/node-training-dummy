import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';

const baseURL = `http://127.0.0.1:3000/`;
// DOM ELEMETS
const form = document.querySelector('.form.form--login');
const formUpdateData = document.querySelector('.form-user-data');
const formUserSettings = document.querySelector('.form-user-settings');
const map = document.getElementById('map');
const logOut = document.querySelector('.nav__el--logout');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password, baseURL);
  });
}
if (formUpdateData) {
  formUpdateData.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data', baseURL);
  });
}

if (formUserSettings) {
  formUserSettings.addEventListener('submit', async e => {
    e.preventDefault();
    let button = document.getElementById('updatePassword--Btn');
    button.innerHTML = 'Updating...';
    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      {
        password: password,
        newPassword: newPassword,
        passwordConfirm: passwordConfirm
      },
      'password',
      baseURL
    );
    button.innerHTML = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (map) {
  const loc = JSON.parse(map.dataset.locations);
  displayMap(loc);
}

if (logOut) {
  logOut.addEventListener('click', e => {
    e.preventDefault();
    logout(baseURL);
  });
}
