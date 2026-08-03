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
import PaymentModal from "../components/PaymentModal";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const role = localStorage.getItem("role");
  const isCustomer = role === "CUSTOMER";

  const [totalPayments, setTotalPayments] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  useEffect(() => {
    fetchPayments(currentPage);
  }, [search, currentPage]);

  const fetchPayments = async (page = 1) => {
    try {
      const response = await api.get("payments/", {
        params: {
          page,
          search,
        },
      });

      if (response.data.results) {
        setPayments(response.data.results);
        setTotalPayments(response.data.count);
        setNextPage(response.data.next);
        setPreviousPage(response.data.previous);
      } else {
        setPayments(response.data);
        setTotalPayments(response.data.length);
        setNextPage(null);
        setPreviousPage(null);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = () => {
    setSelectedPayment(null);
    setShowModal(true);
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`payments/${deleteId}/`);
      fetchPayments(currentPage);
      toast.success("Payment deleted successfully!");
    } catch (error) {
      console.error(error);

      if (error.response) {
        toast.error(
          error.response.data?.detail ||
            error.response.data?.message ||
            "Failed to delete payment."
        );
      } else {
        toast.error("Failed to delete payment.");
      }
    }

    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const totalPages =
    totalPayments > 0
      ? Math.ceil(totalPayments / pageSize)
      : 1;

  const handleExport = () => {
    const exportData = payments.map((payment) => ({
      Policy: payment.policy_number,
      "Transaction ID": payment.transaction_id,
      "Payment Date": payment.payment_date,
      "Due Date": payment.due_date,
      Amount: payment.amount,
      Status: payment.payment_status,
    }));

    exportToExcel(exportData, "Payments");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return <Badge bg="success">Paid</Badge>;

      case "PENDING":
        return (
          <Badge bg="warning" text="dark">
            Pending
          </Badge>
        );

      case "FAILED":
        return <Badge bg="danger">Failed</Badge>;

      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  const handleDownload = async (id) => {
  try {
    const response = await api.get(`payments/${id}/download/`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = `Payment_Receipt_${id}.pdf`;

    document.body.appendChild(link);
    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success("Receipt downloaded successfully!");
  } catch (error) {
    console.error(error);
    toast.error("Failed to download receipt.");
  }
};

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            {isCustomer ? "My Payments" : "Payment Management"}
          </h2>

          <small className="text-muted">
            Total Payments: {totalPayments}
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
            Add Payment
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
                  ? "Search by Transaction ID..."
                  : "Search by Transaction ID..."
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
                <th>Transaction ID</th>
                <th>Payment Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th width="260">Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-4"
                  >
                    No Payments Found
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr key={payment.id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>

                    <td>{payment.policy_number}</td>

                    <td>{payment.transaction_id}</td>

                    <td>{payment.payment_date}</td>

                    <td>{payment.due_date}</td>

                    <td>
                      ₹ {Number(payment.amount).toLocaleString("en-IN")}
                    </td>

                    <td>{getStatusBadge(payment.payment_status)}</td>

                    <td>
                      {!isCustomer && (
                        <>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(payment)}
                          >
                            ✏️ Edit
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleDownload(payment.id)}
                      >
                        📄 Receipt
                      </Button>

                      {!isCustomer && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setDeleteId(payment.id);
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

      <PaymentModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setSelectedPayment(null);
          fetchPayments(currentPage);
        }}
        fetchPayments={() => fetchPayments(currentPage)}
        payment={selectedPayment}
      />

      {!isCustomer && (
        <ConfirmDeleteModal
          show={showDeleteModal}
          handleClose={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          handleDelete={handleDelete}
          title="Delete Payment"
          message="Are you sure you want to delete this payment?"
        />
      )}
    </>
  );
}

export default Payments;