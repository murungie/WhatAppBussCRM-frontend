import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

import AppLayout from './layouts/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import OnboardingPage from './pages/onboarding/OnboardingPage';
import WhatsAppOnboardingPage from './pages/onboarding/WhatsAppOnboardingPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import InboxPage from './pages/inbox/InboxPage';
import CustomersPage from './pages/customers/CustomersPage';
import BroadcastsPage from './pages/broadcasts/BroadcastsPage';
import AutoRepliesPage from './pages/auto-replies/AutoRepliesPage';
import OrdersPage from './pages/orders/OrdersPage';
import SettingsPage from './pages/settings/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route element={<ProtectedRoute />}>

            <Route
              path="/onboarding"
              element={<OnboardingPage />}
            />

            <Route
              path="/onboarding/whatsapp"
              element={
                <WhatsAppOnboardingPage />
              }
            />

            <Route element={<AppLayout />}>

              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />

              <Route
                path="/inbox"
                element={<InboxPage />}
              />

              <Route
                path="/customers"
                element={<CustomersPage />}
              />

              <Route
                path="/broadcasts"
                element={<BroadcastsPage />}
              />

              <Route
                path="/auto-replies"
                element={<AutoRepliesPage />}
              />

            </Route>

            <Route
              path="/orders"
              element={<OrdersPage />}
            />

            <Route
              path="/settings"
              element={<SettingsPage />}
            />

          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;