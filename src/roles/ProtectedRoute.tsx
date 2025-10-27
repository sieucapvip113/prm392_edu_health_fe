import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type Role = "Admin" | "Manager" | "Nurse" | "Guardian" | "Student";

interface User {
    username: string;
    role: Role;
}

interface Props {
    children: ReactNode;
    allowedRoles: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
    const userStr = localStorage.getItem("user");
    const user: User | null = userStr ? JSON.parse(userStr) : null;

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
