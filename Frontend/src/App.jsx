import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Nav from "./components/Nav";
import Welcome from "./pages/welcome";
import Selection from "./pages/Selection";
import BattleLanding from "./pages/BattleLanding";
import BattleList from "./pages/battleList";
import Battle from "./pages/Battle";
import Result from "./pages/Result";

export default function App() {
  return (
    <Layout>
      <Nav />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/selection" element={<Selection />} />
        <Route path="/battle" element={<BattleLanding />} />
        <Route path="/battle/history" element={<BattleList />} />
        <Route path="/battle/play" element={<Battle />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Layout>
  );
}