import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { addUser, checkGameCode, joinGame } from "../util/Api";
import { ReactComponent as Polygon } from "../assets/Polygon 3.svg";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";
import Spinner from 'react-bootstrap/Spinner';
import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import useAbly from "../util/ably";


    

const MidGameWaitingRoom =()=>{
    const navigate = useNavigate(),
    location = useLocation();
    const [userData, setUserData] = useState(location.state);
    const { publish, subscribe, unSubscribe, detach } = useAbly(
        `${userData.gameCode}/${userData.roundNumber}`
      );
    const [cookies, setCookie] = useCookies(["userData"]);
    useEffect(()=>{
        console.log("here 15 before subscribe")
            subscribe((event) => {
        
                console.log("here 15 before inside subs")
                if( event.data.message  === "Start Vote"){
                navigate("/VoteImage", { state: userData });
              }
        
              else if( event.data.message === "Start ScoreBoard"){
                setCookie("userData", userData, {path: '/'})
                navigate("/ScoreBoardNew", { state: userData })
        
              }else if (event.data.message === "Start Next Round"){
                const updatedUserData = {
                  ...userData,
                  roundNumber: event.data.roundNumber,
                  imageURL: event.data.imageURL,
                };
                setCookie("userData", updatedUserData, { path: "/" });
                navigate("/CaptionNew", { state: updatedUserData });
              } else if (event.data.message === "Start EndGame") {
                navigate("/FinalScore", { state: userData });
              }
            })
        
        
          },[userData])
    
    return (
      <>
        {/* <Button variant="primary" onClick={handleShow}>
          Launch demo modal
        </Button> */}
          <Spinner animation="grow" />

          <span >Wait while we add you back to the game  </span>
        
  
      </>
    );
  }

  export default MidGameWaitingRoom;