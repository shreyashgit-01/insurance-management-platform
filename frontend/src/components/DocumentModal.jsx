import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../services/api";

function DocumentModal({
  show,
  handleClose,
  fetchDocuments,
  document = null,
}) {
  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer: "",
    policy: "",
    document_type: "AADHAAR",
    title: "",
    file: null,
  });

  useEffect(() => {
    if (show) {
      loadCustomers();
      loadPolicies();

      if (document) {
        setFormData({
          customer: document.customer,
          policy: document.policy || "",
          document_type: document.document_type,
          title: document.title,
          file: null,
        });
      } else {
        setFormData({
          customer: "",
          policy: "",
          document_type: "AADHAAR",
          title: "",
          file: null,
        });
      }
    }
  }, [show, document]);

  const loadCustomers = async () => {
    try {
      const res = await api.get("customers/");
      setCustomers(res.data.results);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPolicies = async () => {
    try {
      const res = await api.get("policies/");
      setPolicies(res.data.results);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prev) => ({
        ...prev,
        file: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.customer) {
      toast.error("Please select a customer.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter document title.");
      return;
    }

    if (!document && !formData.file) {
      toast.error("Please choose a file.");
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("customer", formData.customer);

      if (formData.policy) {
        data.append("policy", formData.policy);
      }

      data.append("document_type", formData.document_type);
      data.append("title", formData.title);

      if (formData.file) {
        data.append("file", formData.file);
      }

      if (document) {
        await api.put(`documents/${document.id}/`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Document updated successfully!");
      } else {
        await api.post("documents/", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Document uploaded successfully!");
      }

      fetchDocuments();
      handleClose();
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Failed to save document.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {document ? "Edit Document" : "Upload Document"}
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
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Policy</Form.Label>

            <Form.Select
              name="policy"
              value={formData.policy}
              onChange={handleChange}
            >
              <option value="">Select Policy (Optional)</option>

              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policy_number}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Document Type</Form.Label>

            <Form.Select
              name="document_type"
              value={formData.document_type}
              onChange={handleChange}
            >
              <option value="AADHAAR">Aadhaar Card</option>
              <option value="PAN">PAN Card</option>
              <option value="POLICY">Policy Document</option>
              <option value="CLAIM">Claim Document</option>
              <option value="OTHER">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>

            <Form.Control
              type="text"
              name="title"
              placeholder="Enter document title"
              value={formData.title}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>
              {document ? "Replace File (Optional)" : "Choose File"}
            </Form.Label>

            <Form.Control
              type="file"
              name="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleChange}
            />

            {document && (
              <small className="text-muted">
                Leave empty to keep the existing file.
              </small>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : document
            ? "Update Document"
            : "Upload Document"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DocumentModal;