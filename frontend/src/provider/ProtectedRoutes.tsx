import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem("token")
    return token ? children : <Navigate to="/" />
}