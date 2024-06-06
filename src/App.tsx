import { Route, Routes } from "react-router-dom";

import Coin from "./pages/Coin";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="relative    min-h-screen ">
      <Routes>
        <Route path="/" element={<Header></Header>}>
          <Route index element={<Home></Home>}></Route>

          <Route path="/coin/:id" element={<Coin></Coin>}></Route>
        </Route>
      </Routes>
      <Footer></Footer>
    </div>
  );
};

export default App;
