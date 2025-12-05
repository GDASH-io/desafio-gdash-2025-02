export function useAuthUser() {
  return {
    name: localStorage.getItem("user_name") || "Admin",
    email: localStorage.getItem("user_email") || "",
  };
}
