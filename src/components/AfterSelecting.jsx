import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { addUser, checkGameCode, joinGame } from "../util/Api";
import {ReactComponent as Polygon} from "../assets/Polygon 1.svg";
import { Col, Container, Row, Stack } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";

import "../styles/Landing.css";

const AfterSelecting = () => {
    const [gameCode, setGameCode] = useState("");
    const navigate = useNavigate(),
        location = useLocation();
    const userData = location.state;
    const [isCreateLoading, setCreateLoading] = useState(false);
    const [isJoinLoading, setJoinLoading] = useState(false);
    const context = useContext(ErrorContext);
    const handleShare = () => {

    };
    const handleStart= () => {
        navigate("/FinalScore", { state: userData });
    };
    return ( 
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%', 
                height: '100vh', 
                background: '#CBDFBD',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
            <Container fluid>
                <Row className="text-center" >
                    <Col style={{ position: "relative", width: 390,}}>
                        <Polygon style={{ position: "absolute", bottom: "-32px", right: "60px" }}/>
                        <input
                            type="text"
                            style={{
                                width: 350,
                                height: 60,
                                background: "#FFF",
                                borderRadius: 30,
                                paddingLeft: 24,
                                paddingRight: 24,
                                paddingTop: 6,
                                paddingBottom: 6,
                                color: "black",
                                fontSize: 24,
                                fontFamily: "Grandstander",
                                fontWeight: "700",
                                wordWrap: "break-word",
                                marginLeft: "0px",
                                marginTop: "32px",
                                border: "none", 
                                outline: "none", 
                            }}
                            value="Waiting for all Players . . ." 
                            readOnly 
                        />
                    </Col>
                </Row>
            </Container>
            </div>
            <div style={{ marginLeft: "80px", marginTop: "64px", display: "flex", alignItems: "center" }}>
                <div style={{ width: 35, height: 35, background: '#8D3B9B', borderRadius: 9999 }} />
                <div style={{ marginTop:"8px", marginLeft: "10px", color: 'white', fontSize: 25, fontFamily: 'Grandstander', fontWeight: '700', wordWrap: 'break-word' }}>Shruti</div>
            </div>
            <Row className="text-center py-3" style={{ marginLeft: "-150px", marginTop: "200px", width: 390, color: 'white', fontSize: 32, fontFamily: 'Grandstander', fontWeight: '700', wordWrap: 'break-word', justifyContent: "flex-start" }}>
                <Col>Game Code</Col>
            </Row>
            <Stack style={{ display: "flex", justifyContent: "center", alignItems:"center", marginTop: "-150px"}}>
                <input
                    type="text"
                    style={{
                    width: 330,
                    height: 55,
                    background: "#DC816A",
                    borderRadius: 40,
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingTop: 6,
                    paddingBottom: 6,
                    color: "#FFF",
                    fontSize: 24,
                    fontFamily: "Grandstander",
                    fontWeight: "700",
                    wordWrap: "break-word",
                    border: "none",
                    outline: "none",
                    textAlign: "center",
                    }}
                    value="75292402"
                    readOnly
                />
                <Button variant="warning" onClick={handleShare}
                    style={{
                        width: 330,
                        height: 55,
                        background: "#DC816A",
                        borderRadius: 40,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: 24,
                        fontFamily: "Grandstander",
                        fontWeight: "700",
                        wordWrap: "break-word",
                        marginTop: "10px",
                    }}
                >
                    Share with other players
                </Button>
                <Button variant="warning" onClick={handleStart}
                    style={{
                        width: 330,
                        height: 55,
                        background: "#71CAA3",
                        borderRadius: 40,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: 24,
                        fontFamily: "Grandstander",
                        fontWeight: "700",
                        wordWrap: "break-word",
                        marginTop: "130px",
                    }}
                >
                    Start Game
                </Button>
            </Stack>
        </div>
    );
}
 
export default AfterSelecting;