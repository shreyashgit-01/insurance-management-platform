import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Form,
  Pagination,
  InputGroup,
} from "react-bootstrap";
import {
  FaSearch,
  FaPlus,
  FaFileExcel,
  FaEye,
  FaDownload,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../services/api";
import DocumentModal from "../components/DocumentModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { exportToExcel } from "../utils/exportExcel";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [search, setSearch] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const role = localStorage.getItem("role");
  const isCustomer = role === "CUSTOMER";

  const [totalDocuments, setTotalDocuments] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  useEffect(() => {
    fetchDocuments(currentPage);
  }, [search, currentPage]);

  const fetchDocuments = async (page = 1) => {
    try {
      const response = await api.get("documents/", {
        params: {
          page,
          search,
        },
      });

      if (response.data.results) {
        setDocuments(response.data.results);
        setTotalDocuments(response.data.count);
        setNextPage(response.data.next);
        setPreviousPage(response.data.previous);
      } else {
        setDocuments(response.data);
        setTotalDocuments(response.data.length);
        setNextPage(null);
        setPreviousPage(null);
      }

      setCurrentPage(page);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load documents.");
    }
  };

  const handleAdd = () => {
    setSelectedDocument(null);
    setShowModal(true);
  };

  const handleEdit = (document) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`documents/${deleteId}/`);

      toast.success("Document deleted successfully!");

      fetchDocuments(currentPage);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to delete document."
      );
    }

    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleExport = () => {
    const exportData = documents.map((doc) => ({
      Title: doc.title,
      Customer: doc.customer_name,
      Policy: doc.policy_number || "-",
      Type: doc.document_type,
      Uploaded: new Date(doc.uploaded_at).toLocaleDateString(),
      File: doc.file,
    }));

    exportToExcel(exportData, "Documents");
  };

  const totalPages =
    totalDocuments > 0
      ? Math.ceil(totalDocuments / pageSize)
      : 1;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            {isCustomer ? "My Documents" : "Document Management"}
          </h2>

          <small className="text-muted">
            Total Documents: {totalDocuments}
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
            Upload Document
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
                  ? "Search by Title or Policy..."
                  : "Search by Title, Customer or Policy..."
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
                <th>Title</th>
                <th>Customer</th>
                <th>Policy</th>
                <th>Type</th>
                <th>Uploaded</th>
                <th>File</th>
                <th width="220">Actions</th>
              </tr>
            </thead>

            <tbody>
                            {documents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No Documents Found
                  </td>
                </tr>
              ) : (
                documents.map((document, index) => (
                  <tr key={document.id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>

                    <td>{document.title}</td>

                    <td>{document.customer_name}</td>

                    <td>{document.policy_number || "-"}</td>

                    <td>{document.document_type}</td>

                    <td>
                      {new Date(document.uploaded_at).toLocaleDateString()}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          href={document.file}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FaEye />
                        </Button>

                        <Button
                          variant="outline-success"
                          size="sm"
                          href={document.file}
                          download
                        >
                          <FaDownload />
                        </Button>
                      </div>
                    </td>

                    <td>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(document)}
                      >
                        ✏️ Edit
                      </Button>

                      {!isCustomer && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setDeleteId(document.id);
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

      <DocumentModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setSelectedDocument(null);
          fetchDocuments(currentPage);
        }}
        fetchDocuments={() => fetchDocuments(currentPage)}
        document={selectedDocument}
      />

      {!isCustomer && (
        <ConfirmDeleteModal
          show={showDeleteModal}
          handleClose={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          handleDelete={handleDelete}
          title="Delete Document"
          message="Are you sure you want to delete this document? This action cannot be undone."
        />
      )}
    </>
  );
}

export default Documents;