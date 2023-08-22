import { Container, Col, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { addUser } from "../util/Api";
import { ReactComponent as PolygonWhiteDownward } from "../assets/polygon-downwards-white.svg";
import { ReactComponent as PolygonWhiteUpward } from "../assets/polygon-upward-white.svg";

const EnterName = () => {
  const navigate = useNavigate(),
    location = useLocation();
  const userData = location.state;
  const [name, setName] = useState(userData.name);
  const [alias, setAlias] = useState(userData.alias);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleAliasChange = (event) => {
    setAlias(event.target.value);
  };

  const hasAnyNameChanged = () => {
    const { prevName, prevAlias } = userData;
    if (prevName !== name || prevAlias !== alias) return true;
    return false;
  };

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      const updatedUserData = {
        ...userData,
        name,
        alias,
      };
      if (hasAnyNameChanged()) await addUser(updatedUserData);
      if (userData.user_code === "TRUE")
        navigate("/StartGame", { state: updatedUserData });
      else navigate("/VerificationOtp", { state: updatedUserData });
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="div-main">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Form noValidate onSubmit={handleSubmit}>
          <Container fluid>
            <Row className="text-center" style={{ marginTop: "36px" }}>
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
                  value="Welcome to Capshnz"
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
            <Form.Group as={Col} md="10">
              <Row className="text-center">
                <Col>
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
                    value={name}
                    type="text"
                    placeholder="Enter name here..."
                    onChange={handleNameChange}
                  />
                  <PolygonWhiteDownward
                    style={{
                      marginLeft: "200px",
                      marginTop: "-10px",
                    }}
                  />
                </Col>
              </Row>
              <Row className="text-center">
                <Col>
                  <PolygonWhiteUpward
                    style={{
                      marginLeft: "-223px",
                      marginBottom: "-10px",
                    }}
                  />
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
                    value={alias}
                    type="text"
                    placeholder="Enter screen name here..."
                    onChange={handleAliasChange}
                  />
                </Col>
              </Row>
              <Row className="text-center">
                <Col>
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
                      marginTop: "5rem",
                    }}
                  >
                    Enter
                  </Button>
                </Col>
              </Row>
            </Form.Group>
            {/* <Row>
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
                  By pressing Enter you agree to let us use cookies to improve
                  game performance
                </div>
              </Col>
            </Row> */}
          </Container>
        </Form>
      </div>
    </div>
  );
};
export default EnterName;
