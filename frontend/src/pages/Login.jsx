import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Form, Button, Container, Alert } from "react-bootstrap";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");

  try {
    const response = await api.post("token/", formData);

    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    localStorage.setItem("role", response.data.role);
    localStorage.setItem("username", response.data.username);
    localStorage.setItem("userId", response.data.id);

    if (response.data.role === "ADMIN") {
      navigate("/dashboard");
    } else if (response.data.role === "AGENT") {
      navigate("/dashboard");
    } else if (response.data.role === "CUSTOMER") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  } catch (err) {
    setError("Invalid username or password.");
  }
};

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card
        className="shadow p-4"
        style={{ width: "400px" }}
      >
        <h3 className="text-center mb-4">
          Insurance Management System
        </h3>

        <h5 className="text-center mb-3">
          Login
        </h5>

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>

            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>

            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
          >
            Login
          </Button>
          <div className="text-center mt-3">
            Don't have an account? <Link to="/register">Register</Link>
          </div>

        </Form>
      </Card>
    </Container>
  );
}

export default Login;