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
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import PracticeSetup from "./features/practice/pages/PracticeSetup";
import PracticeSession from "./features/practice/pages/PracticeSession";
import MarketingPage from "./pages/marketing/MarketingPage";
import PricingPage from "./pages/marketing/PricingPage";

const marketing = (slug) => <MarketingPage slug={slug} />

export const router = createBrowserRouter([
    // Auth routes (no AppLayout wrapper — AuthLayout owns the chrome)
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/reset-password/:token",
        element: <ResetPassword />
    },
    {
        path: "/verify-email/:token",
        element: <VerifyEmail />
    },
    // Main app + marketing routes share Header/Footer via AppLayout
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true, element: <Landing /> },
            { path: "dashboard", element: <Protected><Dashboard /></Protected> },
            { path: "history", element: <Protected><InterviewHistory /></Protected> },
            { path: "interview/new", element: <Protected><Home /></Protected> },
            { path: "practice", element: <Protected><PracticeSetup /></Protected> },
            { path: "practice/:sessionId", element: <Protected><PracticeSession /></Protected> },
            { path: "interview/:interviewId", element: <Protected><Interview /></Protected> },
            { path: "profile", element: <Protected><Profile /></Protected> },
            { path: "feedback", element: <Protected><Feedback /></Protected> },

            // Public marketing / legal pages
            { path: "features", element: marketing("features") },
            { path: "pricing", element: <PricingPage /> },
            { path: "about", element: marketing("about") },
            { path: "contact", element: marketing("contact") },
            { path: "faq", element: marketing("faq") },
            { path: "how-it-works", element: marketing("how-it-works") },
            { path: "blog", element: marketing("blog") },
            { path: "careers", element: marketing("careers") },
            { path: "support", element: marketing("support") },
            { path: "support/contact", element: marketing("contact") },
            { path: "security", element: marketing("security") },
            { path: "status", element: marketing("status") },
            { path: "documentation", element: marketing("documentation") },
            { path: "docs/api", element: marketing("documentation") },
            { path: "privacy", element: marketing("privacy") },
            { path: "terms", element: marketing("terms") },
            { path: "legal/privacy", element: marketing("privacy") },
            { path: "legal/terms", element: marketing("terms") },
            { path: "legal/cookies", element: marketing("cookies") },
            { path: "legal/gdpr", element: marketing("privacy") },

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
            },
            { path: "*", element: <NotFound /> }
        ]
    }
])
