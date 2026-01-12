import { Navigate } from 'react-router-dom';
import { getToken } from '../auth/useAuth';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
