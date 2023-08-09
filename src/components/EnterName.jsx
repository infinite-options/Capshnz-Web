import { Container, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { addUser } from "../util/Api";

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
    <div>
      <Form noValidate onSubmit={handleSubmit}>
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
              value={name}
              type="text"
              placeholder="Enter name here..."
              onChange={handleNameChange}
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
              value={alias}
              type="text"
              placeholder="Enter screen name here..."
              onChange={handleAliasChange}
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
