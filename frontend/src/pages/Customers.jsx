import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Form,
  InputGroup,
  Pagination,
  Spinner,
} from "react-bootstrap";
import { FaSearch, FaPlus, FaFileExcel } from "react-icons/fa";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import api from "../services/api";
import { exportToExcel } from "../utils/exportExcel";
import CustomerModal from "../components/CustomerModal";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [totalCustomers, setTotalCustomers] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);

      const response = await api.get("customers/", {
        params: {
          page,
        },
      });

      if (response.data.results) {
        setCustomers(response.data.results);
        setTotalCustomers(response.data.count);
        setNextPage(response.data.next);
        setPreviousPage(response.data.previous);
      } else {
        setCustomers(response.data);
        setTotalCustomers(response.data.length);
        setNextPage(null);
        setPreviousPage(null);
      }
      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCustomer(null);
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = async () => {
  try {
    await api.delete(`customers/${deleteId}/`);

    fetchCustomers(currentPage);

    toast.success("Customer deleted successfully!");

    setShowDeleteModal(false);
    setDeleteId(null);
  } catch (error) {
    console.error(error);

    if (error.response) {
      toast.error(
        error.response.data?.detail ||
          "Unable to delete customer."
      );
    } else {
      toast.error("Failed to delete customer.");
    }
  }
};

  const handleClose = () => {
  setShowModal(false);
  setSelectedCustomer(null);
  fetchCustomers(currentPage);
};

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.name?.toLowerCase() || "";
    const email = customer.email?.toLowerCase() || "";
    const phone = customer.phone || "";

    return (
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      phone.includes(search)
    );
  });

  const totalPages =
    totalCustomers > 0
      ? Math.ceil(totalCustomers / pageSize)
      : 1;

  const handleExport = () => {
    const exportData = filteredCustomers.map((customer) => ({
      ID: customer.id,
      Name: customer.name,
      Age: customer.age,
      Gender: customer.gender,
      Phone: customer.phone,
      Email: customer.email,
    }));

    exportToExcel(exportData, "Customers");
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Customer Management</h2>

          <small className="text-muted">
            Total Customers: {totalCustomers}
          </small>
        </div>

        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleExport}>
            <FaFileExcel className="me-2" />
            Export
          </Button>

          <Button variant="primary" onClick={handleAdd}>
            <FaPlus className="me-2" />
            Add Customer
          </Button>
        </div>
      </div>

      <InputGroup className="mb-3">
        <InputGroup.Text>
          <FaSearch />
        </InputGroup.Text>

        <Form.Control
          type="text"
          placeholder="Search by Name, Email or Phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </InputGroup>

      <Card className="shadow border-0">
        <Card.Body>
          <Table
            striped
            hover
            bordered
            responsive
            className="align-middle"
          >
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
                <th width="180">Actions</th>
              </tr>
            </thead>
                        <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <h5>No Customers Found</h5>
                    <p className="text-muted mb-0">
                      Try changing your search or add a new customer.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer.id}>
                    <td>
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    <td>{customer.name}</td>

                    <td>{customer.age}</td>

                    <td>{customer.gender}</td>

                    <td>{customer.phone}</td>

                    <td>{customer.email}</td>

                    <td>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(customer)}
                      >
                        ✏️ Edit
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setDeleteId(customer.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        🗑 Delete
                      </Button>
                       
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

      <ConfirmDeleteModal
  show={showDeleteModal}
  handleClose={() => {
    setShowDeleteModal(false);
    setDeleteId(null);
  }}
  handleDelete={handleDelete}
  title="Delete Customer"
  message="Are you sure you want to delete this customer?"
/>

      <CustomerModal
        show={showModal}
        handleClose={handleClose}
        fetchCustomers={() => fetchCustomers(currentPage)}
        customer={selectedCustomer}
      />
    </>
  );
}

export default Customers;