import { render, screen, within } from "@testing-library/react";
import LandingPage from "../app/page";
import "@testing-library/jest-dom";

describe("LandingPage", () => {
  it("renders the page title", () => {
    render(<LandingPage />);
    const titleElements = screen.getAllByText(/fit nutrition/i);
    expect(titleElements.length).toBeGreaterThanOrEqual(1);
    expect(titleElements[0]).toHaveTextContent("Fit Nutrition");
  });

  it("renders the hero section with heading and search button", () => {
    render(<LandingPage />);
    const heading = screen.getByText(/find your perfect dietitian/i);
    expect(heading).toBeInTheDocument();

    const searchButton = screen.getByRole("button", { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it("renders the navigation links", () => {
    render(<LandingPage />);
    const homeLink = screen.getByRole("button", { name: /home/i });
    const dietitiansLink = screen.getByRole("button", { name: /dietitians/i });
    const blogLink = screen.getByRole("button", { name: /blog/i });
    const panelLink = screen.getByRole("button", { name: /dietitian panel/i });

    expect(homeLink).toBeInTheDocument();
    expect(dietitiansLink).toBeInTheDocument();
    expect(blogLink).toBeInTheDocument();
    expect(panelLink).toBeInTheDocument();
  });

  it("renders success stories", () => {
    render(<LandingPage />);
    const successStoriesTitle = screen.getByText(/success stories/i);
    expect(successStoriesTitle).toBeInTheDocument();
    const testimonialCards = screen.getAllByRole("article");
    expect(testimonialCards.length).toBeGreaterThan(0);
    testimonialCards.forEach((card) => {
      const name = within(card).getByRole("heading", { level: 6 });
      const description = within(card).getByText(/i like this site/i);
      const image = within(card).getByRole("img");

      expect(name).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(image).toBeInTheDocument();
    });
  });

  it("renders the footer", () => {
    render(<LandingPage />);
    const footerText = screen.getByText(/© 2024 fit nutrition/i);
    expect(footerText).toBeInTheDocument();
  });
});
