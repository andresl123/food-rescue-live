export default function AddressForm({ formData, onChange }) {
  return (
    <div>
      {/* Street */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="street"
          placeholder="Street"
          value={formData.street}
          onChange={onChange}
          required
        />
      </div>

      {/* City */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={onChange}
          required
        />
      </div>

      {/* State */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={onChange}
          required
        />
      </div>

      {/* Postal Code */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="postalCode"
          placeholder="Postal Code"
          value={formData.postalCode}
          onChange={onChange}
          required
        />
      </div>

      {/* Country */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={onChange}
          required
        />
      </div>
    </div>
  );
}
