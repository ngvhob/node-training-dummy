import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';

const baseURL = `http://127.0.0.1:3000/`;
// DOM ELEMETS
const form = document.querySelector('.form.form--login');
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
