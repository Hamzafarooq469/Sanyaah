import { useState } from "react"
import toast from 'react-hot-toast'
import axios from "axios"
import "./Home.css"

const TEHSILS = [
    "Lahore City", "Shalimar", "Raiwind",
    "Rawalpindi City", "Taxila", "Gujar Khan", "Kaller Syedan", "Murree",
    "Faisalabad City", "Jaranwala", "Samundri",
    "Multan City", "Shujabad", "Jalalpur Pirwala",
    "Sialkot City", "Daska", "Sambrial",
    "Gujranwala City", "Wazirabad", "Kamoke",
    "Bahawalpur City", "Ahmadpur East",
    "Attock City", "Hazro", "Fateh Jang",
    "Chakwal City", "Talagang",
    "Jhelum City", "Pind Dadan Khan",
    "Karachi East", "Karachi West", "Karachi Central", "Karachi South",
    "Hyderabad City", "Latifabad", "Qasimabad",
    "Sukkur City", "Rohri", "Pano Aqil",
    "Larkana City", "Dokri",
    "Peshawar City", "Mattani",
    "Mardan City", "Takht Bhai",
    "Abbottabad City", "Havelian", "Mansehra",
    "Mingora", "Matta", "Bahrain",
    "Quetta City", "Samungli",
    "Gwadar City", "Pasni",
    "Turbat City", "Mand",
    "Gilgit City", "Jutial",
    "Skardu City", "Shigar",
    "Karimabad", "Aliabad",
    "Muzaffarabad City", "Garhi Dopatta",
    "Mirpur City", "Dadyal",
    "Rawalakot City", "Bagh",
    "Islamabad City", "Kahuta"
].sort()

const Home = () => {
    const [tehsil, setTehsil] = useState("")
    const [mosques, setMosques] = useState([])
    const [selectedMosque, setSelectedMosque] = useState(null)
    const [announcements, setAnnouncements] = useState([])
    const [loadingMosques, setLoadingMosques] = useState(false)
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(false)

    const handleTehsilChange = async (e) => {
        const value = e.target.value
        setTehsil(value)
        setSelectedMosque(null)
        setAnnouncements([])
        setMosques([])

        if (!value) return

        setLoadingMosques(true)
        try {
            const res = await axios.get(
                import.meta.env.VITE_API_URL_MOSQUESBYLOCATION,
                { params: { tehsil: value } }
            )
            setMosques(Array.isArray(res.data) ? res.data : [])
        } catch (error) {
            console.error("Fetch mosques error:", error)
            toast.error("Failed to load mosques")
            setMosques([])
        } finally {
            setLoadingMosques(false)
        }
    }

    const handleMosqueClick = async (mosque) => {
        setSelectedMosque(mosque)
        setLoadingAnnouncements(true)
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL_ANNOUNCEMENTSBYMOSQUE}/${mosque.id}`
            )
            setAnnouncements(Array.isArray(res.data) ? res.data : [])
        } catch (error) {
            console.error("Fetch announcements error:", error)
            toast.error("Failed to load announcements")
        } finally {
            setLoadingAnnouncements(false)
        }
    }

    return (
        <div className="home-container">
            {/* Header Section */}
            <div className="home-header">
                <h1 className="home-title">Janaza & Mosque Announcements</h1>
                <p className="home-subtitle">
                    Select your tehsil to view registered mosques and local funeral announcements.
                </p>
            </div>

            {/* Tehsil Dropdown Filter Card */}
            <div className="home-filter-card">
                <label htmlFor="tehsil-select" className="home-filter-label">
                    Select Tehsil
                </label>
                <select
                    id="tehsil-select"
                    value={tehsil}
                    onChange={handleTehsilChange}
                    className="home-filter-select"
                >
                    <option value="">-- Choose Tehsil --</option>
                    {TEHSILS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            {/* Loading / Empty Mosque State */}
            {loadingMosques && (
                <div className="home-state-message">
                    Loading mosques in {tehsil}...
                </div>
            )}

            {!loadingMosques && tehsil && mosques.length === 0 && (
                <div className="home-empty-mosques">
                    No registered mosques found in <strong>{tehsil}</strong>.
                </div>
            )}

            {/* Mosques List (Pill Buttons) */}
            {mosques.length > 0 && (
                <div className="home-mosques-card">
                    <h2 className="home-section-title">
                        Mosques in {tehsil}
                    </h2>
                    <div className="home-mosques-pill-group">
                        {mosques.map((m) => {
                            const isSelected = selectedMosque?.id === m.id
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => handleMosqueClick(m)}
                                    className={`btn-mosque-pill ${isSelected ? "active" : ""}`}
                                >
                                    {m.name} {m.area ? `(${m.area})` : ""}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Selected Mosque & Announcements Feed */}
            {selectedMosque && (
                <div>
                    <div className="home-selected-mosque-header">
                        <h2 className="home-selected-mosque-title">
                            {selectedMosque.name}
                        </h2>
                        <div className="home-selected-mosque-meta">
                            {selectedMosque.area && <span>{selectedMosque.area}</span>}
                            {selectedMosque.area && selectedMosque.address && <span> • </span>}
                            {selectedMosque.address && <span>{selectedMosque.address}</span>}
                        </div>
                    </div>

                    {loadingAnnouncements && (
                        <div className="home-state-message">
                            Loading announcements...
                        </div>
                    )}

                    {!loadingAnnouncements && announcements.length === 0 && (
                        <div className="home-empty-announcements">
                            No announcements posted for this mosque yet.
                        </div>
                    )}

                    {/* Announcement Cards */}
                    {!loadingAnnouncements && announcements.map((item) => (
                        <div key={item.id} className="home-announcement-card">
                            {/* Deceased Header */}
                            <div className="announcement-card-header">
                                <div className="announcement-card-tag">
                                    Inna Lillahi Wa Inna Ilayhi Raji'un
                                </div>
                                <h3 className="announcement-card-name">
                                    {item.deceased_name}
                                    {item.deceased_nickname && (
                                        <span className="announcement-card-nickname">
                                            (Known as: {item.deceased_nickname})
                                        </span>
                                    )}
                                </h3>
                            </div>

                            {/* Details Grid */}
                            <div className="announcement-details-grid">
                                {item.relative_names && (
                                    <div>
                                        <span className="announcement-field-label">Family / Relatives: </span>
                                        <strong>{item.relative_names}</strong>
                                    </div>
                                )}

                                {item.deceased_address && (
                                    <div>
                                        <span className="announcement-field-label">Home Address: </span>
                                        {item.deceased_address}
                                    </div>
                                )}

                                {item.announcement_area && (
                                    <div>
                                        <span className="announcement-field-label">Area / Village: </span>
                                        {item.announcement_area}
                                    </div>
                                )}

                                <div>
                                    <span className="announcement-field-label">Janaza Time: </span>
                                    <strong className="announcement-field-value-strong">
                                        {item.janaza_time ? new Date(item.janaza_time).toLocaleString() : "To be announced"}
                                    </strong>
                                </div>

                                {item.janaza_location && (
                                    <div>
                                        <span className="announcement-field-label">Janaza Location: </span>
                                        {item.janaza_location}
                                    </div>
                                )}
                            </div>

                            {/* Footer Date */}
                            <div className="announcement-card-footer">
                                Posted: {new Date(item.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Home