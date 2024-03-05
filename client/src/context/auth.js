let user = null;
let authStatus = false;

let setUser = (newUser) => {
  user = newUser;
}

let setAuthStatus = (value) => {
  authStatus = value;
}

const AuthContext = {
  getUser: () => (user.username || null),
  getToken: () => (user.token || null),
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
    after && after();
  }
};

// Get a reference to the current auth context
export function useAuth() {
  return AuthContext;
}
