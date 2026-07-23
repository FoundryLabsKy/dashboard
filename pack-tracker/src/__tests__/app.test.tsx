import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

const SETTINGS = {
  brand: "Marlboro Red",
  packSize: 20,
  price: 9.5,
  currency: "USD",
  onboarded: true,
};

function seedOnboarded() {
  localStorage.setItem("pack-tracker.settings", JSON.stringify(SETTINGS));
}

beforeEach(() => {
  localStorage.clear();
});

describe("onboarding", () => {
  it("shows onboarding on first launch and completes it", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("What do you smoke?")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Preferred brand"), "Camel Blue");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Pack size?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "25" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Typical price?")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Typical price"), "8.20");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Currency?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "EUR" }));
    await user.click(screen.getByRole("button", { name: "Done" }));

    // Lands on Home with the chosen brand.
    expect(await screen.findByText("Camel Blue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Buy New Pack/ })).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem("pack-tracker.settings")!);
    expect(stored).toMatchObject({
      brand: "Camel Blue",
      packSize: 25,
      price: 8.2,
      currency: "EUR",
      onboarded: true,
    });
  });
});

describe("log flow", () => {
  it("taps Buy New Pack, confirms, and the entry appears in timeline and stats", async () => {
    seedOnboarded();
    const user = userEvent.setup();
    render(<App />);

    // Home shows brand and empty state.
    expect(screen.getByText("Marlboro Red")).toBeInTheDocument();
    expect(screen.getByText("No packs logged yet")).toBeInTheDocument();

    // Tap the big button → confirmation sheet slides up.
    await user.click(screen.getByRole("button", { name: /Buy New Pack/ }));
    expect(await screen.findByText("Did you buy another pack?")).toBeInTheDocument();

    // Confirm.
    await user.click(screen.getByRole("button", { name: "Yes" }));

    // Home updates instantly.
    expect(await screen.findByText("Last pack: today")).toBeInTheDocument();

    // Entry persisted.
    const purchases = JSON.parse(localStorage.getItem("pack-tracker.purchases")!);
    expect(purchases).toHaveLength(1);
    expect(purchases[0]).toMatchObject({ brand: "Marlboro Red", packSize: 20, price: 9.5 });
    expect(typeof purchases[0].timestamp).toBe("number");

    // Timeline shows it grouped under Today.
    await user.click(screen.getByRole("button", { name: "Timeline" }));
    expect(await screen.findByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getAllByText("Marlboro Red").length).toBeGreaterThan(0);
    expect(screen.getByText("$9.50")).toBeInTheDocument();

    // Stats update.
    await user.click(screen.getByRole("button", { name: "Stats" }));
    const totalRow = (await screen.findByText("Total spent")).parentElement!;
    expect(within(totalRow).getByText("$9.50")).toBeInTheDocument();
    const packsRow = screen.getByText("Total packs").parentElement!;
    expect(within(packsRow).getByText("1")).toBeInTheDocument();
    const cigsRow = screen.getByText("Total cigarettes").parentElement!;
    expect(within(cigsRow).getByText("20")).toBeInTheDocument();
  });

  it("cancel does not log anything", async () => {
    seedOnboarded();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Buy New Pack/ }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(localStorage.getItem("pack-tracker.purchases")).toBeNull();
    expect(screen.getByText("No packs logged yet")).toBeInTheDocument();
  });
});

describe("timeline editing", () => {
  it("edits and deletes an entry", async () => {
    seedOnboarded();
    localStorage.setItem(
      "pack-tracker.purchases",
      JSON.stringify([
        { id: "e1", timestamp: Date.now(), brand: "Marlboro Red", packSize: 20, price: 9.5 },
      ]),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Timeline" }));
    await user.click(await screen.findByText("$9.50"));
    expect(await screen.findByText("Edit purchase")).toBeInTheDocument();

    const priceInput = screen.getByLabelText("Price");
    await user.clear(priceInput);
    await user.type(priceInput, "11");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("$11.00")).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem("pack-tracker.purchases")!);
    expect(stored[0].price).toBe(11);

    // Now delete it.
    await user.click(screen.getByText("$11.00"));
    await user.click(await screen.findByRole("button", { name: "Delete Entry" }));
    expect(await screen.findByText("Nothing here yet")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("pack-tracker.purchases")!)).toHaveLength(0);
  });
});

describe("settings", () => {
  it("edits settings and they apply to the next log", async () => {
    seedOnboarded();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    const brandInput = await screen.findByLabelText("Brand");
    await user.clear(brandInput);
    await user.type(brandInput, "Lucky Strike");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    const stored = JSON.parse(localStorage.getItem("pack-tracker.settings")!);
    expect(stored.brand).toBe("Lucky Strike");

    await user.click(screen.getByRole("button", { name: "Home" }));
    expect(await screen.findByText("Lucky Strike")).toBeInTheDocument();
  });

  it("erases all data after confirmation", async () => {
    seedOnboarded();
    localStorage.setItem(
      "pack-tracker.purchases",
      JSON.stringify([
        { id: "e1", timestamp: Date.now(), brand: "Marlboro Red", packSize: 20, price: 9.5 },
      ]),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(await screen.findByRole("button", { name: "Erase All Data" }));
    await user.click(await screen.findByRole("button", { name: "Erase Everything" }));

    expect(localStorage.getItem("pack-tracker.purchases")).toBeNull();
    expect(localStorage.getItem("pack-tracker.settings")).toBeNull();
    // Back to onboarding.
    expect(await screen.findByText("What do you smoke?")).toBeInTheDocument();
  });
});
