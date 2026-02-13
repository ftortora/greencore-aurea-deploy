import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { LoadingScreen } from './components/ui/Loading';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Energy = lazy(() => import('./pages/Energy'));
const Analytics = lazy(() => import('./pages/Analytics'));
const CO2Tracker = lazy(() => import('./pages/CO2Tracker'));
const Tips = lazy(() => import('./pages/Tips'));
const Settings = lazy(() => import('./pages/Settings'));
const Subscription = lazy(() => import('./pages/Subscription'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));

const App = () => {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    {/* token in path */}
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                </Route>

                <Route path="/auth/google/callback" element={<OAuthCallback />} />
                <Route path="/auth/github/callback" element={<OAuthCallback />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/energy" element={<Energy />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/co2" element={<CO2Tracker />} />
                    <Route path="/tips" element={<Tips />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/subscription" element={<Subscription />} />

                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminPanel />
                            </AdminRoute>
                        }
                    />
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Suspense>
    );
};

export default App;
