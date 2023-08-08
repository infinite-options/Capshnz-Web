import { Container, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const EnterName = () => {
  const [isInvalid, setInvalid] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  function handleClick() {
    navigate("/StartGame");
  }
  return (
    <div>
      <Form noValidate onSubmit={handleClick}>
        <Container className="container" fluid>
          <Form.Group as={Col} md="10">
            <Form.Label
              style={{
                width: "383px",
                color: "white",
                fontSize: "32px",
                fontFamily: "Grandstander",
                fontWeight: "600",
                wordWrap: "break-word",
              }}
            ></Form.Label>
            <Form.Control
              style={{
                width: 391,
                height: 62.38,
                background: "white",
                borderRadius: 40,
                color: "black",
                fontSize: 26,
                fontFamily: "Grandstander",
                fontWeight: "500",
                wordWrap: "break-word",
                border: "none",
                borderColor: "white",
                marginTop: "60px",
              }}
              required
              value={email}
              type="text"
              placeholder="Enter name here..."
              onChange={() => {}}
              isInvalid={isInvalid}
            />
            <Form.Label
              style={{
                width: "383px",
                color: "white",
                fontSize: "32px",
                fontFamily: "Grandstander",
                fontWeight: "600",
                wordWrap: "break-word",
              }}
            ></Form.Label>
            <Form.Control
              style={{
                width: 391,
                height: 62.38,
                background: "white",
                borderRadius: 40,
                color: "black",
                fontSize: 26,
                fontFamily: "Grandstander",
                fontWeight: "500",
                wordWrap: "break-word",
                border: "none",
                borderColor: "white",
                marginTop: "80px",
              }}
              required
              value={email}
              type="text"
              placeholder="Enter screen name here..."
              onChange={() => {}}
              isInvalid={isInvalid}
            />

            <Button
              variant="success"
              type="submit"
              disabled={() => {}}
              style={{
                width: 218,
                height: 54,
                background: "#5E9E94",
                borderRadius: 30,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: 31,
                fontFamily: "Grandstander",
                fontWeight: "600",
                wordWrap: "break-word",
                marginLeft: "50px",
                marginTop: "160px",
              }}
            >
              Enter
            </Button>
          </Form.Group>
        </Container>
      </Form>
    </div>
  );
};
export default EnterName;
