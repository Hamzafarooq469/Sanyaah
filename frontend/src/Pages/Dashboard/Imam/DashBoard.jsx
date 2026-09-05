import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "../../../Services/Firebase"

// Modular sub-components
import Overview from "./OverView"
import CreateAnnouncement from "./CreateAnnoucement"
import ManageAnnouncements from "./ManageAnnouncements"
import MyMosque from "./MyMosque"

import "./DashBoard.css"

const DashBoard = () => {
    const [activeTab, setActiveTab] = useState("overview")
    const [mosque, setMosque] = useState(null)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                try {
                    const idToken = await currentUser.getIdToken(true)
                    const result = await axios.get(
                        import.meta.env.VITE_API_URL_MYMOSQUE,
                        { headers: { Authorization: `Bearer ${idToken}` } }
                    )
                    setMosque(result.data)
                } catch (err) {
                    console.error("Dashboard error:", err)
                }
            } else {
                setUser(null)
            }
        })

        return () => unsubscribe()
    }, [])

    const handleLogout = async () => {
        try {
            await signOut(auth)
            toast.success("Logged out successfully")
        } catch (err) {
            toast.error("Logout failed")
        }
    }

    const navItems = [
        { key: "overview", label: "Overview" },
        { key: "create", label: "New Announcement" },
        { key: "manage", label: "Manage Announcements" },
        { key: "mosque", label: "Mosque Profile" }
    ]

    return (
        <div className="dashboard-container">
            {/* Sidebar Navigation */}
            <aside className="dashboard-sidebar">
                <div>
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Imam Portal</h2>
                        <span className="sidebar-subtitle">{mosque?.name || "Admin Panel"}</span>
                    </div>

                    <nav className="sidebar-nav">
                        {navItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                className={`sidebar-nav-button ${activeTab === item.key ? "active" : ""}`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Bottom User / Sign Out */}
                <div className="sidebar-footer">
                    <div className="sidebar-user-email">
                        {user?.email || "Logged in"}
                    </div>
                    <button onClick={handleLogout} className="btn-signout">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Pane */}
            <main className="dashboard-main-content">
                {activeTab === "overview" && (
                    <Overview
                        mosque={mosque}
                        onNavigateToCreate={() => setActiveTab("create")}
                    />
                )}

                {activeTab === "create" && (
                    <CreateAnnouncement onCreated={() => setActiveTab("manage")} />
                )}

                {activeTab === "manage" && (
                    <ManageAnnouncements mosque={mosque} />
                )}

                {activeTab === "mosque" && <MyMosque />}
            </main>
        </div>
    )
}

export default DashBoard