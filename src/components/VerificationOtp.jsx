import { Col, Container, Row } from "react-bootstrap";
import { ReactComponent as PolygonWhiteDownward } from "../assets/polygon-downwards-white.svg";
import { ReactComponent as PolygonGreyUpward } from "../assets/polygon-upward-grey.svg";
import Button from "react-bootstrap/Button";
import ReactCodeInput from "react-code-input";
import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ErrorContext } from "../App.js";
import { handleApiError } from "../util/ApiHelper.js";
import { checkEmailCode } from "../util/Api.js";
import "../styles/VerificationOtp.css";

const codeInputStyle = {
  //borderRadius: "6px",
  border: "0px",
  boxShadow: "0px 0px 10px 0px rgba(0,0,0,.10)",
  margin: "16px",
  width: "88px",
  height: "123px",
  fontSize: "32px",
  boxSizing: "border-box",
  textAlign: "center",
};

const VerificationOtp = () => {
  const navigate = useNavigate(),
    location = useLocation();
  const userData = location.state;
  const [code, setCode] = useState("");
  const [valid, setValid] = useState(true);
  const context = useContext(ErrorContext);

  function handleChange(code) {
    setCode(code);
  }

  async function handleSubmit() {
    try {
      const status = await checkEmailCode(userData.playerUID, code);
      if (status.email_validated_status === "TRUE") {
        navigate("/StartGame", { state: userData });
      } else {
        setValid(false);
        setTimeout(() => {
          setValid(true);
        }, 5000);
      }
    } catch (error) {
      handleApiError(error, handleSubmit, context);
    }
  }

  function handleEmailChange() {
    navigate("/");
  }

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
        <Container className="container-main" fluid>
          <Row className="text-center" style={{ marginTop: "36px" }}>
            <Col
              style={{
                position: "relative",
              }}
            >
              <input
                style={{
                  width: "351px",
                  height: "70px",
                  backgroundColor: "white",
                  borderRadius: "40px",
                  flexShrink: 0,
                  fontSize: "33px",
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
          <Row>
            <Col
              style={{
                marginLeft: "70px",
                marginTop: "20px",
                marginBottom: "60px",
              }}
            >
              <PolygonGreyUpward
                style={{ marginLeft: "20px", marginBottom: "-10px" }}
              />
              <div
                style={{
                  width: 340,
                  height: 61,
                  background: "#B5BBD3",
                  borderRadius: 40,
                  color: "white",
                  fontSize: 30,
                  fontFamily: "Grandstander",
                  fontWeight: "800",
                  wordWrap: "break-word",
                  border: "none",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Enter 3 digit code
              </div>
            </Col>
          </Row>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <ReactCodeInput
              type="number"
              inputStyle={codeInputStyle}
              fields={3}
              onChange={handleChange}
              marginLeft="10px"
            />
          </div>
          {!valid && (
            <div className="validConfirmation">
              Invalid Code. Please Try Again.
            </div>
          )}
          <Row>
            <Col
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                variant="success"
                type="submit"
                onClick={handleSubmit}
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
                  marginTop: "100px",
                }}
              >
                Enter
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  color: "white",
                  fontSize: "24px",
                  fontFamily: "Grandstander",
                  fontWeight: "900",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  wordWrap: "break-word",
                }}
              >
                A 3 digit code has been sent to your email. Please check your
                email and enter the code above.
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};
export default VerificationOtp;
