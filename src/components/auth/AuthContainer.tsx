import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm";
import { doc, setDoc, updateDoc, Timestamp } from "firebase/firestore";

interface AuthContainerProps {
  auth: any;
  db: any;
  mode: "signin" | "signup";
}

const AuthContainer = ({ auth, mode, db }: AuthContainerProps) => {
  const [errorMessage, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (email: string, password: string) => {
    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Add user to database
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        lastSeen: Timestamp.now(),
        online: true,
      });
      // AuthProvider will handle redirecting to dashboard
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Set user's online status to true
      await updateDoc(doc(db, "users", userCredential.user.uid), {
        online: true,
        lastSeen: Timestamp.now(),
      });
      // AuthProvider will handle redirecting to dashboard
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  };

  const toggleMode = () => {
    navigate(mode === "signin" ? "/signup" : "/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h1>
        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        <AuthForm
          onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
          mode={mode}
        />
        <div className="mt-4 text-center">
          <button
            onClick={toggleMode}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
