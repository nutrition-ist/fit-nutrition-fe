import { render, screen, within } from "@testing-library/react";
import LandingPage from "../app/page";
import "@testing-library/jest-dom";

describe("LandingPage", () => {
  beforeEach(() => render(<LandingPage />));

  it("shows the hero headline", () => {
    expect(
      screen.getByRole("heading", { name: /find your perfect dietitian/i })
    ).toBeInTheDocument();
  });

  it("renders all top‑nav links", () => {
    ["Find a Dietitian", "Blog", "Login"].forEach((text) => {
      expect(screen.getByRole("button", { name: text })).toBeInTheDocument();
    });
  });

  it("displays four service cards", () => {
    const section =
      screen.getByRole("heading", { name: /services/i }).closest("section") ||
      screen.getByRole("heading", { name: /services/i }).parentElement;

    const utils = within(section as HTMLElement);
    const cards = utils.getAllByRole("img", {
      name: /personalized|meal planning with ai|customizable recipes|ai recipe generator/i,
    });

    expect(cards).toHaveLength(4);
  });

  it("shows the three key metrics", () => {
    ["8,500+", "2,500+", "150,000+"].forEach((num) => {
      expect(screen.getByText(num)).toBeInTheDocument();
    });
  });

  it("renders the fixed footer", () => {
    expect(screen.getByText(/© \d{4} fit nutrition/i)).toBeInTheDocument();
  });
});
