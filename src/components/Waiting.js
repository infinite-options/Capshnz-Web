import { useContext, useEffect, useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useCookies } from 'react-cookie'
import { getApiImages, postCreateRounds } from "../util/Api"
import useAbly from "../util/ably";
import "../styles/Waiting.css"
import { handleApiError } from "../util/ApiHelper"
import { ErrorContext } from "../App"

export default function Waiting(){
    const navigate = useNavigate(), location = useLocation()
    const [userData, setUserData] = useState(location.state)
    const [cookies, setCookie] = useCookies(["userData"])
    const {
        publish,
        subscribe,
        onMemberUpdate,
        getMembers,
        addMember,
        unSubscribe,
        removeMember
      } = useAbly(userData.gameCode)
    const [buttonText, setButtonText] = useState("Share with other players")
    const [lobby, setLobby] = useState([])
    const [isLoading, setLoading] = useState(false)
    const context = useContext(ErrorContext)

    function copyGameCodeButton(){
        navigator.clipboard.writeText(userData.gameCode)
        setButtonText("Copied!")
        setTimeout(() => {
            setButtonText("Share with other players")
        }, 2000)
    }

    function selectDeckButton() {
        navigate("/SelectDeck", { state: userData })
    }

    async function startGameButton() {
        try {
            setLoading(true)
            let imageURL = ""
            if(userData.isApi){
                const imageURLs = await getApiImages(userData)
                imageURL = await postCreateRounds(userData.gameCode, imageURLs)
            }
            await publish({data: {
                    message: "Start Game",
                    numOfPlayers: lobby.length,
                    isApi: userData.isApi,
                    deckTitle: userData.deckTitle,
                    deckUID: userData.deckUID,
                    gameUID: userData.gameUID,
                    numOfRounds: userData.numOfRounds,
                    roundTime: userData.roundTime,
                    imageURL: imageURL
            }})
        } catch (error) {
            handleApiError(error, startGameButton, context)
        } finally {
            setLoading(false)
        }
    }

    const destroyLobby = async () => {
        unSubscribe()
        removeMember(userData.playerUID)
    }

    const refreshLobby = async () => {
        const members = await getMembers()
        setLobby(members.map((member) => member.data))
    }

    const initializeLobby = async () => {
        await onMemberUpdate(refreshLobby);
        await addMember(userData.playerUID, { alias: userData.alias });
        await subscribe(async (event) => {
          if (event.data.message === "Start Game") {
                const updatedUserData = {
                ...userData,
                numOfPlayers: event.data.numOfPlayers,
                isApi: event.data.isApi,
                deckTitle: event.data.deckTitle,
                deckUID: event.data.deckUID,
                gameUID: event.data.gameUID,
                numOfRounds: event.data.numOfRounds,
                roundTime: event.data.roundTime,
                imageURL: event.data.imageURL,
                };
                setUserData(updatedUserData);
                setCookie("userData", updatedUserData, { path: "/" });
                navigate("/Caption", { state: updatedUserData });
            }
        })
    }

    useEffect(() => {
        initializeLobby()
        return () => destroyLobby()
    }, [])

    return(
        <div className="waiting">
            <Link to="/GameRules" className="gameRulesWaiting">
                <i className="fa fa-info-circle"></i>
                Game Rules
            </Link>
            <h4 className="oneWaiting">
                Waiting for all players to join
            </h4>
            <ul className="lobbyWaiting">
                {lobby.map((player, index) => {
                    return(
                        <li key={index} className="lobbyPlayerWaiting">
                            <i className="fas fa-circle fa-3x" style={{color: "purple"}}/>
                            {player.alias}
                        </li>
                    )
                })}
            </ul>
            <button className="gameCodeWaiting">Game Code: {userData.gameCode}</button>
            <br/>
            <br/>
            <button className="buttonRoundType" onClick={copyGameCodeButton}>
                {buttonText}
            </button>
            <br/>
            <br/>
            {userData.host && !userData.deckSelected &&
                <button className="buttonRoundType" onClick={selectDeckButton}>
                    Select Deck
                </button>
            }
            {userData.host && userData.deckSelected &&
                <button className="buttonRoundType" onClick={startGameButton} disabled={isLoading}>
                    {isLoading?"Starting...":"Start Game"}
                </button>
            }
        </div>
    )
}