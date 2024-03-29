import { useContext, useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useCookies } from 'react-cookie'
import useAbly from "../util/ably";
import { createGame, joinGame } from "../util/Api.js"
import "../styles/RoundType.css"
import { ErrorContext } from "../App.js"
import { handleApiError } from "../util/ApiHelper.js"

export default function RoundType() {
    const navigate = useNavigate(), location = useLocation()
    const [userData, setUserData] = useState(location.state)
    const [cookies, setCookie] = useCookies(["userData"])
    const [roundInfo, setRoundInfo] = useState({numOfRounds: 10, roundTime: 60})
    const [isLoading, setLoading] = useState(false)
    const context = useContext(ErrorContext)
    const { publish } = useAbly(userData.gameCode)

    function handleChange(event){
        if(event.target.name === "numOfRounds"){
            setRoundInfo({
                ...roundInfo,
                numOfRounds: parseInt(event.target.value)
            })
        }
        else if(event.target.name === "roundTime"){
            setRoundInfo({
                ...roundInfo,
                roundTime: parseInt(event.target.value)
            })
        }
    }

    function validateRoundInfo(){
        if(!Number.isFinite(roundInfo.numOfRounds) || roundInfo.numOfRounds < 1 || roundInfo.numOfRounds > 20){
            alert("Please enter 1 - 20 rounds.")
            return false
        }
        else if(!Number.isFinite(roundInfo.roundTime) || roundInfo.roundTime < 1 || roundInfo.roundTime > 120){
            alert("Please enter a value less than 120 seconds.")
            return false
        }
        return true
    }

    async function continueButton() {
        try {
            setLoading(true)
            if (!validateRoundInfo())
                return
            console.log(userData)
            const gameInfo = await createGame(userData.playerUID, roundInfo.numOfRounds, roundInfo.roundTime, userData.scoreType)
            if(userData.playAgain) {
                await publish({data: {
                    message: "Start Again",
                    gameCode: gameInfo.game_code
                }});
            }
            const updatedUserData = {
                ...userData,
                deckSelected: false,
                numOfRounds: roundInfo.numOfRounds,
                roundTime: roundInfo.roundTime,
                gameUID: gameInfo.game_uid,
                gameCode: gameInfo.game_code
            }
            setUserData(updatedUserData)
            setCookie("userData", updatedUserData, {path: '/'})
            await joinGame(updatedUserData)
            navigate("/Waiting", { state: updatedUserData })
        } catch(error) {
            handleApiError(error, continueButton, context)
        } finally {
            setLoading(false)
        }
    }

    return(
        <div className="roundType">
            <Link to="/GameRules" className="gameRulesRoundType">
                <i className="fa fa-info-circle"></i>
                Game Rules
            </Link>
            <div className="oneRoundType">
                <h4>
                    Enter the number of rounds and time for each round
                </h4>
                <br/>
                <h4>
                    Number of Rounds
                </h4>
            </div>
            <input className="inputRoundType" onChange={handleChange} type="text" name="numOfRounds" defaultValue="10" />
            <div className="twoRoundType">
                <h5>
                    This means how many images would you like to go through during your game.
                    <br/>
                    (1 image = 1 round)
                </h5>
                <br/>
                <h4>
                    Time for each round (seconds)
                </h4>
            </div>
            <input className="inputRoundType" onChange={handleChange} type="text" name="roundTime" defaultValue="60" />
            <h5 className="threeRoundType">
                This defines how many seconds you would like to give everyone to caption an image.
                <br/>
                We recommend 60 seconds!
            </h5>
            <br/>
            <button className="buttonRoundType" onClick={continueButton} disabled={isLoading}>
                {isLoading?"Loading...":"Continue"}
            </button>
        </div>
    )
}