// import { removeUser } from '../slices/userSlice';
// import { UserService } from '../../services/userService';

// const authMiddleware = (store) => (next) => async (action) => {
//   const state = store.getState();
//   const token = state.user.token;

//   if (token) {
//     try {
//       const response = await UserService.verifyToken('/auth/verifyToken');

//       if (!response.ok) {
//         throw new Error('Token verification failed', response);
//       }

//       const data = await response.json();
//       if (!data.valid) {
//         throw new Error('Invalid token');
//       }
//     } catch (e) {
//       store.dispatch(removeUser());
//       console.error('Token verification failed:', e);
//     }
//   }

//   return next(action);
// };

// export default authMiddleware;
