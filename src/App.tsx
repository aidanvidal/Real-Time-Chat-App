import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth, db } from "./firebase";
import AuthContainer from "./components/auth/AuthContainer";
import MainChat from "./components/chat/MainChat";
import "./App.css";

// TODO:
// Make the frontend for the main chat page
// Create a way to send messages 
// Create a way to display messages
// Create a way to display users online
// Ensure messages are stored in the database with correct history

// Structure:
// Mainchat contains a sidebar and a chat window
// Sidebar contains a list of chats the user is in
// Another clickable button to create a new chat with a user or group
// Each chat will be a separate component
// Each chat component will contain a list of messages
// Each message will be a separate component
// Each message will contain the user who sent it and the message content and the time it was sent
// The messages will be displayed in a list with the newest messages at the bottom

// Backend:
// The sending of messages will be done through a function that will add the message to the database
// the function will be in the main chat component
// The function will take the value from a form from the chat component and add it to the database

function App() {
  return (
    <AuthProvider auth={auth} db={db}>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                <AuthRedirect>
                  <AuthContainer auth={auth} db={db} mode="signin" />
                </AuthRedirect>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthRedirect>
                  <AuthContainer auth={auth} db={db} mode="signup" />
                </AuthRedirect>
              }
            />
            <Route path="/dashboard" element={<MainChat auth={auth} db={db} />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Redirect to dashboard if already logged in
const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default App;
