import { BrowserRouter } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useContext, useEffect } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { addStoredNotification } from './services/notifications';

function NotificationSync() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = toast.onChange((payload) => {
      if (payload.status !== 'added') return;

      const message = typeof payload.content === 'string'
        ? payload.content
        : 'A new SupportPilot update is available.';
      const type = payload.type || 'default';
      const title = type === 'error'
        ? 'Action needs attention'
        : type === 'success'
          ? 'Action completed'
          : type === 'warning'
            ? 'SupportPilot warning'
            : 'SupportPilot update';

      addStoredNotification(user?.email, {
        id: `toast-${payload.id}-${Date.now()}`,
        title,
        message,
        type,
        time: new Date().toISOString(),
        read: false,
      });
    });

    return unsubscribe;
  }, [user?.email]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <NotificationSync />
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}