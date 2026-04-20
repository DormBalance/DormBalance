'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/auth";
import "./login.css";

export default function LoginPage() {
    const { signIn, signUp } = useAuth();
    const router = useRouter();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = isSignUp
            ? await signUp(email, password)
            : await signIn(email, password);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">FairShare</h1>
                    <p className="login-subtitle">{isSignUp ? "Create your account" : "Sign in to your account"}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label className="login-label">Email</label>
                        <input
                            className="login-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label className="login-label">Password</label>
                        <input
                            className="login-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                    </button>
                </form>

                <p className="login-toggle">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <button className="login-toggle-btn" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
                        {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
