import { useEffect, useState } from "react"
import axios from "axios"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../../Services/Firebase"
import "./MyMosque.css"

const MyMosque = () => {
    const [mosque, setMosque] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const idToken = await user.getIdToken(true)

                    const result = await axios.get(
                        import.meta.env.VITE_API_URL_MYMOSQUE,
                        { headers: { Authorization: `Bearer ${idToken}` } }
                    )

                    setMosque(result.data)
                } catch (err) {
                    console.error("My mosque error:", err)
                    setError(err.response?.data?.message || "Failed to load mosque data")
                } finally {
                    setLoading(false)
                }
            } else {
                setLoading(false)
                setError("Please log in to view your mosque details.")
            }
        })

        return () => unsubscribe()
    }, [])

    if (loading) {
        return <div className="mymosque-status mymosque-loading">Loading mosque details...</div>
    }

    if (error) {
        return <div className="mymosque-status mymosque-error">{error}</div>
    }

    return (
        <div className="mymosque-container">
            <div className="mymosque-header">
                <h1 className="mymosque-title">My Mosque</h1>
                <p className="mymosque-subtitle">Official registered details for your mosque.</p>
            </div>

            {mosque ? (
                <div className="mymosque-card">
                    <div className="mymosque-hero">
                        <h2 className="mymosque-name">{mosque.name}</h2>
                        {mosque.area && <span className="mymosque-area-badge">{mosque.area}</span>}
                    </div>

                    <div className="mymosque-grid">
                        <div className="mymosque-info-item">
                            <span className="mymosque-label">Full Address</span>
                            <span className="mymosque-value">{mosque.address || "Not provided"}</span>
                        </div>

                        <div className="mymosque-info-item">
                            <span className="mymosque-label">Tehsil</span>
                            <span className="mymosque-value">{mosque.tehsil || "Not specified"}</span>
                        </div>

                        <div className="mymosque-info-item">
                            <span className="mymosque-label">District</span>
                            <span className="mymosque-value">{mosque.district || "Not specified"}</span>
                        </div>

                        <div className="mymosque-info-item">
                            <span className="mymosque-label">Province</span>
                            <span className="mymosque-value">{mosque.province || "Not specified"}</span>
                        </div>

                        <div className="mymosque-info-item">
                            <span className="mymosque-label">Country</span>
                            <span className="mymosque-value">{mosque.country || "PK"}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mymosque-status mymosque-empty">No mosque details found.</div>
            )}
        </div>
    )
}

export default MyMosque