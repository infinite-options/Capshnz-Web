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
  console.log("In LandingnNew");
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
    <div className='div-main'>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Form noValidate onSubmit={handleSubmit}>
          <Container className='container-main' fluid>
            <Row className='text-center' style={{ marginTop: "36px" }}>
              <Col
                style={{
                  position: "relative",
                }}
              >
                <input
                  style={{
                    width: "90%",
                    height: "70px",
                    backgroundColor: "white",
                    borderRadius: "40px",
                    flexShrink: 0,
                    fontSize: "1.5rem",
                    fontFamily: "Grandstander",
                    fontWeight: "700",
                    wordWrap: "break-word",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "none",
                    textAlign: "center",
                  }}
                  value='Welcome to Capshnz'
                  readOnly
                />

                <PolygonWhiteDownward
                  style={{
                    marginLeft: "-223px",
                    marginTop: "-10px",
                  }}
                />
              </Col>
            </Row>

            <Form.Group>
              <Row className='text-center'>
                <Col>
                  <Form.Control
                    style={{
                      width: "90%",
                      height: 62.38,
                      background: "white",
                      borderRadius: 40,
                      color: "black",
                      fontSize: 26,
                      fontFamily: "Grandstander",
                      fontWeight: "400",
                      wordWrap: "break-word",
                      border: "none",
                      borderColor: "white",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      marginLeft: "30px",
                      marginTop: "60px",
                    }}
                    required
                    value={email}
                    type='text'
                    placeholder='Enter email here...'
                    onChange={handleEmailChange}
                    isInvalid={isInvalid}
                  />
                  <PolygonWhiteDownward
                    style={{
                      marginRight: "-150px",
                      marginTop: "-10px",
                    }}
                  />
                </Col>
              </Row>

              <Row className='text-center' style={{ marginTop: "5rem" }}>
                <Col>
                  <Button
                    variant='success'
                    type='submit'
                    //disabled={() => {}}
                    style={{
                      width: "60%",
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
                </Col>
              </Row>
              <Form.Control.Feedback type='invalid'>Please provide a valid email.</Form.Control.Feedback>
            </Form.Group>
            <Row>
              <Col>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    //paddingBottom: "20px",
                    color: "white",
                    fontSize: "24px",
                    fontFamily: "Grandstander",
                    fontWeight: "900",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    //textAlign: "center",
                    wordWrap: "break-word",
                  }}
                >
                  By pressing Enter you agree to let us use cookies to improve game performance
                </div>
              </Col>
            </Row>
          </Container>
        </Form>
      </div>
    </div>
  );
};

export default LandingNew;
