import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "../layouts/ProtectedRoute";

const AdminPendingDoctorsPage = lazy(() => import("../pages/AdminPendingDoctorsPage"));
const AnalyticsSummaryPage = lazy(() => import("../pages/AnalyticsSummaryPage"));
const AppointmentsPage = lazy(() => import("../pages/AppointmentsPage"));
const ConsultationsPage = lazy(() => import("../pages/ConsultationsWorkspacePage"));
const CreateGroupPage = lazy(() => import("../pages/CreateGroupPage"));
const CreateTreatmentPlanPage = lazy(() => import("../pages/CreateTreatmentPlanPage"));
const DoctorPostsPage = lazy(() => import("../pages/DoctorPostsPage"));
const DoctorFollowUpsPage = lazy(() => import("../pages/DoctorFollowUpsPage"));
const EditTreatmentPlanPage = lazy(() => import("../pages/EditTreatmentPlanPage"));
const GroupDetailsPage = lazy(() => import("../pages/GroupDetailsPage"));
const GroupManagementPage = lazy(() => import("../pages/GroupManagementPage"));
const GroupsPage = lazy(() => import("../pages/GroupsPage"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const MedicalRecordPage = lazy(() => import("../pages/MedicalRecordPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const PostsPage = lazy(() => import("../pages/PostsPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const RegisterDoctorPage = lazy(() => import("../pages/RegisterDoctorPage"));
const RegisterPatientPage = lazy(() => import("../pages/RegisterPatientPage"));
const ReviewsPage = lazy(() => import("../pages/ReviewsPage"));
const RoleDashboardPage = lazy(() => import("../pages/RoleDashboardPage"));
const SubmitFollowUpPage = lazy(() => import("../pages/SubmitFollowUpPage"));
const TreatmentPlanDetailsPage = lazy(() => import("../pages/TreatmentPlanDetailsPage"));
const TreatmentPlansPage = lazy(() => import("../pages/TreatmentPlansPage"));

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
            element: withSuspense(RoleDashboardPage)
          },
          {
            path: "profile",
            element: withSuspense(ProfilePage)
          }
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["DOCTOR"]} />,
        children: [
          {
            path: "doctor-posts",
            element: withSuspense(DoctorPostsPage)
          },
          {
            path: "doctor/dashboard",
            element: withSuspense(RoleDashboardPage)
          },
          {
            path: "doctor/treatment-plans",
            element: withSuspense(TreatmentPlansPage)
          },
          {
            path: "doctor/treatment-plans/create",
            element: withSuspense(CreateTreatmentPlanPage)
          },
          {
            path: "doctor/treatment-plans/:id",
            element: withSuspense(TreatmentPlanDetailsPage)
          },
          {
            path: "doctor/treatment-plans/:id/edit",
            element: withSuspense(EditTreatmentPlanPage)
          },
          {
            path: "doctor/follow-ups",
            element: withSuspense(DoctorFollowUpsPage)
          },
          {
            path: "doctor/groups/create",
            element: withSuspense(CreateGroupPage)
          },
          {
            path: "doctor/groups/:id/manage",
            element: withSuspense(GroupManagementPage)
          },
          {
            path: "doctor/reviews",
            element: withSuspense(ReviewsPage)
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
          },
          {
            path: "groups",
            element: withSuspense(GroupsPage)
          },
          {
            path: "groups/:id",
            element: withSuspense(GroupDetailsPage)
          }
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["PATIENT"]} />,
        children: [
          {
            path: "patient/treatment-plans",
            element: withSuspense(TreatmentPlansPage)
          },
          {
            path: "patient/treatment-plans/:id",
            element: withSuspense(TreatmentPlanDetailsPage)
          },
          {
            path: "patient/treatment-plans/:id/follow-up",
            element: withSuspense(SubmitFollowUpPage)
          },
          {
            path: "patient/medical-record",
            element: withSuspense(MedicalRecordPage)
          },
          {
            path: "patient/notifications",
            element: withSuspense(NotificationsPage)
          },
          {
            path: "patient/reviews",
            element: withSuspense(ReviewsPage)
          }
        ]
      },
      {
        element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
        children: [
          {
            path: "admin/pending-doctors",
            element: withSuspense(AdminPendingDoctorsPage)
          },
          {
            path: "admin/dashboard",
            element: withSuspense(RoleDashboardPage)
          },
          {
            path: "admin/analytics",
            element: withSuspense(AnalyticsSummaryPage)
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
