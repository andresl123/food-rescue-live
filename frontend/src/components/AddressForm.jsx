// Updated AddressForm
export default function AddressForm({ formData, onChange }) {
  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="street"
          placeholder="Street"
          value={formData.street}
          onChange={onChange}
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={onChange}
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={onChange}
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="postalCode"
          placeholder="Postal Code"
          value={formData.postalCode}
          onChange={onChange}
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
