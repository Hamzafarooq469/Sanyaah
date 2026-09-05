import { useState } from "react"
import toast from 'react-hot-toast'
import { auth } from "../../../Services/Firebase"
import axios from "axios"
import { getData } from "country-list"
import "./MosqueSetup.css"

const capitalize = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase())

const PROVINCES = [
    "Punjab",
    "Sindh",
    "Khyber Pakhtunkhwa",
    "Balochistan",
    "Gilgit-Baltistan",
    "Azad Jammu & Kashmir",
    "Islamabad Capital Territory"
]

const PAKISTAN_DATA = {
    "Punjab": {
        "Lahore": ["Lahore City", "Shalimar", "Raiwind"],
        "Rawalpindi": ["Rawalpindi City", "Taxila", "Gujar Khan", "Kaller Syedan", "Kahuta", "Murree"],
        "Faisalabad": ["Faisalabad City", "Jaranwala", "Samundri"],
        "Multan": ["Multan City", "Shujabad", "Jalalpur Pirwala"],
        "Sialkot": ["Sialkot City", "Daska", "Sambrial"],
        "Gujranwala": ["Gujranwala City", "Wazirabad", "Kamoke"],
        "Bahawalpur": ["Bahawalpur City", "Ahmadpur East"],
        "Attock": ["Attock City", "Hazro", "Fateh Jang"],
        "Chakwal": ["Chakwal City", "Talagang"],
        "Jhelum": ["Jhelum City", "Pind Dadan Khan"],
    },
    "Sindh": {
        "Karachi": ["Karachi East", "Karachi West", "Karachi Central", "Karachi South"],
        "Hyderabad": ["Hyderabad City", "Latifabad", "Qasimabad"],
        "Sukkur": ["Sukkur City", "Rohri", "Pano Aqil"],
        "Larkana": ["Larkana City", "Dokri"],
    },
    "Khyber Pakhtunkhwa": {
        "Peshawar": ["Peshawar City", "Mattani"],
        "Mardan": ["Mardan City", "Takht Bhai"],
        "Abbottabad": ["Abbottabad City", "Havelian", "Mansehra"],
        "Swat": ["Mingora", "Matta", "Bahrain"],
    },
    "Balochistan": {
        "Quetta": ["Quetta City", "Samungli"],
        "Gwadar": ["Gwadar City", "Pasni"],
        "Turbat": ["Turbat City", "Mand"],
    },
    "Gilgit-Baltistan": {
        "Gilgit": ["Gilgit City", "Jutial"],
        "Skardu": ["Skardu City", "Shigar"],
        "Hunza": ["Karimabad", "Aliabad"],
    },
    "Azad Jammu & Kashmir": {
        "Muzaffarabad": ["Muzaffarabad City", "Garhi Dopatta"],
        "Mirpur": ["Mirpur City", "Dadyal"],
        "Rawalakot": ["Rawalakot City", "Bagh"],
    },
    "Islamabad Capital Territory": {
        "Islamabad": ["Islamabad City", "Kahuta"],
    }
}

const MosqueSetup = () => {
    const [mosqueName, setMosqueName] = useState("")
    const [tehsil, setTehsil] = useState("")
    const [district, setDistrict] = useState("")
    const [province, setProvince] = useState("")
    const [country, setCountry] = useState("PK")
    const [area, setArea] = useState("")
    const [address, setAddress] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const countries = getData()
    const districts = province ? Object.keys(PAKISTAN_DATA[province] || {}) : []
    const tehsils = (province && district) ? (PAKISTAN_DATA[province][district] || []) : []

    const handleProvinceChange = (e) => {
        setProvince(e.target.value)
        setDistrict("")
        setTehsil("")
    }

    const handleDistrictChange = (e) => {
        setDistrict(e.target.value)
        setTehsil("")
    }

    const clearForm = () => {
        setMosqueName("")
        setTehsil("")
        setDistrict("")
        setProvince("")
        setCountry("PK")
        setArea("")
        setAddress("")
    }

    const handleMosqueSetup = async (e) => {
        e.preventDefault()

        if (!mosqueName || !tehsil || !district || !province || !country || !area || !address) {
            return toast.error("Please fill in all the required fields")
        }

        const user = auth.currentUser
        if (!user) {
            return toast.error("You must be logged in to register a mosque")
        }

        setSubmitting(true)
        try {
            const idToken = await user.getIdToken(true)

            await axios.post(
                import.meta.env.VITE_API_URL_MOSQUESETUP,
                { mosqueName, tehsil, district, province, country, area, address },
                { headers: { Authorization: `Bearer ${idToken}` } }
            )

            toast.success("Mosque registered successfully!")
            clearForm()
        } catch (error) {
            console.error("Mosque setup error:", error)
            toast.error(error.response?.data?.message || "Something went wrong")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mosque-setup-container">
            <div className="mosque-setup-header">
                <h1 className="mosque-setup-title">Register Mosque</h1>
                <p className="mosque-setup-subtitle">
                    Set up your mosque location to start publishing announcements.
                </p>
            </div>

            <div className="mosque-setup-card">
                <form className="mosque-form" onSubmit={handleMosqueSetup}>
                    
                    <div className="form-group">
                        <label>Mosque Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Jamia Masjid Bilal"
                            value={mosqueName}
                            onChange={(e) => setMosqueName(capitalize(e.target.value))}
                            required
                        />
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>Country *</label>
                            <select 
                                className="form-select"
                                value={country} 
                                onChange={(e) => setCountry(e.target.value)}
                            >
                                {countries.map((c) => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Province / Region *</label>
                            <select 
                                className="form-select"
                                value={province} 
                                onChange={handleProvinceChange}
                                required
                            >
                                <option value="">Select Province</option>
                                {PROVINCES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div className="form-group">
                            <label>District *</label>
                            <select 
                                className="form-select"
                                value={district} 
                                onChange={handleDistrictChange} 
                                disabled={!province}
                                required
                            >
                                <option value="">Select District</option>
                                {districts.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Tehsil *</label>
                            <select 
                                className="form-select"
                                value={tehsil} 
                                onChange={(e) => setTehsil(e.target.value)} 
                                disabled={!district}
                                required
                            >
                                <option value="">Select Tehsil</option>
                                {tehsils.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Area / Sector / Village *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Commercial Market / Sector F-6 / Village Doberan"
                            value={area}
                            onChange={(e) => setArea(capitalize(e.target.value))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Full Address *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Block B, Satellite Town, Near Old Post Office"
                            value={address}
                            onChange={(e) => setAddress(capitalize(e.target.value))}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-submit-mosque"
                        disabled={submitting}
                    >
                        {submitting ? "Registering Mosque..." : "Register Mosque"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default MosqueSetup