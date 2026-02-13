import { useState } from "react";
import { supabase } from "./supabase-client";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    console.log("Submitted email:", email);
    console.log("Submitted password:", password);
    if (!email || !password) {
      setMessage("Email and password are required.");
      setLoading(false);
      return;
    }
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(`Error: ${error.message}`);
      console.error("Supabase error:", error);
    } else {
      console.log("Auth data:", data);
      setMessage(
        isSignUp
          ? "Check your email for confirmation!"
          : "Logged in successfully!",
      );
    }

    setLoading(false);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="auth-card">
      <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="add-button">
          {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <hr />

      <button onClick={() => setIsSignUp(!isSignUp)} className="add-button">
        {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
      </button>

     
    </div>
  );
}
