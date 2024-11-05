import { User } from "@/types/user.type";
import { createContext } from "react";

export const AuthContext = createContext({
  user: null as unknown as User | null | undefined,
  setUser: (user: User | null | undefined) => {},
});
