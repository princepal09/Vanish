import { Routes, Route } from "react-router-dom";

import CreateNote from "./pages/CreateNote";
import RevealNote from "./pages/RevealNote";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar/Navbar";

const App = () => {
  const isRevealPage = location.pathname.startsWith("/note/");

  return (
    <>

    {!isRevealPage && <Navbar/>}
      <Routes>
        <Route path="/" element={<CreateNote />} />
        <Route path="/note/:token" element={<RevealNote />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
};

export default App;
