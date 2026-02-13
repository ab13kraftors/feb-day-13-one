import "./App.css";
import Auth from "./auth";
import TaskManager from "./task-manager";
import { supabase } from "./supabase-client";
import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const currSession = await supabase.auth.getSession();
      setSession(currSession.data.session);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="app-wrapper">
      {session ? (
        <div className="todo-card card-with-logout">
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
          <TaskManager session={session} />
        </div>
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;
