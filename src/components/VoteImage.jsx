import { ReactComponent as PolygonWhiteUpward } from "../assets/polygon-upward-white.svg";
import Form from "react-bootstrap/Form";
import { Col, Button } from "react-bootstrap";
import { useState } from "react";

const VoteImage = () => {
  const [isInvalid, setInvalid] = useState(false);

  return (
    <div
      style={{
        background: "#7580B5D9",
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
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
      <Form noValidate onSubmit={() => {}}>
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
              marginTop: "160px",
            }}
            required
            //value={email}
            type="text"
            placeholder="Enter caption here..."
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
              marginLeft: "90px",
              marginTop: "100px",
            }}
          >
            Submit
          </Button>
        </Form.Group>
      </Form>
      <div
        style={{
          //paddingTop: "200px",
          //position: "absolute",
          //display: "flex",
          //justifyContent: "center",
          //alignItems: "center",
          bottom: 20,
          left: 0,
          right: 0,
        }}
      >
        <PolygonWhiteUpward style={{ marginLeft: "-163px" }} />

        <div
          style={{
            width: "95%",
            height: 56,
            background: "white",
            borderRadius: 40,
            position: "absolute",
            //top: 805,
            left: 7,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "black",
            fontSize: 37,
            fontFamily: "Grandstander",
            fontWeight: "700",
            wordWrap: "break-word",
          }}
        >
          Selected Gallery
        </div>
      </div>
    </div>
  );
};
export default VoteImage;
