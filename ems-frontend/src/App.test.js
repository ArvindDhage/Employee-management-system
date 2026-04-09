import { render } from "@testing-library/react";
import App from "./App";

test("renders without crashing", () => {
  // App contains BrowserRouter — this verifies it mounts cleanly
  render(<App />);
});