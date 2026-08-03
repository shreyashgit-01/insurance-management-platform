import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../services/api";

function PaymentModal({
  show,
  handleClose,
  fetchPayments,
  payment = null,
}) {
  const [policies, setPolicies] = useState([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    policy: "",
    payment_date: "",
    due_date: "",
    amount: "",
    payment_status: "PENDING",
    transaction_id: "",
  });

  useEffect(() => {
    loadPolicies();

    if (payment) {
      setFormData({
        policy: payment.policy,
        payment_date: payment.payment_date,
        due_date: payment.due_date,
        amount: payment.amount,
        payment_status: payment.payment_status,
        transaction_id: payment.transaction_id,
      });
    } else {
      setFormData({
        policy: "",
        payment_date: "",
        due_date: "",
        amount: "",
        payment_status: "PENDING",
        transaction_id: "",
      });
    }
  }, [show, payment]);

  const loadPolicies = async () => {
    try {
      const response = await api.get("policies/");
      setPolicies(response.data.results);
    } catch (error) {
      console.error(error);
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

  if (!formData.payment_date) {
    toast.error("Payment date is required.");
    return;
  }

  if (!formData.due_date) {
    toast.error("Due date is required.");
    return;
  }

  if (!formData.amount) {
    toast.error("Amount is required.");
    return;
  }

  if (Number(formData.amount) <= 0) {
    toast.error("Amount must be greater than 0.");
    return;
  }

  if (!formData.transaction_id.trim()) {
    toast.error("Transaction ID is required.");
    return;
  }

  setSaving(true);

  try {
    if (payment) {
      await api.put(`payments/${payment.id}/`, formData);
      toast.success("Payment updated successfully!");
    } else {
      await api.post("payments/", formData);
      toast.success("Payment added successfully!");
    }

    fetchPayments();
    handleClose();
  } catch (error) {
    console.error(error);

    if (error.response) {
      const errorData = error.response.data;

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
      toast.error("Failed to save payment.");
    }
  } finally {
    setSaving(false);
  }
};

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {payment ? "Edit Payment" : "Add Payment"}
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
            <Form.Label>Payment Date</Form.Label>

            <Form.Control
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>

            <Form.Control
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>

            <Form.Control
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Transaction ID</Form.Label>

            <Form.Control
              name="transaction_id"
              value={formData.transaction_id}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Payment Status</Form.Label>

            <Form.Select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
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
    : payment
    ? "Update Payment"
    : "Save Payment"}
</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PaymentModal;