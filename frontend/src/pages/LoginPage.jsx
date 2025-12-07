import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(email, password);
            navigate("/inbox");
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error ||
                "Failed to login. Please check credentials."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="card shadow-sm" style={{ width: "100%", maxWidth: 420 }}>
                <div className="card-body p-4">
                    <h3 className="text-center mb-3">Login</h3>

                    {error && (
                        <div className="alert alert-danger py-2" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={submitting}
                        >
                            {submitting ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="text-center mt-3 mb-0">
                        Don&apos;t have an account?{" "}
                        <Link to="/register">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
