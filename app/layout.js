import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import LocationTracker from '../components/LocationTracker';

export const metadata = {
  title: 'MERN App — Dashboard',
  description: 'Professional MERN stack application with authentication',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <LocationTracker />
              {children}
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

