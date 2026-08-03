import { Modal, Button } from "react-bootstrap";

function ConfirmDeleteModal({
  show,
 handleClose,
  handleDelete,
  title,
  message,
}) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{message}</Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmDeleteModal;