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
import api from "../services/api";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { exportToExcel } from "../utils/exportExcel";
import ClaimModal from "../components/ClaimModal";

function Claims() {
  const [claims, setClaims] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const role = localStorage.getItem("role");
  const isCustomer = role === "CUSTOMER";

  const [totalClaims, setTotalClaims] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  useEffect(() => {
    fetchClaims(currentPage);
  }, [search, currentPage]);

  const fetchClaims = async (page = 1) => {
    try {
      const response = await api.get("claims/", {
        params: {
          page,
          search,
        },
      });

      if (response.data.results) {
        setClaims(response.data.results);
        setTotalClaims(response.data.count);
        setNextPage(response.data.next);
        setPreviousPage(response.data.previous);
      } else {
        setClaims(response.data);
        setTotalClaims(response.data.length);
        setNextPage(null);
        setPreviousPage(null);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load claims.");
    }
  };
    const handleAdd = () => {
    setSelectedClaim(null);
    setShowModal(true);
  };

  const handleEdit = (claim) => {
    setSelectedClaim(claim);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`claims/${deleteId}/`);

      fetchClaims(currentPage);

      toast.success("Claim deleted successfully!");

      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error(error);

      if (error.response) {
        toast.error(
          error.response.data?.detail ||
            error.response.data?.message ||
            "Failed to delete claim."
        );
      } else {
        toast.error("Failed to delete claim.");
      }
    }
  };

  const totalPages =
    totalClaims > 0
      ? Math.ceil(totalClaims / pageSize)
      : 1;

  const handleExport = () => {
    const exportData = claims.map((claim) => ({
      "Claim Number": claim.claim_number,
      Policy: claim.policy_number,
      Customer: claim.customer_name,
      "Claim Amount": claim.claim_amount,
      "Claim Date": claim.claim_date,
      Status: claim.status,
    }));

    exportToExcel(exportData, "Claims");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <Badge bg="success">Approved</Badge>;

      case "REJECTED":
        return <Badge bg="danger">Rejected</Badge>;

      case "PENDING":
        return (
          <Badge bg="warning" text="dark">
            Pending
          </Badge>
        );

      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <>
          <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            {isCustomer ? "My Claims" : "Claim Management"}
          </h2>

          <small className="text-muted">
            Total Claims: {totalClaims}
          </small>
        </div>

        <div className="d-flex gap-2">
          {!isCustomer && (
            <Button variant="success" onClick={handleExport}>
              <FaFileExcel className="me-2" />
              Export
            </Button>
          )}

          <Button variant="primary" onClick={handleAdd}>
            <FaPlus className="me-2" />
            Add Claim
          </Button>
        </div>
      </div>

      <Card className="shadow border-0">
        <Card.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>

            <Form.Control
              placeholder={
                isCustomer
                  ? "Search by Policy Number..."
                  : "Search Claims..."
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
                <th>Policy</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Claim Date</th>
                <th width="180">Actions</th>
              </tr>
            </thead>

            <tbody>
              {claims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No Claims Found
                  </td>
                </tr>
              ) : (
                claims.map((claim, index) => (
                  <tr key={claim.id}>
                    <td>
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    <td>{claim.policy_number || claim.policy}</td>

                    <td>
                      ₹{" "}
                      {Number(claim.claim_amount).toLocaleString("en-IN")}
                    </td>

                    <td>{getStatusBadge(claim.status)}</td>

                    <td>{claim.claim_date}</td>

                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(claim)}
                        disabled={
                          isCustomer && claim.status !== "PENDING"
                        }
                      >
                        Edit
                      </Button>

                      {!isCustomer && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setDeleteId(claim.id);
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

      <ClaimModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setSelectedClaim(null);
          fetchClaims(currentPage);
        }}
        fetchClaims={() => fetchClaims(currentPage)}
        claim={selectedClaim}
      />

      {!isCustomer && (
        <ConfirmDeleteModal
          show={showDeleteModal}
          handleClose={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          handleDelete={handleDelete}
          title="Delete Claim"
          message="Are you sure you want to delete this claim?"
        />
      )}
    </>
  );
}

export default Claims;