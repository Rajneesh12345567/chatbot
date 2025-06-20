import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { checkAuth } from "./features/auth/authThunks";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Chats from "./pages/Chats";
import { Toaster } from "react-hot-toast";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />

        <Route
          path="/chat/:chatId"
          element={isAuthenticated ? <Chats /> : <Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register />}
        />
      </Routes>
    </>
  );
}

export default App;
