import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../services/api";

function CustomerModal({
  show,
  handleClose,
  fetchCustomers,
  customer = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    if (!show) return;

    if (customer) {
      setFormData({
        name: customer.name || "",
        age: customer.age || "",
        gender: customer.gender || "",
        email: customer.email || "",
        phone: customer.phone || "",
        dob: customer.dob || "",
        address: customer.address || "",
        username: "",
        password: "",
      });
    } else {
      setFormData({
        name: "",
        age: "",
        gender: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
        username: "",
        password: "",
      });
    }
  }, [show, customer]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Customer name is required.");
      return;
    }

    if (!formData.age) {
      toast.error("Age is required.");
      return;
    }

    if (!formData.gender) {
      toast.error("Gender is required.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required.");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }

    if (!formData.dob) {
      toast.error("Date of Birth is required.");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Address is required.");
      return;
    }

    if (!customer) {
      if (!formData.username.trim()) {
        toast.error("Username is required.");
        return;
      }

      if (!formData.password.trim()) {
        toast.error("Password is required.");
        return;
      }
    }

    try {
      if (customer) {
        const payload = {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          address: formData.address,
        };

        await api.put(`customers/${customer.id}/`, payload);
        toast.success("Customer updated successfully!");
      } else {
        await api.post("customers/", formData);
        toast.success("Customer added successfully!");
      }

      fetchCustomers();
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
        toast.error("Something went wrong.");
      }
    }
  };

  return (
        <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {customer ? "Edit Customer" : "Add Customer"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter customer name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Age</Form.Label>
            <Form.Control
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter age"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </Form.Group>

          {!customer && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>

        <Button variant="primary" onClick={handleSubmit}>
          {customer ? "Update Customer" : "Save Customer"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomerModal;