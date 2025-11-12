import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function normalizeRole(r) {
  return String(r || "").toUpperCase().replace(/^ROLE_/, "");
}

export default function RequireAuth({ allowed }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:8090/api/me", {
          credentials: "include",
        });
        if (!alive) return;

        if (!res.ok) {
          setAuthorized(false);
          return;
        }

        const me = await res.json(); // { userId, email, name, role }
        const role = normalizeRole(me && me.role);

        // if no "allowed" provided → any authenticated user is allowed
        const ok =
          !allowed || allowed.length === 0
            ? true
            : allowed.map(normalizeRole).includes(role);

        setAuthorized(ok);
      } catch {
        setAuthorized(false);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [location.pathname, allowed && allowed.join(",")]);

  if (loading) return null; // or a spinner component
  if (!authorized)
    return (
      <Navigate to="/authentication" replace state={{ from: location }} />
    );

  return <Outlet />;
}
