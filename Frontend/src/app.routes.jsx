import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";
import VerifyEmail from "./features/auth/pages/VerifyEmail";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import Dashboard from "./features/dashboard/pages/Dashboard";
import InterviewHistory from "./features/dashboard/pages/InterviewHistory";
import Profile from "./features/profile/pages/Profile";
import Feedback from "./features/feedback/pages/Feedback";
import AppLayout from "./components/layout/AppLayout";
import AdminProtected from "./features/admin/components/AdminProtected";
import AdminLayout from "./features/admin/components/AdminLayout";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminUsers from "./features/admin/pages/AdminUsers";
import AdminInterviews from "./features/admin/pages/AdminInterviews";
import AdminAiUsage from "./features/admin/pages/AdminAiUsage";
import AdminFeatureFlags from "./features/admin/pages/AdminFeatureFlags";
import AdminFeedback from "./features/admin/pages/AdminFeedback";
import AdminAuditLog from "./features/admin/pages/AdminAuditLog";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <Protected><Dashboard /></Protected>
            },
            {
                path: "login",
                element: <Login />
            },
            {
                path: "register",
                element: <Register />
            },
            {
                path: "forgot-password",
                element: <ForgotPassword />
            },
            {
                path: "reset-password/:token",
                element: <ResetPassword />
            },
            {
                path: "verify-email/:token",
                element: <VerifyEmail />
            },
            {
                path: "history",
                element: <Protected><InterviewHistory /></Protected>
            },
            {
                path: "interview/new",
                element: <Protected><Home /></Protected>
            },
            {
                path: "interview/:interviewId",
                element: <Protected><Interview /></Protected>
            },
            {
                path: "profile",
                element: <Protected><Profile /></Protected>
            },
            {
                path: "feedback",
                element: <Protected><Feedback /></Protected>
            },
            {
                path: "admin",
                element: <AdminProtected><AdminLayout /></AdminProtected>,
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: "users", element: <AdminUsers /> },
                    { path: "interviews", element: <AdminInterviews /> },
                    { path: "ai-usage", element: <AdminAiUsage /> },
                    { path: "feature-flags", element: <AdminFeatureFlags /> },
                    { path: "feedback", element: <AdminFeedback /> },
                    { path: "audit-log", element: <AdminAuditLog /> }
                ]
            }
        ]
    }
])
