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

          <Route element={<ProtectedRoute />}>
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
          </Route>
          <Route
            path="/settings"
            element={<SettingsPage />}
          />

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





