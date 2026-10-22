import { BrowserRouter } from "react-router-dom";
import { DemoProvider } from "../providers/DemoProvider";
import AppRoutes from "../routes/routes";
import "../../styles/tokens.css";
import "../../styles/global.css";
import "../../styles/utilities.css";
import "./App.css";

export default function App() {
  return <BrowserRouter><DemoProvider><AppRoutes /></DemoProvider></BrowserRouter>;
}
