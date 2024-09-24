// src/middleware/adminMiddleware.js
import { removeUser } from '../slices/userSlice';
import {UserService} from "../../services/userService";

const adminMiddleware = (store) => (next) => async (action) => {
    const state = store.getState();
    const token = state.user.token;

    if (token) {
        try {
            const response = await UserService.verifyToken('/auth/verifyToken')

            if (!response.ok) {
                throw new Error('Token verification failed');
            }

            const data = await response.json();
            console.log(data, "adminnnn")
            if (!data.valid || data.role !== 'admin') {
                throw new Error('Invalid token or insufficient privileges');
            }
        } catch (e) {
            store.dispatch(removeUser());
            console.error('Token verification failed or insufficient privileges:', e);
        }
    }
    console.log(";;;;;;;;;;;;;;;;;;")
    return next(action);
};

export default adminMiddleware;
