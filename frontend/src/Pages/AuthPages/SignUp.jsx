import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { auth } from "../../Services/Firebase";
import "./SignUp.css";

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailPasswordSignUp = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password) {
            return toast.error("Please fill in all fields");
        }
        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setLoading(true);
        try {
            const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const user = result.user;
            const idToken = await user.getIdToken();

            await axios.post(
                import.meta.env.VITE_API_URL_SIGNUP,
                { name: name.trim() },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            toast.success("Account created! Welcome aboard");
        } catch (error) {
            console.error("Signup error:", error);

            if (error.code === "auth/email-already-in-use") {
                toast.error("Email already in use.");
            } else {
                toast.error(
                    "Registration failed: " +
                    (error.response?.data?.message || error.response?.data || error.message)
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const user = result.user;
            const idToken = await user.getIdToken();

            await axios.post(
                import.meta.env.VITE_API_URL_SIGNUP,
                { name: user.displayName || "" },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            toast.success("Account created! Welcome aboard");
        } catch (error) {
            console.error("Google signup error:", error);

            if (error.code === "auth/account-exists-with-different-credential") {
                toast.error("An account already exists with this email.");
            } else if (error.code === "auth/popup-closed-by-user") {
                toast.error("Popup closed before completing sign-up.");
            } else {
                toast.error(
                    "Google sign-up failed: " +
                    (error.response?.data?.message || error.response?.data || error.message)
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h1 className="signup-title">Create an Account</h1>
                    <p className="signup-subtitle">Register to manage your mosque and announcements</p>
                </div>

                <form className="signup-form" onSubmit={handleEmailPasswordSignUp}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            placeholder="e.g. Qari Abdul Rehman"
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            placeholder="name@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            placeholder="Min. 6 characters"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="btn-primary-signup" disabled={loading}>
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <div className="signup-divider">
                    <span>OR</span>
                </div>

                <button
                    type="button"
                    className="btn-google-signup"
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                >
                    <svg className="google-icon" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                    </svg>
                    {loading ? "Please wait..." : "Continue with Google"}
                </button>
            </div>
        </div>
    );
};

export default SignUp;