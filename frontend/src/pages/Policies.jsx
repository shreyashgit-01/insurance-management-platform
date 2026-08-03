import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Form,
  Pagination,
  InputGroup,
  Badge,
} from "react-bootstrap";
import { FaSearch, FaPlus, FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

import api from "../services/api";
import { exportToExcel } from "../utils/exportExcel";
import PolicyModal from "../components/PolicyModal";

function Policies() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const role = localStorage.getItem("role");
  const isCustomer = role === "CUSTOMER";

  const [totalPolicies, setTotalPolicies] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  useEffect(() => {
    fetchPolicies(currentPage);
  }, [search, currentPage]);

  const fetchPolicies = async (page = 1) => {
    try {
      const response = await api.get("policies/", {
        params: {
          page,
          search,
        },
      });

      if (response.data.results) {
  setPolicies(response.data.results);
  setTotalPolicies(response.data.count);
  setNextPage(response.data.next);
  setPreviousPage(response.data.previous);
} else {
  setPolicies(response.data);
  setTotalPolicies(response.data.length);
  setNextPage(null);
  setPreviousPage(null);
}
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  const handleAdd = () => {
    setSelectedPolicy(null);
    setShowModal(true);
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setShowModal(true);
  };

  const handleDelete = async () => {
  try {
    await api.delete(`policies/${deleteId}/`);

    fetchPolicies(currentPage);

    toast.success("Policy deleted successfully!");

    setShowDeleteModal(false);
    setDeleteId(null);
  } catch (error) {
    console.error(error);

    if (error.response) {
      toast.error(
        error.response.data?.detail ||
          error.response.data?.message ||
          "Failed to delete policy."
      );
    } else {
      toast.error("Failed to delete policy.");
    }
  }
};

  

  const totalPages =
    totalPolicies > 0
      ? Math.ceil(totalPolicies / pageSize)
      : 1;

  const handleExport = () => {
  const exportData = policies.map((policy) => ({
    "Policy Number": policy.policy_number,
    Customer: policy.customer_name,
    "Policy Type": policy.policy_type,
    Premium: policy.premium_amount,
    "Start Date": policy.start_date,
    "End Date": policy.end_date,
    Status: policy.status,
  }));

  exportToExcel(exportData, "Policies");
};

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Badge bg="success">Active</Badge>;

      case "EXPIRED":
        return <Badge bg="danger">Expired</Badge>;

      case "CANCELLED":
        return <Badge bg="secondary">Cancelled</Badge>;

      default:
        return <Badge bg="warning">{status}</Badge>;
    }
  };
  const handleDownload = async (id) => {
  try {
    const response = await api.get(`policies/${id}/download/`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = `Policy_${id}.pdf`;

    document.body.appendChild(link);
    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    toast.error("Failed to download policy.");
  }
};

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
  <div>
    <h2 className="mb-1">
  {isCustomer ? "My Policies" : "Policy Management"}
</h2>

    <small className="text-muted">
      Total Policies: {totalPolicies}
    </small>
  </div>

  <div className="d-flex gap-2">
    {!isCustomer && (
  <Button variant="success" onClick={handleExport}>
    <FaFileExcel className="me-2" />
    Export
  </Button>
)}

    {!isCustomer && (
  <Button variant="primary" onClick={handleAdd}>
    <FaPlus className="me-2" />
    Add Policy
  </Button>
)}
  </div>
</div>

      {/* Search + Table */}
      <Card className="shadow border-0">
        <Card.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>

            <Form.Control
  type="text"
  placeholder={
    isCustomer
      ? "Search by Policy Number..."
      : "Search by Policy Number or Customer..."
  }
  value={search}
  onChange={(e) => {
    setCurrentPage(1);
    setSearch(e.target.value);
  }}
/>
          </InputGroup>

          <Table
            striped
            bordered
            hover
            responsive
            className="align-middle"
          >
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Policy Number</th>
                <th>Customer</th>
                <th>Policy Type</th>
                <th>Premium Amount</th>
                <th>Status</th>
                <th width="250">Actions</th>
              </tr>
            </thead>

            <tbody>
              {policies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No Policies Found
                  </td>
                </tr>
              ) : (
                policies.map((policy, index) => (
                  <tr key={policy.id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    

                    <td>{policy.policy_number}</td>

                    <td>{policy.customer_name}</td>

                    <td>{policy.policy_type}</td>

                    <td>
                      ₹{" "}
                      {Number(policy.premium_amount).toLocaleString("en-IN")}
                    </td>

                    <td>{getStatusBadge(policy.status)}</td>

                  <td>
  {!isCustomer && (
    <>
      <Button
        variant="outline-warning"
        size="sm"
        className="me-2"
        onClick={() => handleEdit(policy)}
      >
        ✏️ Edit
      </Button>
    </>
  )}

  <Button
    variant="outline-info"
    size="sm"
    className="me-2"
    onClick={() => handleDownload(policy.id)}
  >
    📄 PDF
  </Button>

  {!isCustomer && (
    <Button
      variant="outline-danger"
      size="sm"
      onClick={() => {
        setDeleteId(policy.id);
        setShowDeleteModal(true);
      }}
    >
      🗑 Delete
    </Button>
  )}
</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Pagination */}
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.Prev
            disabled={!previousPage}
            onClick={() => setCurrentPage(currentPage - 1)}
          />

          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index}
              active={currentPage === index + 1}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}

          <Pagination.Next
            disabled={!nextPage}
            onClick={() => setCurrentPage(currentPage + 1)}
          />
        </Pagination>
      </div>

      {!isCustomer && (
  <>
    <PolicyModal
      show={showModal}
      handleClose={() => {
  setShowModal(false);
  setSelectedPolicy(null);
  fetchPolicies(currentPage);
}}
      fetchPolicies={() => fetchPolicies(currentPage)}
      policy={selectedPolicy}
    />

    <ConfirmDeleteModal
      show={showDeleteModal}
      handleClose={() => {
        setShowDeleteModal(false);
        setDeleteId(null);
      }}
      handleDelete={handleDelete}
      title="Delete Policy"
      message="Are you sure you want to delete this policy?"
    />
  </>
)}
    </>
  );
}

export default Policies;