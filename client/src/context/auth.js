let user = null;
let authStatus = false;

let setUser = (newUser) => {
  user = newUser;
};

let setAuthStatus = (value) => {
  authStatus = value;
};

const AuthContext = {
  getUser: () => user.username || null,
  getToken: () => user.token || null,
  isAuth: () => {
    if (authStatus === true) return true;

    const localUser = JSON.parse(localStorage.getItem("user-credentials"));

    if (localUser) {
      setUser(localUser);
      setAuthStatus(true);
      return true;
    }

    return false;
  },
  // Note: It isnt obvious but this should only be used after a 200 status login has returned from the server.
  // It is client side only and does not actually verify a valid login
  login: (user, after = null) => {
    localStorage.setItem("user-credentials", JSON.stringify(user));
    setUser(user);
    setAuthStatus(true);
    after && after();
  },
  logout: (after = null) => {
    localStorage.removeItem("user-credentials");
    setUser(null);
    setAuthStatus(false);
    window.location.reload();
  },

  fetchWithAuth: async (url, options) => {
    if (AuthContext.isAuth() == false) {
      // Handle the case where there's no token (e.g., redirect to login)
      console.error("No JWT token available, the user may not be logged in");
      return;
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${AuthContext.getToken()}`,
    };

    try {
      const response = await fetch(url, { method: "GET", headers });
      // Handle response status or other checks if needed
      if (!response.ok) {
        // Handle non-OK responses
        console.error("Error:", response.status, response.statusText);
        throw new Error("Fetch error");
      }

      // Assuming you want to handle JSON responses
      const data = await response.json();
      return data;
    } catch (error) {
      // Handle fetch errors
      console.error("Fetch error:", error.message);
      throw error;
    }
  },
};

// Get a reference to the current auth context
export function useAuth() {
  return AuthContext;
}
