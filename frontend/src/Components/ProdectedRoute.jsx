
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Services/Firebase";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const imam = useSelector((state) => state.imam.imam); 

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthenticated(!!user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!authenticated || !imam) return <Navigate to="/signIn" />; 

    return children;
};

export default ProtectedRoute;