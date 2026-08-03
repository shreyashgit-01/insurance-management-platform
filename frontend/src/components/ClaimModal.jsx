import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../services/api";

function ClaimModal({
  show,
  handleClose,
  fetchClaims,
  claim = null,
}) {
  const [policies, setPolicies] = useState([]);
  const [saving, setSaving] = useState(false);
  const role = localStorage.getItem("role");
  const isCustomer = role === "CUSTOMER";

  const [formData, setFormData] = useState({
    policy: "",
    claim_amount: "",
    reason: "",
    status: "PENDING",
    remarks: "",
  });

  useEffect(() => {
    loadPolicies();

    if (claim) {
      setFormData({
        policy: claim.policy,
        claim_amount: claim.claim_amount,
        reason: claim.reason,
        status: claim.status,
        remarks: claim.remarks,
      });
    } else {
      setFormData({
        policy: "",
        claim_amount: "",
        reason: "",
        status: "PENDING",
        remarks: "",
      });
    }
  }, [show, claim]);

  const loadPolicies = async () => {
    try {
      const res = await api.get("policies/");

if (res.data.results) {
  setPolicies(res.data.results);
} else {
  setPolicies(res.data);
}
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
  if (!formData.policy) {
    toast.error("Please select a policy.");
    return;
  }

  if (!formData.claim_amount) {
    toast.error("Claim amount is required.");
    return;
  }

  if (Number(formData.claim_amount) <= 0) {
    toast.error("Claim amount must be greater than 0.");
    return;
  }
  if (formData.remarks.length > 500) {
  toast.error("Remarks cannot exceed 500 characters.");
  return;
}

  if (!formData.reason.trim()) {
    toast.error("Reason is required.");
    return;
  }

  setSaving(true);

  try {
    if (claim) {
      await api.put(`claims/${claim.id}/`, formData);
      toast.success("Claim updated successfully!");
    } else {
      await api.post("claims/", formData);
      toast.success("Claim added successfully!");
    }

    fetchClaims();
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
      toast.error("Failed to save claim.");
    }
  } finally {
    setSaving(false);
  }
};

  

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {claim ? "Edit Claim" : "Add Claim"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Policy</Form.Label>

            <Form.Select
              name="policy"
              value={formData.policy}
              onChange={handleChange}
            >
              <option value="">Select Policy</option>

              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policy_number}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Claim Amount</Form.Label>

            <Form.Control
              type="number"
              name="claim_amount"
              value={formData.claim_amount}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason</Form.Label>

            <Form.Control
              as="textarea"
              rows={3}
              name="reason"
              value={formData.reason}
              onChange={handleChange}
            />
          </Form.Group>

          {!isCustomer && (
  <Form.Group className="mb-3">
    <Form.Label>Status</Form.Label>

    <Form.Select
  name="policy"
  value={formData.policy}
  onChange={handleChange}
  disabled={!!claim}
>
      <option value="PENDING">Pending</option>
      <option value="APPROVED">Approved</option>
      <option value="REJECTED">Rejected</option>
    </Form.Select>
  </Form.Group>
)}
          <Form.Group>
            <Form.Label>Remarks</Form.Label>

            <Form.Control
              as="textarea"
              rows={2}
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
            />
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
    : claim
    ? "Update Claim"
    : "Save Claim"}
</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ClaimModal;