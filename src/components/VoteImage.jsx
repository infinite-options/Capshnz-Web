import { ReactComponent as PolygonWhiteUpward } from "../assets/polygon-upward-white.svg";
import Form from "react-bootstrap/Form";
import { Row, Col, Button, Container } from "react-bootstrap";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VoteImage = () => {
  const [isInvalid, setInvalid] = useState(false);
  const navigate = useNavigate(),
    location = useLocation();
  function handleSubmit() {
    navigate("/ScoreboardNew");
  }
  return (
    <div
      style={{
        background: "#878787",
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Container fluid>
        <Row className="text-center">
          <div
            style={{
              width: 375,
              height: 365,
              background: "#D9D9D9",
              borderRadius: 30,
              position: "absolute",
              top: 32,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "1rem",
              //marginBottom: 20,
            }}
          >
            <p
              style={{
                fontFamily: "Grandstander",
                fontSize: 60,
                fontWeight: 500,
                lineHeight: "60px",
                letterSpacing: "0em",
                textAlign: "left",
                margin: 0,
                padding: 20,
              }}
            >
              IMAGE
            </p>
          </div>
        </Row>

        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group>
            <Row className="text-center">
              <Button
                variant="success"
                type="submit"
                disabled={() => {}}
                style={{
                  width: "90%",
                  height: 54,
                  background: "#5E9E94",
                  borderRadius: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 35,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginLeft: "1rem",
                  marginTop: "23rem",
                }}
              >
                Press to Submit
              </Button>
            </Row>
            <Row
              className="text-center"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  background: "#ADC3EC",
                  borderRadius: "50%",
                  position: "absolute",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 30,
                  fontFamily: "Grandstander",
                  fontWeight: "700",
                  wordWrap: "break-word",
                  marginBottom: "10rem",
                  marginTop: "17rem",
                }}
              >
                60
              </div>
            </Row>
            <Row className="text-center">
              <Button
                variant="success"
                //type="submit"
                disabled={() => {}}
                style={{
                  width: "80%",
                  height: 54,
                  background: "#D4B551",
                  borderRadius: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 35,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginLeft: "2.5rem",
                  marginTop: "7rem",
                }}
              >
                A
              </Button>
            </Row>
            <Row className="text-center">
              <Button
                variant="success"
                //type="submit"
                disabled={() => {}}
                style={{
                  width: "80%",
                  height: 54,
                  background: "#D4B551",
                  borderRadius: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 35,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginLeft: "2.5rem",
                  marginTop: "1rem",
                }}
              >
                B
              </Button>
            </Row>
            <Row className="text-center">
              <Button
                variant="success"
                //type="submit"
                disabled={() => {}}
                style={{
                  width: "80%",
                  height: 54,
                  background: "#FD8B76",
                  borderRadius: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 35,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginLeft: "2.5rem",
                  marginTop: "1rem",
                }}
              >
                C
              </Button>
            </Row>
          </Form.Group>
        </Form>
        <Row className="text-center">
          <Col style={{ position: "relative" }}>
            <div style={{ marginLeft: "-110px" }}>
              <PolygonWhiteUpward />
            </div>
            <input
              type="text"
              style={{
                width: "90%",
                height: 56,
                background: "#FFF",
                borderRadius: 30,
                paddingLeft: 24,
                paddingRight: 24,
                paddingTop: 6,
                paddingBottom: 6,
                color: "black",
                fontSize: 30,
                fontFamily: "Grandstander",
                fontWeight: "700",
                wordWrap: "break-word",
                marginTop: "-1px",
                border: "none",
                outline: "none",
                textAlign: "center",
                marginRight: "auto",
                marginLeft: "auto",
              }}
              value="Selected Gallery"
              readOnly
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};
export default VoteImage;
