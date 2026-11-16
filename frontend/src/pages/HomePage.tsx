import PredictionForm from "../components/PredictionForm";

export default function HomePage() {
  return (
    <div className="page-container">
      <p className="page-eyebrow">Trained on 170,000+ Indian listings</p>
      <h1 className="page-title">What's your flat actually worth?</h1>
      <p className="page-subtitle">
        Enter a few details about the property — location, area, floor, and fittings — and a
        Random Forest model trained on real resale and new-property listings will estimate a
        fair asking price.
      </p>
      <PredictionForm />
    </div>
  );
}
