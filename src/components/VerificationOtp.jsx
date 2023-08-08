import { Col, Container, Row } from "react-bootstrap";
import { ReactComponent as PolygonWhiteDownward } from "../assets/polygon-downwards-white.svg";
import { ReactComponent as PolygonGreyUpward } from "../assets/polygon-upward-grey.svg";
import Button from "react-bootstrap/Button";
import ReactCodeInput from "react-code-input";
import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ErrorContext } from "../App.js";

const codeInputStyle = {
  borderRadius: "6px",
  border: "1px solid",
  boxShadow: "0px 0px 10px 0px rgba(0,0,0,.10)",
  margin: "4px",
  padding: "0 0 0 10px",
  width: "88px",
  height: "123px",
  fontSize: "32px",
  boxSizing: "border-box",
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

  function handleOnOTPSubmit() {
    navigate("/EnterName");
  }

  return (
    <div
      style={{
        width: 430,
        height: 932,
        position: "relative",
      }}
    >
      <Container className="container" fluid>
        <Row className="text-center py-5">
          <Col>
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
        <Row>
          <PolygonGreyUpward style={{ marginLeft: "-123px" }} />
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
              marginBottom: "60px",
            }}
          >
            Enter 3 digit code
          </div>
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
        <Button
          variant="success"
          type="submit"
          onClick={handleOnOTPSubmit}
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
            marginTop: "100px",
          }}
        >
          Enter
        </Button>
      </Container>
    </div>
  );
};
export default VerificationOtp;
