import { useLocation, Link } from "react-router-dom";
import type { PredictionRequest, PredictionResponse } from "../types/prediction";

interface ResultState {
  prediction: PredictionResponse;
  input: PredictionRequest;
}

function formatIndianPrice(amount: number): { value: string; unit: string } {
  if (amount >= 1e7) {
    return { value: (amount / 1e7).toFixed(2).replace(/\.00$/, ""), unit: "Cr" };
  }
  if (amount >= 1e5) {
    return { value: (amount / 1e5).toFixed(2).replace(/\.00$/, ""), unit: "Lac" };
  }
  return { value: amount.toLocaleString("en-IN"), unit: "" };
}

export default function ResultPage() {
  const location = useLocation();
  const state = location.state as ResultState | null;

  if (!state?.prediction) {
    return (
      <div className="page-container">
        <div className="card result-card">
          <p className="page-subtitle" style={{ margin: 0 }}>
            There's no estimate to show yet — start from the form to get a prediction.
          </p>
          <div style={{ marginTop: 24 }}>
            <Link to="/" className="btn-secondary">
              ← Back to the estimator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { prediction, input } = state;
  const { value, unit } = formatIndianPrice(prediction.predicted_price);

  return (
    <div className="page-container">
      <div className="card result-card">
        <p className="result-label">Estimated price</p>
        <p className="result-price">
          ₹ {value} {unit && <span className="unit">{unit}</span>}
        </p>
        <p className="result-note">
          Based on a Random Forest model trained on comparable listings. Treat this as a
          starting point, not a formal valuation.
        </p>

        <hr className="result-divider" />

        <table className="summary-table">
          <tbody>
            <tr>
              <td>Location</td>
              <td>{input.location}</td>
            </tr>
            <tr>
              <td>Carpet area</td>
              <td>{input.carpet_area_sqft} sqft</td>
            </tr>
            <tr>
              <td>Floor</td>
              <td>{input.floor_num === 0 ? "Ground" : input.floor_num}</td>
            </tr>
            <tr>
              <td>Bathrooms / Balconies</td>
              <td>
                {input.bathroom} / {input.balcony}
              </td>
            </tr>
            <tr>
              <td>Furnishing</td>
              <td>{input.furnishing}</td>
            </tr>
            <tr>
              <td>Transaction</td>
              <td>{input.transaction}</td>
            </tr>
          </tbody>
        </table>

        <Link to="/" className="btn-secondary">
          ← Estimate another property
        </Link>
      </div>
    </div>
  );
}
