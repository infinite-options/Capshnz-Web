import { useContext } from "react"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import { ErrorContext } from "../App"

const ApiError = ({ show, onRetry, title, description }) => {
  const { setShow } = useContext(ErrorContext)
  return (
    <Modal
      show={show}
      fullscreen="sm-down"
      onHide={() => setShow(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{description}</Modal.Body>
      <Modal.Footer>
        <Button onClick={onRetry}>Retry</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ApiError
