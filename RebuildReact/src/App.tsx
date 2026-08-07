import "./styles/common.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage/LoginPage";
import HomePage from "./pages/HomePage/HomePage";
import TopicChoice from "./pages/CreateMangaPage/TopicChoice";
import MemoPage from "./pages/MemoPage/MemoPage"
import CreateMangaPage from "./pages/CreateMangaPage/CreateMangaPage"
import StoryCreatePage from "./pages/StoryCreatePage/StoryCreatePage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={ <LoginPage /> } />

        <Route path="/register" element={ <RegisterPage /> } />


        <Route element={<ProtectedRoute />}>

          <Route path="/home" element={<HomePage />} />

          <Route path="/MemoPage" element={<MemoPage />} />

          <Route path="/StoryCreatePage" element={ <StoryCreatePage />} />

          <Route path="/TopicChoice" element={<TopicChoice />} />

          <Route path="/CreateMangaPage" element={<CreateMangaPage />} />

        </Route>
        
        
      </Routes>

    </BrowserRouter>
  );
}

export default App;