import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthPage() {
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await signup(form);
      }
    } catch (submitError) {
      setError(submitError.message || "Authentication failed.");
    }
  }

  return (
    <div className="container">
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
      <p>Demo admin: admin@popscore.com / Admin@123</p>
      <p>Demo user: user@popscore.com / User@123</p>
      {error ? <p>{error}</p> : null}
      <form onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <p>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </p>
        ) : null}
        <p>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </p>
        <p>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </p>
        <button type="submit">{mode === "login" ? "Login" : "Create account"}</button>
      </form>
      <p>
        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
      </p>
    </div>
  );
}

export default AuthPage;
