import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password, baseurl) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `${baseurl}api/v1/auth/login`,
      data: { email, password }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully !!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    showAlert('error', error.response.data.Message);
  }
};

export const logout = async baseurl => {
  try {
    const res = await axios({
      method: 'GET',
      url: `${baseurl}api/v1/auth/logout`
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully !');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    showAlert('error', 'Please try again later!');
  }
};
