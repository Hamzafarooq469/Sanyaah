import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { auth } from "../../../Services/Firebase"
import "./ManageAnnouncements.css"

const ManageAnnouncements = ({ mosque }) => {
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingItem, setEditingItem] = useState(null)
    const [updating, setUpdating] = useState(false)

    // Form state for editing
    const [formData, setFormData] = useState({
        deceased_name: "",
        deceased_nickName: "",
        deceased_address: "",
        area: "",
        relative_names: "",
        janaza_time: "",
        janaza_location: ""
    })

    const fetchAnnouncements = async () => {
        if (!mosque?.id) return
        setLoading(true)
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL_ANNOUNCEMENTSBYMOSQUE}/${mosque.id}`
            )
            setAnnouncements(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            console.error("Fetch error:", err)
            toast.error("Failed to load announcements")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [mosque])

    // Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return

        try {
            const idToken = await auth.currentUser.getIdToken(true)
            await axios.delete(
                `${import.meta.env.VITE_API_URL_ANNOUNCEMENTS}/${id}`,
                { headers: { Authorization: `Bearer ${idToken}` } }
            )
            toast.success("Announcement deleted successfully")
            setAnnouncements((prev) => prev.filter((item) => item.id !== id))
        } catch (err) {
            console.error("Delete error:", err)
            toast.error(err.response?.data?.message || "Failed to delete announcement")
        }
    }

    // Open Edit Modal
    const handleOpenEdit = (item) => {
        setEditingItem(item)
        setFormData({
            deceased_name: item.deceased_name || "",
            deceased_nickName: item.deceased_nickname || item.deceased_nickName || "",
            deceased_address: item.deceased_address || "",
            area: item.announcement_area || item.area || "",
            relative_names: item.relative_names || "",
            janaza_time: item.janaza_time ? new Date(item.janaza_time).toISOString().slice(0, 16) : "",
            janaza_location: item.janaza_location || ""
        })
    }

    // Submit Update
    const handleUpdate = async (e) => {
        e.preventDefault()
        setUpdating(true)

        try {
            const idToken = await auth.currentUser.getIdToken(true)
            const payload = {
                deceased_name: formData.deceased_name.trim(),
                deceased_nickName: formData.deceased_nickName.trim() || null,
                deceased_address: formData.deceased_address.trim() || null,
                area: formData.area.trim() || null,
                relative_names: formData.relative_names.trim() || null,
                janaza_time: formData.janaza_time ? new Date(formData.janaza_time).toISOString() : null,
                janaza_location: formData.janaza_location.trim() || null
            }

            await axios.put(
                `${import.meta.env.VITE_API_URL_ANNOUNCEMENTS}/${editingItem.id}`,
                payload,
                { headers: { Authorization: `Bearer ${idToken}` } }
            )

            toast.success("Announcement updated")
            setEditingItem(null)
            fetchAnnouncements()
        } catch (err) {
            console.error("Update error:", err)
            toast.error(err.response?.data?.message || "Failed to update announcement")
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="manage-announcements-container">
            <div className="manage-header">
                <h2 className="manage-title">Manage Announcements</h2>
                <p className="manage-subtitle">Edit timings, update details, or delete past announcements.</p>
            </div>

            {loading && <p className="manage-status-text">Loading announcements...</p>}

            {!loading && announcements.length === 0 && (
                <div className="manage-empty-card">
                    No announcements found for this mosque.
                </div>
            )}

            {!loading && announcements.map((item) => (
                <div key={item.id} className="manage-announcement-card">
                    <div className="manage-announcement-info">
                        <div className="manage-deceased-name">
                            {item.deceased_name}
                            {item.deceased_nickname && (
                                <span className="manage-nickname">({item.deceased_nickname})</span>
                            )}
                        </div>
                        <div className="manage-announcement-meta">
                            Janaza: <strong>{item.janaza_time ? new Date(item.janaza_time).toLocaleString() : "TBA"}</strong> | Location: {item.janaza_location || "TBA"}
                        </div>
                    </div>

                    <div className="manage-actions-group">
                        <button
                            onClick={() => handleOpenEdit(item)}
                            className="btn-action-edit"
                        >
                             Edit
                        </button>
                        <button
                            onClick={() => handleDelete(item.id)}
                            className="btn-action-delete"
                        >
                             Delete
                        </button>
                    </div>
                </div>
            ))}

            {/* Inline Edit Modal */}
            {editingItem && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Edit Announcement</h3>

                        <form className="modal-form" onSubmit={handleUpdate}>
                            <div className="modal-form-group">
                                <label>Deceased Name *</label>
                                <input
                                    type="text"
                                    className="modal-input"
                                    value={formData.deceased_name}
                                    onChange={(e) => setFormData({ ...formData, deceased_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="modal-form-group">
                                <label>Known As / Nickname</label>
                                <input
                                    type="text"
                                    className="modal-input"
                                    value={formData.deceased_nickName}
                                    onChange={(e) => setFormData({ ...formData, deceased_nickName: e.target.value })}
                                />
                            </div>

                            <div className="modal-form-group">
                                <label>Family / Relatives</label>
                                <input
                                    type="text"
                                    className="modal-input"
                                    value={formData.relative_names}
                                    onChange={(e) => setFormData({ ...formData, relative_names: e.target.value })}
                                />
                            </div>

                            <div className="modal-form-group">
                                <label>Area / Village</label>
                                <input
                                    type="text"
                                    className="modal-input"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                />
                            </div>

                            <div className="modal-form-group">
                                <label>Home Address</label>
                                <input
                                    type="text"
                                    className="modal-input"
                                    value={formData.deceased_address}
                                    onChange={(e) => setFormData({ ...formData, deceased_address: e.target.value })}
                                />
                            </div>

                            <div className="modal-row-2">
                                <div className="modal-form-group">
                                    <label>Janaza Time</label>
                                    <input
                                        type="datetime-local"
                                        className="modal-input"
                                        value={formData.janaza_time}
                                        onChange={(e) => setFormData({ ...formData, janaza_time: e.target.value })}
                                    />
                                </div>
                                <div className="modal-form-group">
                                    <label>Janaza Location</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        value={formData.janaza_location}
                                        onChange={(e) => setFormData({ ...formData, janaza_location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="btn-modal-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="btn-modal-save"
                                >
                                    {updating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManageAnnouncements