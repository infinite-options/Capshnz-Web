import Form from "react-bootstrap/Form";
import "../styles/Landing.css";
import { Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { addUserByEmail } from "../util/Api";
import Button from "react-bootstrap/Button";
import "../styles/LandingNew.css";
import { ReactComponent as PolygonWhiteDownward } from "../assets/polygon-downwards-white.svg";

const LandingNew = () => {
  const [isInvalid, setInvalid] = useState(false);
  const [email, setEmail] = useState("");
  const [cookies, setCookie] = useCookies(["email"]);
  const [cookiesUsed, setCookiesUsed] = useState(false);
  const navigate = useNavigate();

  if (!cookiesUsed && cookies.email) {
    setEmail(cookies.email);
    setCookiesUsed(true);
  }

  const handleEmailChange = (event) => {
    const inputEmail = event.target.value;
    setEmail(inputEmail);
    const testEmail = /[\w\d]{1,}@[\w\d]{1,}.[\w\d]{1,}/;
    if (!testEmail.test(inputEmail.toLowerCase())) setInvalid(true);
    else setInvalid(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isInvalid) {
      try {
        const res = await addUserByEmail(email);
        setCookie("email", email, { path: "/" });
        const userData = {
          ...res,
          email: email,
          playerUID: res.user_uid,
        };
        navigate("/EnterName", { state: userData });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div
      className="mainDiv"
      style={{
        width: 430,
        height: 932,
        position: "relative",
      }}
    >
      <Form noValidate onSubmit={handleSubmit}>
        <Container className="container-main" fluid>
          <Row className="text-center py-5">
            <Col
              style={{
                position: "relative",
                //display: "flex",
                //alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "374px",
                  height: "29px",
                  backgroundColor: "white",
                  borderRadius: "40px",
                  height: "70px",
                  fontSize: "33px",
                  fontFamily: "Grandstander",
                  fontWeight: "800",
                  wordWrap: "break-word",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Welcome to Capshnz
              </div>
              <PolygonWhiteDownward style={{ marginLeft: "-163px" }} />
            </Col>
          </Row>
          <Row className="d-flex justify-content-center">
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
                }}
                required
                value={email}
                type="text"
                placeholder="Enter email here..."
                onChange={handleEmailChange}
                isInvalid={isInvalid}
              />
              <PolygonWhiteDownward
                style={{ marginLeft: "260px", marginBottom: "60px" }}
              />

              <Button
                variant="success"
                type="submit"
                //disabled={() => {}}
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
                }}
              >
                Enter
              </Button>
              <Form.Control.Feedback type="invalid">
                Please provide a valid email.
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row>
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                color: "white",
                fontSize: "24px",
                fontFamily: "Grandstander",
                fontWeight: "600",
                //textAlign: "center",
                wordWrap: "break-word",
              }}
            >
              By pressing Enter you agree to let us use cookies to improve game
              performance
            </div>
          </Row>
        </Container>
      </Form>
    </div>
  );
};

export default LandingNew;
