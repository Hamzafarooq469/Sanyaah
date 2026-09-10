import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../../Services/Firebase"
import { startRegistration } from "@simplewebauthn/browser"
import "./Security.css"

const Security = () => {
    const [loading, setLoading] = useState(false)
    const [qrCode, setQrCode] = useState(null)
    const [token, setToken] = useState("")
    const [totpEnabled, setTotpEnabled] = useState(false)
    const [passkeyEnabled, setPasskeyEnabled] = useState(false)
    const [step, setStep] = useState("idle")
    const [user, setUser] = useState(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) setUser(currentUser)
        })
        return () => unsubscribe()
    }, [])

    const getIdToken = async () => await user.getIdToken(true)

    // TOTP handlers
    const handleSetup = async () => {
        setLoading(true)
        try {
            const idToken = await getIdToken()
            const response = await axios.post(
                import.meta.env.VITE_API_URL_TOTP_SETUP,
                {},
                { headers: { Authorization: `Bearer ${idToken}` } }
            )
            setQrCode(response.data.qrCode)
            setStep("setup")
            toast.success("Scan the QR code with Google Authenticator")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to setup 2FA")
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        if (!token.trim())
            return toast.error("Please enter the code from your authenticator app")

        setLoading(true)
        try {
            const idToken = await getIdToken()
            await axios.post(
                import.meta.env.VITE_API_URL_TOTP_VERIFY,
                { token },
                { headers: { Authorization: `Bearer ${idToken}` } }
            )
            setTotpEnabled(true)
            setStep("idle")
            setQrCode(null)
            setToken("")
            toast.success("2FA enabled successfully")
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid code, please try again")
        } finally {
            setLoading(false)
        }
    }

    // Passkey handlers
    const handlePasskeyRegister = async () => {
        setLoading(true)
        try {
            const idToken = await getIdToken()

            // Step 1 - Get options from backend
            const optionsResponse = await axios.post(
                import.meta.env.VITE_API_URL_PASSKEY_REGISTER_OPTIONS,
                {},
                { headers: { Authorization: `Bearer ${idToken}` } }
            )

            // Step 2 - Trigger device biometric prompt
            const registrationResponse = await startRegistration(optionsResponse.data)

            // Step 3 - Send result to backend to verify and save
            await axios.post(
                import.meta.env.VITE_API_URL_PASSKEY_REGISTER_VERIFY,
                registrationResponse,
                { headers: { Authorization: `Bearer ${idToken}` } }
            )

            setPasskeyEnabled(true)
            toast.success("Passkey registered successfully")
        } catch (error) {
            if (error.name === "NotAllowedError") {
                toast.error("Passkey registration cancelled")
            } else {
                toast.error(error.response?.data?.message || "Failed to register passkey")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="security-container">
            <div className="security-header">
                <h1 className="security-title">Security</h1>
                <p className="security-subtitle">
                    Manage two-factor authentication and passkeys for your account.
                </p>
            </div>

            {/* TOTP Section */}
            <div className="security-card">
                <div className="security-section">
                    <h3 className="security-section-title">Two-Factor Authentication (2FA)</h3>
                    <p className="security-section-desc">
                        Add an extra layer of security using Google Authenticator.
                    </p>

                    {totpEnabled ? (
                        <div className="security-enabled-badge">
                            ✓ 2FA is enabled on your account
                        </div>
                    ) : (
                        <>
                            {step === "idle" && (
                                <button
                                    className="btn-setup-totp"
                                    onClick={handleSetup}
                                    disabled={loading}
                                >
                                    {loading ? "Setting up..." : "Enable 2FA"}
                                </button>
                            )}

                            {step === "setup" && qrCode && (
                                <div className="security-qr-section">
                                    <p className="security-qr-instructions">
                                        Scan this QR code with Google Authenticator, then enter the code below.
                                    </p>
                                    <img
                                        src={qrCode}
                                        alt="2FA QR Code"
                                        className="security-qr-code"
                                    />
                                    <div className="security-token-input-group">
                                        <input
                                            type="text"
                                            className="security-token-input"
                                            placeholder="Enter 6-digit code"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            maxLength={6}
                                            disabled={loading}
                                        />
                                        <button
                                            className="btn-verify-totp"
                                            onClick={handleVerify}
                                            disabled={loading}
                                        >
                                            {loading ? "Verifying..." : "Verify & Enable"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Passkey Section */}
            <div className="security-card" style={{ marginTop: "20px" }}>
                <div className="security-section">
                    <h3 className="security-section-title">Passkey (Fingerprint / Face ID)</h3>
                    <p className="security-section-desc">
                        Sign in instantly using your device biometrics — no password needed.
                    </p>

                    {passkeyEnabled ? (
                        <div className="security-enabled-badge">
                            ✓ Passkey is registered on your account
                        </div>
                    ) : (
                        <button
                            className="btn-setup-totp"
                            onClick={handlePasskeyRegister}
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register Passkey"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Security