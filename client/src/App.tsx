import { Routes, Route } from "react-router-dom";

import CreateNote from "./pages/CreateNote";
import RevealNote from "./pages/RevealNote";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<CreateNote />} />
      <Route path="/note/:token" element={<RevealNote />} />
    </Routes>
  );
};

export default App;
