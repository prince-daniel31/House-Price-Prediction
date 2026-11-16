import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getPrediction, ApiError } from "../api/predictionClient";
import type { PredictionRequest } from "../types/prediction";
import locations from "../data/locations.json";

const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Furnished"] as const;
const TRANSACTION_OPTIONS = ["Resale", "New Property", "Rent/Lease", "Other"] as const;
const OWNERSHIP_OPTIONS = ["Freehold", "Leasehold", "Co-operative Society", "Power Of Attorney"] as const;
const FACING_OPTIONS = [
  "East",
  "West",
  "North",
  "South",
  "North - East",
  "North - West",
  "South - East",
  "South -West",
] as const;

interface FormState {
  location: string;
  carpetAreaSqft: string;
  floorNum: string;
  bathroom: string;
  balcony: string;
  furnishing: string;
  transaction: string;
  ownership: string;
  facing: string;
}

const initialState: FormState = {
  location: (locations as string[])[0] ?? "other",
  carpetAreaSqft: "",
  floorNum: "",
  bathroom: "",
  balcony: "0",
  furnishing: "Semi-Furnished",
  transaction: "Resale",
  ownership: "Freehold",
  facing: "East",
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function PredictionForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationOptions = locations as string[];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (!form.location) next.location = "Please choose a location.";

    const area = Number(form.carpetAreaSqft);
    if (!form.carpetAreaSqft) next.carpetAreaSqft = "Area is required.";
    else if (!Number.isFinite(area) || area <= 0) next.carpetAreaSqft = "Enter an area greater than 0.";

    if (form.floorNum === "") next.floorNum = "Floor is required. Use 0 for Ground.";
    else if (!Number.isFinite(Number(form.floorNum))) next.floorNum = "Enter a valid floor number.";

    if (form.bathroom === "") next.bathroom = "Number of bathrooms is required.";
    else if (!Number.isInteger(Number(form.bathroom)) || Number(form.bathroom) < 0)
      next.bathroom = "Enter a whole number, 0 or more.";

    if (form.balcony !== "" && (!Number.isInteger(Number(form.balcony)) || Number(form.balcony) < 0))
      next.balcony = "Enter a whole number, 0 or more.";

    return next;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const payload: PredictionRequest = {
      location: form.location,
      carpet_area_sqft: Number(form.carpetAreaSqft),
      floor_num: Number(form.floorNum),
      bathroom: Number(form.bathroom),
      balcony: Number(form.balcony || 0),
      furnishing: form.furnishing as PredictionRequest["furnishing"],
      transaction: form.transaction as PredictionRequest["transaction"],
      ownership: form.ownership,
      facing: form.facing,
    };

    setIsSubmitting(true);
    try {
      const result = await getPrediction(payload);
      navigate("/result", { state: { prediction: result, input: payload } });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field field-full">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            className={errors.location ? "has-error" : ""}
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          >
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          {errors.location && <span className="field-error">{errors.location}</span>}
        </div>

        <div className="field">
          <label htmlFor="carpetArea">Carpet area (sqft)</label>
          <input
            id="carpetArea"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 850"
            className={errors.carpetAreaSqft ? "has-error" : ""}
            value={form.carpetAreaSqft}
            onChange={(e) => update("carpetAreaSqft", e.target.value)}
          />
          {errors.carpetAreaSqft && <span className="field-error">{errors.carpetAreaSqft}</span>}
        </div>

        <div className="field">
          <label htmlFor="floorNum">Floor (0 = Ground)</label>
          <input
            id="floorNum"
            type="number"
            step="1"
            placeholder="e.g. 3"
            className={errors.floorNum ? "has-error" : ""}
            value={form.floorNum}
            onChange={(e) => update("floorNum", e.target.value)}
          />
          {errors.floorNum && <span className="field-error">{errors.floorNum}</span>}
        </div>

        <div className="field">
          <label htmlFor="bathroom">Bathrooms</label>
          <input
            id="bathroom"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 2"
            className={errors.bathroom ? "has-error" : ""}
            value={form.bathroom}
            onChange={(e) => update("bathroom", e.target.value)}
          />
          {errors.bathroom && <span className="field-error">{errors.bathroom}</span>}
        </div>

        <div className="field">
          <label htmlFor="balcony">Balconies</label>
          <input
            id="balcony"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 1"
            className={errors.balcony ? "has-error" : ""}
            value={form.balcony}
            onChange={(e) => update("balcony", e.target.value)}
          />
          {errors.balcony && <span className="field-error">{errors.balcony}</span>}
        </div>

        <div className="field">
          <label htmlFor="furnishing">Furnishing</label>
          <select
            id="furnishing"
            value={form.furnishing}
            onChange={(e) => update("furnishing", e.target.value)}
          >
            {FURNISHING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="transaction">Transaction type</label>
          <select
            id="transaction"
            value={form.transaction}
            onChange={(e) => update("transaction", e.target.value)}
          >
            {TRANSACTION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="ownership">Ownership</label>
          <select
            id="ownership"
            value={form.ownership}
            onChange={(e) => update("ownership", e.target.value)}
          >
            {OWNERSHIP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="facing">Facing</label>
          <select id="facing" value={form.facing} onChange={(e) => update("facing", e.target.value)}>
            {FACING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-footer">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Estimating…
            </>
          ) : (
            "Estimate price"
          )}
        </button>
      </div>

      {submitError && (
        <div className="alert alert-error" role="alert">
          {submitError}
        </div>
      )}
    </form>
  );
}
