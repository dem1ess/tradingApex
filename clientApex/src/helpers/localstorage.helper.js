export const getTokenFromLocalStorage = () => {
  return localStorage.getItem('token');
};

export function setTokenToLocalStorage(token) {
  localStorage.setItem('token', token); // Убираем JSON.stringify
  console.log('token', token);
}

export function removeTokenFromLocalStorage() {
  localStorage.removeItem('token');
}
