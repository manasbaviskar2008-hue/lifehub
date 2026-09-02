import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("lifehub_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);


  // ===============================
  // Save user in localStorage
  // ===============================
  useEffect(() => {

    if (user) {
      localStorage.setItem(
        "lifehub_user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("lifehub_user");
    }

  }, [user]);


  // ===============================
  // LOGIN
  // ===============================
  const login = async (email, password) => {

    setLoading(true);

    try {

      const response = await API.post(
        "/users/login",
        {
          email: email.trim(),
          password: password,
        }
      );

      if (response.data) {

        setUser(response.data);

        return {
          success: true,
          user: response.data,
        };
      }

      return {
        success: false,
        error: "Invalid email or password.",
      };

    } catch (error) {

      console.error(
        "Login failed:",
        error.response?.data || error.message
      );

      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Invalid email or password.",
      };

    } finally {

      setLoading(false);

    }
  };


  // ===============================
  // REGISTER
  // ===============================
  const register = async (userData) => {

    setLoading(true);

    try {

      const response = await API.post(
        "/users/register",
        userData
      );

      if (!response.data) {

        return {
          success: false,
          error: "Registration failed.",
        };
      }

      const newUser = response.data;

      setUser(newUser);

      return {
        success: true,
        user: newUser,
      };

    } catch (error) {

      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );

      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };

    } finally {

      setLoading(false);

    }
  };


  // ===============================
  // DEMO LOGIN
  // ===============================
  const demoLogin = (role = "demo") => {

    const demoUser = {
      id: 999,
      fullName:
        role === "admin"
          ? "Alex Morgan (Admin)"
          : "Demo User",
      email:
        role === "admin"
          ? "admin@lifehub.com"
          : "demo@lifehub.com",
      phone: "+91 9876543210",
      role: "USER",
    };

    setUser(demoUser);

    return demoUser;
  };


  // ===============================
  // UPDATE PROFILE
  // ===============================
  const updateProfile = async (updatedFields) => {

    const updatedUser = {
      ...user,
      ...updatedFields,
    };

    setUser(updatedUser);

    localStorage.setItem(
      "lifehub_user",
      JSON.stringify(updatedUser)
    );

    try {

      if (user?.id) {

        await API.put(
          `/users/${user.id}`,
          updatedUser
        );
      }

    } catch (error) {

      console.warn(
        "Backend user update warning:",
        error.message
      );

    }

    return updatedUser;
  };


  // ===============================
  // LOGOUT
  // ===============================
  const logout = () => {

    setUser(null);

    localStorage.removeItem(
      "lifehub_user"
    );
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        demoLogin,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}


export default AuthContext;