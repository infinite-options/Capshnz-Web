import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { addUser, checkGameCode, joinGame } from "../util/Api";
import {ReactComponent as Polygon} from "../assets/Polygon 1.svg";
import {ReactComponent as Cleveland} from "../assets/image 6.svg";
import {ReactComponent as Google} from "../assets/image 5.svg";
import {ReactComponent as Chicago} from "../assets/image 7.svg";
import {ReactComponent as Giphy} from "../assets/image 8.svg";
import {ReactComponent as Harvard} from "../assets/image 9.svg";
import {ReactComponent as CNN} from "../assets/image 10.svg";
import { Col, Container, Row, Stack } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";

import "../styles/Landing.css";


const FinalScore = () => {
    const [gameCode, setGameCode] = useState("");
    const navigate = useNavigate(),
        location = useLocation();
    const userData = location.state;
    const [isCreateLoading, setCreateLoading] = useState(false);
    const [isJoinLoading, setJoinLoading] = useState(false);
    const context = useContext(ErrorContext);
    const [people, setPeople] = useState([
        { name: 'John', score: 5 },
        { name: 'Alice', score: 8 },
        { name: 'Bob', score: 3 },
      ]);


    const handlePlay = () => {
        navigate("/FinalScore", { state: userData });
    };
    const handleReturn = () => {
        navigate("/FinalScore", { state: userData });
    };
    const handleCaption = () => {
        navigate("/FinalScore", { state: userData });
    };
    return ( 
        <div
            style={{width: '100%', height: '1300px', background: '#E58D80',}}
        >
            <Container fluid>
                <Row className="text-center" >
                    <Col style={{ position: "relative" }}>
                        <Polygon style={{ position: "relative", bottom: "-110px", left: "-64px" }}/>
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
                                marginLeft: "0px",
                                marginTop: "8px",
                                border: "none", 
                                outline: "none", 
                                textAlign: "center",
                            }}
                            value="Game Over!" 
                            readOnly 
                        />
                    </Col>
                </Row>
                <Row className="text-center" style={{marginTop:"16px",}}>
                    <Col style={{ position: "relative" , marginLeft:"48px"}}>
                        <Polygon style={{ position: "absolute", bottom: "-40px", right: "80px",}}/>
                        <input
                            type="text"
                            style={{
                                width: 300,
                                height: 41,
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
                                textAlign: "center",
                            }}
                            value="Final Scores" 
                            readOnly 
                        />
                    </Col>
                </Row>
                <div
                style={{
                    width: '360px',
                    padding: '20px',
                    borderRadius: '40px',
                    background: '#46C3A6',
                    color: '#FFF',
                    fontSize: '26px',
                    fontFamily: 'Grandstander',
                    marginTop: '64px',
                    marginLeft: 'auto',  
                    marginRight: 'auto', 
                }}
                >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{marginLeft:"64px"}}>Alias</div>
                    <div style={{marginRight:"64px"}}>Total</div>
                </div>
                {people.map((person, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{marginLeft:"64px"}}>{person.name}</div>
                    <div style={{marginRight:"64px"}}> {person.score}</div>
                    </div>
                ))}
                </div>
                <Row className="text-center" style={{marginTop:"80px", marginLeft:"0px"}}>
                    <Col style={{ position: "relative" }}>
                        <Button variant="warning" onClick={handlePlay}
                            style={{
                                width: 350,
                                height: 55,
                                background: "#DCE56F",
                                borderRadius: 30,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "white",
                                fontSize: 30,
                                fontFamily: "Grandstander",
                                fontWeight: "600",
                                wordWrap: "break-word",
                                marginLeft: 'auto',  
                                marginRight: 'auto', 
                            }}
                        >
                        Play Again
                        </Button>
                    </Col>
                </Row>
                <Row className="text-center" style={{marginTop:"32px", marginLeft:"0px"}}>
                    <Col style={{ position: "relative" }}>
                        <Button variant="warning" onClick={handleReturn}
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
                                marginLeft: 'auto',  
                                marginRight: 'auto', 
                            }}
                        >
                        Return to Home
                        </Button>
                    </Col>
                </Row>
                <Row className="text-center" style={{marginTop:"64px",}}>
                    <Col style={{ position: "relative" ,}}>
                        <Polygon style={{ position: "absolute", bottom: "-40px", right: "80px",}}/>
                        <input
                            type="text"
                            style={{
                                width: 350,
                                height: 55,
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
                                marginTop: "32px",
                                border: "none", 
                                outline: "none", 
                                textAlign: "center",
                                marginLeft: 'auto',  
                                marginRight: 'auto', 
                            }}
                            value="Winning Captions" 
                            readOnly 
                        />
                    </Col>
                </Row>
                <div
                style={{
                    width: '374px',
                    height: '235px',
                    padding: '20px',
                    borderRadius: '40px',
                    background: '#D9D9D9',
                    color: '#FFF',
                    fontSize: '26px',
                    fontFamily: 'Grandstander',
                    marginTop: '64px',
                    marginLeft: 'auto',  
                    marginRight: 'auto', 
                }}
                >
                </div>
                <Row className="text-center py-3" style={{marginLeft:"auto", marginRight:"auto", marginTop:"2px",width: 136, height: 31, color: '#FFF', fontSize: 25, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                    <Col> Round x </Col>
                </Row>
                <Row className="text-center" style={{marginTop:"40px", marginLeft:"0px"}}>
                    <Col style={{ position: "relative" }}>
                        <Button variant="warning" onClick={handleCaption}
                            style={{
                                width: 350,
                                height: 55,
                                background: "#F5F5F5",
                                borderRadius: 30,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "#000",
                                fontSize: 30,
                                fontFamily: "Grandstander",
                                fontWeight: "600",
                                wordWrap: "break-word",
                                marginLeft: 'auto',  
                                marginRight: 'auto', 
                            }}
                        >
                        Caption
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
 
export default FinalScore;