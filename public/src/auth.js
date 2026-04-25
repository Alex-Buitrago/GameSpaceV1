export async function login(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
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
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error);

  return data;
}

export function checkAuth() {
  const user = localStorage.getItem("user");

  if (!user && location.pathname.includes("game.html")) {
    window.location.href = "/login.html";
  }
}