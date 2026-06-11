import { Navigate, Outlet } from "react-router-dom";


function ProtectedRoute() {

    const loginUser =
        localStorage.getItem(
            "loginUser"
        );

    if (!loginUser) {

        return (
            <Navigate to="/" />
        );
    }

    return (
        <Outlet />
    );
}

export default ProtectedRoute;