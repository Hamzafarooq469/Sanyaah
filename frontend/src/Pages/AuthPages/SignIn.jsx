import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../../Services/Firebase';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setImam } from '../../Store/slices/imamSlices';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import { startAuthentication } from "@simplewebauthn/browser"


const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [totpRequired, setTotpRequired] = useState(false);
  const [totpToken, setTotpToken] = useState('');
  const [pendingUser, setPendingUser] = useState(null); // store user for after TOTP

  const [passkeyEmail, setPasskeyEmail] = useState('')
  const [showPasskeyEmail, setShowPasskeyEmail] = useState(false)

  const handleEmailandPassword = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Enter all fields');
      return;
    }

    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = result.user;
      const idToken = await user.getIdToken(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL_SIGNIN}`,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      // If TOTP is enabled, show code input instead of navigating
      if (response.data.totp_enabled) {
        setPendingUser({ user, imamData: response.data });
        setTotpRequired(true);
        return;
      }

      dispatch(setImam(response.data));
      toast.success(`Welcome back, ${response.data.name || 'User'}!`);
      navigate('/dashboard');
    } catch (error) {
       if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-email"
      ) {
        toast.error("Invalid email or password"); // ← generic message
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const isNewUser = result._tokenResponse?.isNewUser;
      if (isNewUser) {
        await user.delete();
        toast.error("No account found. Please sign up first");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await axios.post(
        import.meta.env.VITE_API_URL_SIGNIN,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (response.data.totp_enabled) {
        setPendingUser({ user, imamData: response.data });
        setTotpRequired(true);
        return;
      }

      dispatch(setImam(response.data));
      toast.success(`Welcome back, ${response.data.name || 'User'}!`);
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Google sign-in failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTOTPVerify = async () => {
    if (!totpToken.trim())
      return toast.error('Please enter the code from your authenticator app');

    setLoading(true);
    try {
      const idToken = await pendingUser.user.getIdToken();

      await axios.post(
        import.meta.env.VITE_API_URL_TOTP_SIGNIN,
        { token: totpToken },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      dispatch(setImam(pendingUser.imamData));
      toast.success(`Welcome back, ${pendingUser.imamData.name || 'User'}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    if (!passkeyEmail.trim())
        return toast.error("Please enter your email first")

    setLoading(true)
    try {
        // Step 1 - Get auth options from backend
        const optionsResponse = await axios.post(
            import.meta.env.VITE_API_URL_PASSKEY_AUTH_OPTIONS,
            { email: passkeyEmail.trim() }
        )

        // Step 2 - Trigger device biometric prompt
        const authResponse = await startAuthentication(optionsResponse.data)

        // Step 3 - Verify with backend
        const response = await axios.post(
            import.meta.env.VITE_API_URL_PASSKEY_AUTH_VERIFY,
            { email: passkeyEmail.trim(), body: authResponse }
        )

        dispatch(setImam(response.data))
        toast.success(`Welcome back, ${response.data.name || 'User'}!`)
        navigate('/dashboard')
    } catch (error) {
        if (error.name === "NotAllowedError") {
            toast.error("Passkey authentication cancelled")
        } else {
            toast.error(error.response?.data?.message || "Passkey sign in failed")
        }
    } finally {
        setLoading(false)
    }
}

  // TOTP screen
  if (totpRequired) {
    return (
      <div className="signin-container">
        <div className="signin-card">
          <div className="signin-header">
            <h1 className="signin-title">Two-Factor Authentication</h1>
            <p className="signin-subtitle">Enter the 6-digit code from your authenticator app</p>
          </div>
          <div className="form-group">
            <label className="form-label">Authentication Code</label>
            <input
              className="form-input"
              placeholder="000000"
              type="text"
              maxLength={6}
              value={totpToken}
              onChange={(e) => setTotpToken(e.target.value)}
              disabled={loading}
            />
          </div>
          <button className="btn-primary-signin" onClick={handleTOTPVerify} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h1 className="signin-title">Welcome Back</h1>
          <p className="signin-subtitle">Sign in to your Imam portal to continue</p>
        </div>

        <form className="signin-form" onSubmit={handleEmailandPassword}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary-signin" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="signin-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="btn-google-signin"
          onClick={handleGoogleSignIn}
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
          
          {loading ? 'Please wait...' : 'Continue with Google'}
        </button>

                <div className="signin-divider">
          <span>OR</span>
      </div>

              {showPasskeyEmail ? (
          <div className="form-group">
              <label className="form-label">Email for Passkey</label>
              <input
                  className="form-input"
                  placeholder="name@example.com"
                  type="email"
                  value={passkeyEmail}
                  onChange={(e) => setPasskeyEmail(e.target.value)}
                  disabled={loading}
              />
              <button
                  type="button"
                  className="btn-google-signin"
                  onClick={handlePasskeySignIn}
                  disabled={loading}
                  style={{ marginTop: "10px" }}
              >
                  {loading ? "Verifying..." : "Sign in with Passkey"}
              </button>
          </div>
      ) : (
          <button
              type="button"
              className="btn-google-signin"
              onClick={() => setShowPasskeyEmail(true)}
              disabled={loading}
          >
              Sign in with Passkey (Fingerprint / Face ID)
          </button>
      )}

      </div>
    </div>
  );
};

export default SignIn;