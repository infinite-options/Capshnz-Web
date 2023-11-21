import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

function LoadingScreen() {
  const [show, setShow] = useState(true);

  const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        Launch demo modal
      </Button> */}

      <Modal style={{"height":"10vh"}} show={show} onHide={handleClose}>
        <Modal.Body>
        <Spinner animation="grow" />
        <span >Wait while we add you back to the game  </span>
          </Modal.Body>
      </Modal>
    </>
  );
}

export default LoadingScreen;