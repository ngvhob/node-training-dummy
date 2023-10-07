import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (body, type, baseurl) => {
  try {
    const url =
      type === 'password'
        ? `${baseurl}api/v1/auth/update-password`
        : `${baseurl}api/v1/user/me`;
    const res = await axios({
      method: 'PATCH',
      url: url,
      data: body
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!!`);
      if (type != 'password') {
        window.setTimeout(() => {
          location.assign('/me');
        }, 1000);
      }
    }
  } catch (error) {
    showAlert('error', error.response.data.Message);
  }
};
