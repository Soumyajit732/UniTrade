import { useState } from "react";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("user");
      }
    }

    return null;
  });
  const [loading] = useState(false);

  /* ================= SET USER + PERSIST ================= */
  const setUser = (userData) => {
    setUserState(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /* ================= LOGIN ================= */
  const login = (data) => {
    // 🔥 KEEP FULL USER OBJECT (including profilePic)
    const fullUser = data.user;

    setUser(fullUser);
    localStorage.setItem("token", data.token);
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    setUserState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,   // 🔥 IMPORTANT: used by Profile page
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
