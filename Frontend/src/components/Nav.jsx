import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <nav>
      <Link to="/selection">Selection</Link>{" "}
      <Link to="/battle">Battle</Link>{" "}
      <Link to="/result">Result</Link>
    </nav>
  );
}