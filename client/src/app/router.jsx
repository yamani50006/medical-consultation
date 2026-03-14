import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "../layouts/ProtectedRoute";

const AdminPendingDoctorsPage = lazy(() => import("../pages/AdminPendingDoctorsPage"));
const AppointmentsPage = lazy(() => import("../pages/AppointmentsPage"));
const ConsultationsPage = lazy(() => import("../pages/ConsultationsPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const DoctorPostsPage = lazy(() => import("../pages/DoctorPostsPage"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const PostsPage = lazy(() => import("../pages/PostsPage"));
const RegisterDoctorPage = lazy(() => import("../pages/RegisterDoctorPage"));
const RegisterPatientPage = lazy(() => import("../pages/RegisterPatientPage"));

function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-muted-foreground">جارٍ تحميل الصفحة...</div>}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: withSuspense(LandingPage)
      },
      {
        path: "posts",
        element: withSuspense(PostsPage)
      },
      {
        path: "login",
        element: withSuspense(LoginPage)
      },
      {
        path: "register/patient",
        element: withSuspense(RegisterPatientPage)
      },
      {
        path: "register/doctor",
        element: withSuspense(RegisterDoctorPage)
      },
      {
        element: <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR", "PATIENT"]} />,
        children: [
          {
            path: "dashboard",
            element: withSuspense(DashboardPage)
          }
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["DOCTOR"]} />,
        children: [
          {
            path: "doctor-posts",
            element: withSuspense(DoctorPostsPage)
          }
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["PATIENT", "DOCTOR"]} />,
        children: [
          {
            path: "consultations",
            element: withSuspense(ConsultationsPage)
          },
          {
            path: "appointments",
            element: withSuspense(AppointmentsPage)
          }
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
        children: [
          {
            path: "admin/pending-doctors",
            element: withSuspense(AdminPendingDoctorsPage)
          }
        ]
      },
      {
        path: "*",
        element: withSuspense(NotFoundPage)
      }
    ]
  }
]);

export default router;
