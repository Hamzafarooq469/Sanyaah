
import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useSelector } from 'react-redux'
import "./OverView.css";

const Overview = ({ mosque, onNavigateToCreate }) => {
    const [recentAnnouncements, setRecentAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)

    const user = useSelector((state) => state.imam.imam)

    useEffect(() => {
        const fetchRecent = async () => {
            if (!mosque?.id) return
            setLoading(true)
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL_ANNOUNCEMENTSBYMOSQUE}/${mosque.id}`
                )
                setRecentAnnouncements(Array.isArray(res.data) ? res.data : [])
            } catch (err) {
                console.error("Fetch announcements error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchRecent()
    }, [mosque])

    const copyWhatsAppText = (item) => {
        const text = `*Inna Lillahi Wa Inna Ilayhi Raji'un*\n\n*Janaza Announcement*\n*Deceased:* ${item.deceased_name} ${item.deceased_nickname ? `(${item.deceased_nickname})` : ""}\n*Mosque:* ${mosque?.name || ""}\n*Time:* ${item.janaza_time ? new Date(item.janaza_time).toLocaleString() : "To be announced"}\n*Location:* ${item.janaza_location || "To be confirmed"}\n${item.relative_names ? `*Family:* ${item.relative_names}\n` : ""}\n_Please recite Surah Fatiha for the departed soul._`
        navigator.clipboard.writeText(text)
        toast.success("WhatsApp message copied to clipboard!")
    }

    return (
        <div className="overview-container">
            {/* Header */}
            <div className="overview-header">
                <div>
                    <h2 className="overview-title">
                        Welcome, Qari {user?.name || "Imam"}
                    </h2>
                    <p className="overview-subtitle">
                        Manage announcements and community updates for your mosque.
                    </p>
                </div>
                <button
                    onClick={onNavigateToCreate}
                    className="btn-create-announcement"
                >
                    + New Announcement
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="overview-metrics-grid">
                <div className="metric-card">
                    <span className="metric-label">Total Posted</span>
                    <div className="metric-value-large">
                        {recentAnnouncements.length}
                    </div>
                </div>
                <div className="metric-card">
                    <span className="metric-label">Mosque Location</span>
                    <div className="metric-value-medium">
                        {mosque?.tehsil || "Not set"}, {mosque?.district || ""}
                    </div>
                </div>
            </div>

            {/* Announcements Feed */}
            <div className="overview-feed-card">
                <h3 className="overview-feed-title">Recent Announcements</h3>

                {loading && (
                    <p className="overview-status-text">Loading announcements...</p>
                )}

                {!loading && recentAnnouncements.length === 0 && (
                    <p className="overview-empty-text">
                        No announcements posted yet. Click "+ New Announcement" above to publish one.
                    </p>
                )}

                {!loading && recentAnnouncements.map((item) => (
                    <div key={item.id} className="announcement-item">
                        <div>
                            <div className="announcement-deceased-name">
                                {item.deceased_name} {item.deceased_nickname ? `(${item.deceased_nickname})` : ""}
                            </div>
                            <div className="announcement-meta">
                                Janaza: <strong>{item.janaza_time ? new Date(item.janaza_time).toLocaleString() : "TBA"}</strong> | Location: {item.janaza_location || "TBA"}
                            </div>
                        </div>
                        <button
                            onClick={() => copyWhatsAppText(item)}
                            className="btn-whatsapp-share"
                        >
                            Copy WhatsApp Share
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Overview