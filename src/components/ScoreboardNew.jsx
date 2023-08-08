import { Container, Row, Col, Button } from "react-bootstrap";
import { ReactComponent as Polygon } from "../assets/Polygon 1.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as PolygonWhiteUpward } from "../assets/polygon-upward-white.svg";
import { ReactComponent as PolygonYelloUpward } from "../assets/polygon-upward-yellow.svg";

const ScoreboardNew = () => {
  const navigate = useNavigate(),
    location = useLocation();
  const userData = location.state;

  const handlePlayAgain = () => {
    navigate("/FinalScore", { state: userData });
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        background: "#E58D80",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "100%",
          overflowY: "scroll",
          maxHeight: "100vh",
        }}
      >
        <Container fluid>
          <Row className="text-center">
            <Col style={{ position: "relative" }}>
              <input
                type="text"
                style={{
                  width: 350,
                  height: 64,
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
                  marginTop: "8px",
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                  marginRight: "auto",
                  marginLeft: "auto",
                }}
                value="Scoreboard!"
                readOnly
              />
              <div style={{ marginTop: "-10px", marginLeft: "120px" }}>
                <Polygon />
              </div>
            </Col>
          </Row>
          <Row className="text-center">
            <div
              style={{
                width: "374px",
                height: "365px",
                padding: "20px",
                borderRadius: "40px",
                background: "#D9D9D9",
                color: "#FFF",
                fontSize: "26px",
                fontFamily: "Grandstander",
                marginTop: "64px",
                marginLeft: "auto",
                marginRight: "auto",
                marginBottom: "2rem",
              }}
            ></div>
          </Row>
          <Row className="text-center">
            <div style={{ marginLeft: "-110px" }}>
              <PolygonYelloUpward />
            </div>
            <div
              style={{
                width: "400px",
                height: "223px",
                padding: "20px",
                borderRadius: "40px",
                background: "#F2BF7D",
                color: "#FFF",
                fontSize: "26px",
                fontFamily: "Grandstander",
                //marginTop: "64px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            ></div>
          </Row>
          <Row
            className="text-center"
            style={{ marginTop: "32px", marginLeft: "0px" }}
          >
            <Col style={{ position: "relative" }}>
              <Button
                variant="warning"
                onClick={handlePlayAgain}
                style={{
                  width: 350,
                  height: 55,
                  background: "#5E9E94",
                  borderRadius: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 30,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginBottom: "2rem",
                }}
              >
                Next Round
              </Button>
            </Col>
          </Row>
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
    </div>
  );
};
export default ScoreboardNew;
