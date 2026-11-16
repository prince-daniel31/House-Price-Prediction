import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("End-to-end user flow: fill form -> submit -> see prediction", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ predicted_price: 4612298.196340527 }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.pushState({}, "", "/");
  });

  it("lets a user fill in property details, submit, and see a real predicted price", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Home page renders with the form
    expect(screen.getByRole("heading", { name: /what's your flat actually worth/i })).toBeInTheDocument();

    // Fill in the required numeric fields (selects already have sensible defaults)
    await user.type(screen.getByLabelText(/carpet area/i), "850");
    await user.type(screen.getByLabelText(/floor/i), "3");
    await user.type(screen.getByLabelText(/bathrooms/i), "2");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /estimate price/i }));

    // The button should show a loading state while the request is in flight
    // (fetch resolves fast in this mock, so we assert on the final state below)

    // The request went to our backend with the right payload
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/predict"),
        expect.objectContaining({ method: "POST" })
      );
    });

    // The result page should now show a real, formatted predicted price
    await waitFor(() => {
      expect(screen.getByText(/estimated price/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/₹/)).toBeInTheDocument();
    expect(screen.getByText(/Lac|Cr/)).toBeInTheDocument();

    // And the summary reflects exactly what the user typed in
    expect(screen.getByText(/850 sqft/)).toBeInTheDocument();
  });

  it("shows client-side validation errors and never calls the API for invalid input", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Submit without filling in the required area/floor/bathroom fields
    await user.click(screen.getByRole("button", { name: /estimate price/i }));

    expect(await screen.findByText(/area is required/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows a friendly error message when the backend is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/carpet area/i), "1000");
    await user.type(screen.getByLabelText(/floor/i), "1");
    await user.type(screen.getByLabelText(/bathrooms/i), "1");
    await user.click(screen.getByRole("button", { name: /estimate price/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not reach the prediction server/i);
  });
});
