import Analytics from "@/view/analytics";
import Explorer from "@/view/explorer";
import HeaderLayout from "@/view/layouts/HeaderLayout";
import MainPage from "@/view/main";
import SignIn from "@/view/signIn";
import SignUp from "@/view/signup";
import Users from "@/view/users";
import WeatherDetailedData from "@/view/WeatherDetailedData";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthGuard from "./AuthGuard";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthGuard />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<HeaderLayout />}>
            <Route path="/" element={<MainPage />} />  
          </Route>  
        </Route>

        <Route element={<AuthGuard isPrivate/>}>
          <Route element={<HeaderLayout />}>
            <Route path="/weather" element={<WeatherDetailedData />} />
            <Route path="/users" element={<Users />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/explorer" element={<Explorer />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;