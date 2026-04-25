export async function login(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  localStorage.setItem("user", JSON.stringify(data.user));
  window.location.href = "/game.html";
}

export async function register(email, password) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  return data;
}

export function checkAuth() {
  const user = localStorage.getItem("user");
  if (!user) {
    window.location.href = "/login.html";
    return null;
  }
  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("user");
    window.location.href = "/login.html";
    return null;
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}
