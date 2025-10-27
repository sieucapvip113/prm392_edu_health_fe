import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Layout from "../components/Layout/Layout";
import ParentLayout from "../components/Layout/ParentLayout";
import About from "../pages/Home/About";
import News from "../pages/Home/News";
import NewsDetail from "../pages/Home/NewsDetail";
import Contact from "../pages/Home/Contact";
import Login from "../pages/Login/Login";
import Nurse from "../components/Sidebar/Nurse";
import Parent from "../pages/Parent/Parent";
import ProtectedRoute from "../roles/ProtectedRoute";
import AdminLayout from "../components/Layout/AdminLayout";
// Admin pages
import HealthOverview from "../pages/Admin/Dashboard/HealthOverview";
import HealthEvents from "../pages/Admin/Reports/HealthEvents";
import VaccinationReports from "../pages/Admin/Reports/VaccinationReports";
import UserManagement from "../pages/Admin/Management/UserManagement";
import UserDetail from "../pages/Admin/Management/UserDetail";
import ContentManagement from "../pages/Admin/Management/ContentManagement";
import Children from "../pages/Parent/Children";
import SendMedication from "../pages/Parent/SendMedication";
import Vaccine from "../pages/Parent/Vaccine";
import Checkup from "../pages/Parent/Checkup";
import Event from "../pages/Parent/Event";
import Manage_medical from '../pages/Nurse/Manage_medical';
import Manage_healthcheck from '../pages/Nurse/Manage_healthcheck';
import Manage_vaccine from '../pages/Nurse/Manage_vaccine';
import Manage_medical_events from '../pages/Nurse/Manage_medical_events';
import Detail_medical_event from '../pages/Nurse/Detail_medical_event';
import HealthCheckStudents from '../pages/Nurse/HealthCheckStudents';
import VaccineEventStudents from '../pages/Nurse/VaccineEventStudents';
import ForgotPasswordPage from '../pages/Login/ForgotPasswordPage';
import NurseDashboard from "../pages/Nurse/Dashboard";
import ProfileParent from '../pages/Parent/Profile';
import ProfileNurse from '../pages/Nurse/Profile';
import Manage_health_records from '../pages/Nurse/Manage_health_records';

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/gioi-thieu" element={<About />} />
                <Route path="/tin-tuc" element={<News />} />
                <Route path="/tintuc/:slug" element={<NewsDetail />} />
                <Route path="/lien-he" element={<Contact />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="health-overview" element={<HealthOverview />} />
                <Route path="reports">
                    <Route path="health-events" element={<HealthEvents />} />
                    <Route path="vaccination" element={<VaccinationReports />} />
                </Route>
                <Route path="management">
                    <Route path="users" element={<UserManagement />} />
                    <Route path="users/:id" element={<UserDetail />} />
                    <Route path="content" element={<ContentManagement />} />
                </Route>
            </Route>
            <Route
                path="/nurse"
                element={
                    <ProtectedRoute allowedRoles={["Nurse"]}>
                        <Nurse />
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<NurseDashboard />} />
                <Route path="medical" element={<Manage_medical />} />
                <Route path="healthcheck" element={<Manage_healthcheck />} />
                <Route path="healthcheck/students/:hcId" element={<HealthCheckStudents />} />
                <Route path="vaccine" element={<Manage_vaccine />} />
                <Route path="health-records" element={<Manage_health_records />} />
                <Route path="medical-events" element={<Manage_medical_events />} />
                <Route path="medical-events/detail/:id" element={<Detail_medical_event />} />
                <Route path="vaccine-events">
                    <Route path=":eventName/:eventGade/:eventDate" element={<VaccineEventStudents />} />
                </Route>
                <Route path="profile" element={<ProfileNurse />} />
            </Route>
            <Route
                path="/guardian"
                element={
                    <ProtectedRoute allowedRoles={["Guardian"]}>
                        <ParentLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Parent />} />
                <Route path="children" element={<Children />} />
                <Route path="medications" element={<SendMedication />} />
                <Route path="vaccines" element={<Vaccine />} />
                <Route path="checkups" element={<Checkup />} />
                <Route path="events" element={<Event />} />
                <Route path="profile" element={<ProfileParent />} />
            </Route>
            <Route path="*" element={<Login />} />
        </Routes>
    );
}