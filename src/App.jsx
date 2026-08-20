import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider, useWallet } from './context/WalletContext';
import { VideoProgressProvider } from './context/VideoProgressContext';
import { LiveStreamProvider } from './context/LiveStreamContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loader2, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

// Lazy-loaded Views
const HomeView = lazy(() => import('./views/HomeView').then(m => ({ default: m.HomeView })));
const CourseCatalogView = lazy(() => import('./views/CourseCatalogView').then(m => ({ default: m.CourseCatalogView })));
const CourseDetailView = lazy(() => import('./views/CourseDetailView').then(m => ({ default: m.CourseDetailView })));
const CoursePlayerView = lazy(() => import('./views/CoursePlayerView').then(m => ({ default: m.CoursePlayerView })));
const LiveStreamingView = lazy(() => import('./views/LiveStreamingView').then(m => ({ default: m.LiveStreamingView })));
const PlaygroundView = lazy(() => import('./views/PlaygroundView').then(m => ({ default: m.PlaygroundView })));
const DashboardView = lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const WalletView = lazy(() => import('./views/WalletView').then(m => ({ default: m.WalletView })));
const PricingView = lazy(() => import('./views/PricingView').then(m => ({ default: m.PricingView })));
const LoginView = lazy(() => import('./views/LoginView').then(m => ({ default: m.LoginView })));
const RegisterView = lazy(() => import('./views/RegisterView').then(m => ({ default: m.RegisterView })));
const InstructorDashboardView = lazy(() => import('./views/InstructorDashboardView').then(m => ({ default: m.InstructorDashboardView })));
const ExerciseSolverView = lazy(() => import('./views/ExerciseSolverView').then(m => ({ default: m.ExerciseSolverView })));
const ProfileView = lazy(() => import('./views/ProfileView').then(m => ({ default: m.ProfileView })));
const NotFoundView = lazy(() => import('./views/NotFoundView').then(m => ({ default: m.NotFoundView })));

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={32} color="var(--accent-purple)" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Global Toast Renderer
function ToastContainer() {
  const { toasts, removeToast } = useWallet();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isDanger = toast.type === 'danger';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className="toast"
            style={{
              borderColor: isSuccess ? 'var(--color-success)' : isDanger ? 'var(--color-danger)' : isWarning ? 'var(--color-warning)' : 'var(--border-medium)'
            }}
          >
            {isSuccess && <CheckCircle size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />}
            {isDanger && <AlertCircle size={18} color="var(--color-danger)" style={{ flexShrink: 0 }} />}
            {isWarning && <AlertTriangle size={18} color="#F59E0B" style={{ flexShrink: 0 }} />}
            {!isSuccess && !isDanger && !isWarning && <Info size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />}

            <span style={{ flex: 1, color: 'var(--text-primary)' }}>{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: 'var(--text-muted)', display: 'flex', padding: '0.2rem' }}
              aria-label="Cerrar notificación"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Loading Suspense Fallback
function LoadingFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', gap: '1rem' }}>
      <Loader2 className="animate-spin" size={36} color="var(--accent-purple)" />
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cargando MyCode Pro...</span>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <WalletProvider>
            <VideoProgressProvider>
              <LiveStreamProvider>
                <BrowserRouter>
                  <div className="app-container">
                    <Navbar />
                    <main className="main-content">
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                          <Route path="/" element={<HomeView />} />
                          <Route path="/courses" element={<CourseCatalogView />} />
                          <Route path="/courses/:id" element={<CourseDetailView />} />
                          <Route path="/courses/:id/lesson/:lessonId" element={<CoursePlayerView />} />
                          <Route path="/live" element={<LiveStreamingView />} />
                          <Route path="/playground" element={<PlaygroundView />} />
                                                    <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute>
                                <DashboardView />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <ProfileView />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/instructor"
                            element={
                              <ProtectedRoute>
                                <InstructorDashboardView />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/instructor/dashboard"
                            element={
                              <ProtectedRoute>
                                <InstructorDashboardView />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/exercises/:exerciseId"
                            element={
                              <ProtectedRoute>
                                <ExerciseSolverView />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/wallet"
                            element={
                              <ProtectedRoute>
                                <WalletView />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/pricing" element={<PricingView />} />
                          <Route path="/login" element={<LoginView />} />
                          <Route path="/register" element={<RegisterView />} />
                          <Route path="/404" element={<NotFoundView />} />
                          <Route path="*" element={<NotFoundView />} />
                        </Routes>
                      </Suspense>
                      </ErrorBoundary>
                    </main>
                    <Footer />
                    <ToastContainer />
                  </div>
                </BrowserRouter>
              </LiveStreamProvider>
            </VideoProgressProvider>
          </WalletProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;