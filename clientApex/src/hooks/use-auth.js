import { useSelector } from 'react-redux';

export function useAuth() {
  const {
    email,
    token,
    id,
    username,
    isVerified,
    resetPasswordToken,
    role,
    mainBalance,
    creditBalance,
    country,
    firstName,
    lastName,
    dateOfBirth,
    isBanned,
    banReason,
  } = useSelector((state) => state.user);

  return {
    isAuth: !!email,
    token,
    id,
    username,
    isVerified,
    resetPasswordToken,
    role,
    mainBalance,
    creditBalance,
    country,
    firstName,
    lastName,
    dateOfBirth,
    isBanned,
    banReason,
  };
}
