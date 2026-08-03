import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../services/api";

function PolicyModal({
  show,
  handleClose,
  fetchPolicies,
  policy = null,
}) {
  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer: "",
    policy_number: "",
    policy_type: "HEALTH",
    premium_amount: "",
    start_date: "",
    end_date: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    loadCustomers();

    if (policy) {
      setFormData({
        customer: policy.customer,
        policy_number: policy.policy_number,
        policy_type: policy.policy_type,
        premium_amount: policy.premium_amount,
        start_date: policy.start_date,
        end_date: policy.end_date,
        status: policy.status,
      });
    } else {
      setFormData({
        customer: "",
        policy_number: "",
        policy_type: "HEALTH",
        premium_amount: "",
        start_date: "",
        end_date: "",
        status: "ACTIVE",
      });
    }
  }, [show, policy]);

  const loadCustomers = async () => {
    try {
      const res = await api.get("customers/");
      setCustomers(res.data.results);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
  if (!formData.customer) {
    toast.error("Please select a customer.");
    return;
  }

  if (!formData.policy_number.trim()) {
    toast.error("Policy number is required.");
    return;
  }

  if (!formData.premium_amount) {
    toast.error("Premium amount is required.");
    return;
  }

  if (!formData.start_date) {
    toast.error("Start date is required.");
    return;
  }

  if (new Date(formData.end_date) <= new Date(formData.start_date)) {
  toast.error("End date must be after start date.");
  return;
}

  setSaving(true);

  try {
    if (policy) {
      await api.put(`policies/${policy.id}/`, formData);
      toast.success("Policy updated successfully!");
    } else {
      await api.post("policies/", formData);
      toast.success("Policy added successfully!");
    }

    fetchPolicies();
    handleClose();
  } catch (err) {
    console.error(err);

    if (err.response) {
      const errorData = err.response.data;

      if (typeof errorData === "string") {
        toast.error(errorData);
      } else if (errorData.detail) {
        toast.error(errorData.detail);
      } else {
        const firstError = Object.values(errorData)[0];
        toast.error(
          Array.isArray(firstError)
            ? firstError[0]
            : "Validation failed."
        );
      }
    } else {
      toast.error("Failed to save policy.");
    }
  } finally {
    setSaving(false);
  }
};

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {policy ? "Edit Policy" : "Add Policy"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>

          <Form.Group className="mb-3">
            <Form.Label>Customer</Form.Label>

            <Form.Select
              name="customer"
              value={formData.customer}
              onChange={handleChange}
            >
              <option value="">Select Customer</option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Policy Number</Form.Label>

            <Form.Control
              name="policy_number"
              value={formData.policy_number}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Policy Type</Form.Label>

            <Form.Select
              name="policy_type"
              value={formData.policy_type}
              onChange={handleChange}
            >
              <option value="HEALTH">Health</option>
              <option value="LIFE">Life</option>
              <option value="VEHICLE">Vehicle</option>
              <option value="HOME">Home</option>
              <option value="TRAVEL">Travel</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Premium Amount</Form.Label>

            <Form.Control
              type="number"
              name="premium_amount"
              value={formData.premium_amount}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>

            <Form.Control
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>

            <Form.Control
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Status</Form.Label>

            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </Form.Select>
          </Form.Group>

        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : policy
            ? "Update Policy"
            : "Save Policy"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PolicyModal;