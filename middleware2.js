import { useAuth } from "@/context/AuthContext";

export async function middleware({ pathname }) {
  const publicRoutes = ["/(login)"];
  if (publicRoutes.includes(pathname)) {
    return;
  }

  const { user } = useAuth();

  if (!user.username || Object.keys(user).length === 0) {
    return {
      redirect: "/(login)",
    };
  }
}
