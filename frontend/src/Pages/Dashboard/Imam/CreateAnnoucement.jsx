import { useState } from "react"
import toast from 'react-hot-toast'
import { auth } from "../../../Services/Firebase"
import axios from "axios"
import "./CreateAnnouncement.css"

const CreateAnnouncement = ({ onCreated }) => {
    const [deceasedName, setDeceasedName] = useState("")
    const [deceasedNickName, setDeceasedNickName] = useState("")
    const [deceasedAddress, setDeceasedAddress] = useState("")
    const [area, setArea] = useState("")
    const [relativeNames, setRelativeNames] = useState("")
    const [janazaTime, setJanazaTime] = useState("")
    const [janazaLocation, setJanazaLocation] = useState("")
    const [loading, setLoading] = useState(false)

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault()

        if (!deceasedName.trim()) {
            return toast.error("Deceased name is required")
        }

        const user = auth.currentUser
        if (!user) {
            return toast.error("You must be logged in to create an announcement")
        }

        setLoading(true)

        try {
            const idToken = await user.getIdToken(true)

            const payload = {
                deceased_name: deceasedName.trim(),
                deceased_nickName: deceasedNickName.trim() || null,
                deceased_address: deceasedAddress.trim() || null,
                area: area.trim() || null,
                relative_names: relativeNames.trim() || null,
                janaza_time: janazaTime ? new Date(janazaTime).toISOString() : null,
                janaza_location: janazaLocation.trim() || null
            }

            await axios.post(
                import.meta.env.VITE_API_URL_CREATEANNOUNCEMENT,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                }
            )

            toast.success("Announcement created successfully")

            // Reset form
            setDeceasedName("")
            setDeceasedNickName("")
            setDeceasedAddress("")
            setArea("")
            setRelativeNames("")
            setJanazaTime("")
            setJanazaLocation("")

            if (onCreated) {
                onCreated()
            }

        } catch (error) {
            console.error("Create announcement error:", error)
            toast.error(error.response?.data?.message || "Failed to create announcement")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="create-announcement-container">
            <div className="create-announcement-header">
                <h1 className="create-announcement-title">Create Janaza Announcement</h1>
                <p className="create-announcement-subtitle">
                    Post a new funeral announcement for your community.
                </p>
            </div>

            <div className="create-announcement-card">
                <form className="announcement-form" onSubmit={handleCreateAnnouncement}>
                    <div className="form-group">
                        <label>Deceased Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Haji Muhammad Aslam"
                            value={deceasedName}
                            onChange={(e) => setDeceasedName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Known As / Nickname <span>(Optional)</span></label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Aslam Pehlwan"
                            value={deceasedNickName}
                            onChange={(e) => setDeceasedNickName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Family / Relatives <span>(Optional)</span></label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Father of Tariq Aslam and Rashid Aslam"
                            value={relativeNames}
                            onChange={(e) => setRelativeNames(e.target.value)}
                        />
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Area / Sector / Village <span>(Optional)</span></label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Commercial Market / Sector F-6"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Home Address <span>(Optional)</span></label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. House # 142, Street 5, Block B"
                                value={deceasedAddress}
                                onChange={(e) => setDeceasedAddress(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Namaz-e-Janaza Time <span>(Optional / TBA)</span></label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={janazaTime}
                                onChange={(e) => setJanazaTime(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Janaza Location <span>(Optional)</span></label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Gordon College Ground"
                                value={janazaLocation}
                                onChange={(e) => setJanazaLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-submit-announcement"
                        disabled={loading}
                    >
                        {loading ? "Publishing Announcement..." : "Submit Announcement"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateAnnouncement