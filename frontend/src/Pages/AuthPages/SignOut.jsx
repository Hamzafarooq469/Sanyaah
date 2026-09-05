import { useState, useEffect } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../Services/Firebase'
import { useDispatch } from 'react-redux'
import { clearImam } from '../../Store/slices/imamSlices'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import './SignOut.css'

const SignOut = () => {
    const [user, setUser] = useState(null)
    const [authChecking, setAuthChecking] = useState(true)
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setAuthChecking(false)
        })

        return () => unsubscribe()
    }, [])

    const handleSignOut = async () => {
        setLoading(true)
        try {
            await signOut(auth)
            dispatch(clearImam())
            toast.success("Signed out successfully")
            navigate("/signin")
        } catch (error) {
            console.error("Sign out error:", error)
            toast.error("Sign out failed: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    if (authChecking) {
        return (
            <div className="signout-container">
                <div className="signout-card">
                    <p className="signout-status-loading">Checking session...</p>
                </div>
            </div>
        )
    }

    // When NOT logged in: Show "Already Signed Out" view (no sign out options)
    if (!user) {
        return (
            <div className="signout-container">
                <div className="signout-card">
                    <div className="signout-icon-wrapper signout-icon-muted">
                        <svg className="signout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    <h1 className="signout-title">Not Logged In</h1>
                    <p className="signout-subtitle">
                        You do not currently have an active session.
                    </p>

                    <Link to="/signin" className="btn-goto-signin">
                        Go to Sign In
                    </Link>
                </div>
            </div>
        )
    }

    // When LOGGED IN: Show confirmation card
    return (
        <div className="signout-container">
            <div className="signout-card">
                <div className="signout-icon-wrapper">
                    <svg
                        className="signout-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                </div>

                <h1 className="signout-title">Sign Out</h1>
                <p className="signout-subtitle">
                    Are you sure you want to sign out of <strong>{user.email}</strong>?
                </p>

                <div className="signout-actions">
                    <button
                        type="button"
                        className="btn-confirm-signout"
                        onClick={handleSignOut}
                        disabled={loading}
                    >
                        {loading ? "Signing out..." : "Yes, Sign Out"}
                    </button>
                    <button
                        type="button"
                        className="btn-cancel-signout"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SignOut