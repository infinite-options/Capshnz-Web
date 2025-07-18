import axios from "./config"
import { getApiImagesHelper } from "./ApiHelper"

const devURL = "http://localhost:4030"; //need captions-backend running locally in lh:4030
const liveURL = "https://bmarz6chil.execute-api.us-west-1.amazonaws.com/dev";
const ec2URL = "https://cap1202sspm.capshnz.com";
const baseURL = liveURL;
const checkGameURL = baseURL+"/api/v2/checkGame"
const checkEmailCodeURL = baseURL+"/api/v2/checkEmailValidationCode"
const addUserURL = baseURL+"/api/v2/addUser"
const createGameURL = baseURL+"/api/v2/createGame"
const joinGameURL = baseURL+"/api/v2/joinGame"
const decksURL = baseURL+"/api/v2/decks"
const selectDeckURL = baseURL+"/api/v2/selectDeck"
const postAssignDeckURL = baseURL+"/api/v2/assignDeck"
const postRoundImageURL = baseURL+"/api/v2/postRoundImage"
const getPlayersURL = baseURL+"/api/v2/getPlayers/"
const getImageURL = baseURL+"/api/v2/getImageForPlayers/"
const getUniqueImageInRoundURL = baseURL+"/api/v2/getUniqueImageInRound/"
const submitCaptionURL = baseURL+"/api/v2/submitCaption"
const getAllSubmittedCaptionsURL = baseURL+"/api/v2/getAllSubmittedCaptions/"
const postVoteCaptionURL = baseURL+"/api/v2/voteCaption"
const getUpdateScoresURL = baseURL+"/api/v2/updateScores/"
const getPlayersWhoHaventVotedURL = baseURL+"/api/v2/getPlayersWhoHaventVoted/"
const getScoreBoardURL = baseURL+"/api/v2/getScoreBoard/"
const createNextRoundURL = baseURL+"/api/v2/createNextRound"
const createRounds = baseURL+"/api/v2/createRounds"
const nextImage = baseURL+"/api/v2/getNextImage"
const errorURL = baseURL+"/api/v2/sendError/"
const CheckGameURL = baseURL+"/api/v2/getRoundImage"
// const getCNNDeckURLS = "https://myx6g22dd2rtcpviw3d5wuz7eu0zudaq.lambda-url.us-west-2.on.aws/"
// const getCNNDeckURLS = "http://127.0.0.1:4000/api/v2/cnn_webscrape"
const getCNNDeckURLS = baseURL+"/api/v2/cnn_webscrape"
const getgameScoreURL =  baseURL+"/api/v2/getScores/"
const addUserByEmailURL =  baseURL+"/api/v2/addUserByEmail"
const addFeedbackURL =  baseURL+"/api/v2/addFeedback"
const summaryURL =  baseURL+"/api/v2/summary"
const summaryEmailURL =  baseURL+"/api/v2/summaryEmail"
const getCurrentRoundURL = baseURL+"/api/v2/getCurrentGame"

async function checkGameCode(gameCode){
    const codeStatus = await axios.get(checkGameURL + '/' + gameCode)
    if(codeStatus.data.warning === "Invalid game code") {
        alert("Please enter a valid game code.")
        return false
    }
    return true
}

async function checkGameStarted(gameCode,round){
    const Game_status = await axios.get(CheckGameURL + '/' + gameCode + ',' + round)
    if(Game_status.data.result[0].round_image_uid === null ) {
        return false
    }
    return true
}
async function getGameImageForRound(gameCode,round){
    const Game_status = await axios.get(CheckGameURL + '/' + gameCode + ',' + round)
    return Game_status.data.result[0].round_image_uid
}

async function checkEmailCode(playerUID, code){
    const payload = {
        user_uid: playerUID,
        code: code
    }
    
    const status = await axios.post(checkEmailCodeURL, payload)
        .then(response => response.data)
    return status
}

async function addUser(userData) {
    const payload = {
        user_name: userData.name,
        user_email: userData.email,
        user_zip: userData.zipCode,
        user_alias: userData.alias
    }
    const playerInfo = await axios.post(addUserURL, payload)
        .then(response => response.data)
    return playerInfo
}

async function addUserByEmail(user_email) {
    const response = await axios.post(addUserByEmailURL, 
        { user_email })
    return response.data
}

async function getCnnImageURLS() {
    const CnnImageURLS = await axios.get(getCNNDeckURLS, {
        timeout: 60000
    }).then(response => {
        if (response.status != 200) {
            return []
        }            
        return response.data
    })
    return CnnImageURLS
}

async function createGame(playerUID, numOfRounds, roundTime, scoreType){
    const payload = {
        user_uid: playerUID,
        rounds: numOfRounds.toString(),
        round_time: "00:00:" + roundTime.toString(),
        scoring_scheme: scoreType
    }
    const gameInfo = await axios.post(createGameURL, payload)
        .then(response => response.data)
    return gameInfo
}

async function joinGame(userData){
    const payload = {
        game_code: userData.gameCode,
        user_uid: userData.playerUID
    }
    await axios.post(joinGameURL, payload)
    return
}

async function getDecks(playerUID){
    const decksInfo = await axios.get(decksURL + "/" + playerUID + "," + "true")
        .then(response => response.data.decks_info)
    return decksInfo
}

async function getPlayers(gameCode){
    const players = await axios.get(getPlayersURL + gameCode)
        .then(response => response.data.players_list)
    return players
}

async function selectDeck(deckUID, gameCode, roundNumber){
    const payload = {
        game_code: gameCode.toString(),
        deck_uid: deckUID.toString(),
        round_number: roundNumber.toString()
    }
    await axios.post(selectDeckURL, payload)
    return
}

async function assignDeck(deckUID, gameCode){
    const payload = {
        deck_uid: deckUID,
        game_code: gameCode
    }
    await axios.post(postAssignDeckURL, payload)
    return
}

async function setDatabaseImages(gameCode, roundNumber){
    await axios.get(getUniqueImageInRoundURL + gameCode + "," + roundNumber)
    return
}

async function getApiImages(userData){
    const imageURLs = await getApiImagesHelper(userData)
    return imageURLs
}

async function postRoundImage(gameCode, roundNumber, imageURL){
    const payload = {
        game_code: gameCode,
        round_number: roundNumber.toString(),
        image: imageURL
    }
    await axios.post(postRoundImageURL, payload)
    return
}

async function getDatabaseImage(userData){
    const imageURL = await axios.get(getImageURL + userData.gameCode + "," + userData.roundNumber)
        .then(response => response.data.image_url)
    return imageURL
}

async function submitCaption(caption, userData){
    const payload = {
        caption: caption,
        user_uid: userData.playerUID,
        game_code: userData.gameCode,
        round_number: userData.roundNumber.toString()
    }
    console.log("payload inside submitCaption:", payload);
    const numOfPlayersSubmitting = await axios.post(submitCaptionURL, payload)
        .then(response => response.data.no_caption_submitted)
    return numOfPlayersSubmitting
}

async function getSubmittedCaptions(userData) {
    const submittedCaptions = await axios.get(getAllSubmittedCaptionsURL + userData.gameCode + "," + userData.roundNumber)
        .then(response => response.data.players)
    return submittedCaptions
}

async function postVote(caption, userData){
    const payload = {
        caption: caption,
        user_id: userData.playerUID,
        game_code: userData.gameCode,
        round_number: userData.roundNumber.toString()
    }
    console.log("payload inside postVote:", payload);
    const numOfPlayersVoting = await axios.post(postVoteCaptionURL, payload)
        .then(response => response.data.players_count)
    return numOfPlayersVoting
}

async function updateScores(userData){
    await axios.get(getUpdateScoresURL + userData.gameCode + "," + userData.roundNumber)
    return
}

async function leftOverVotingPlayers(userData){
    const numOfPlayersVoting = await axios.get(getPlayersWhoHaventVotedURL + userData.gameCode + "," + userData.roundNumber)
        .then(response => response.data.players_count)
    return numOfPlayersVoting
}

async function getScoreBoard(userData){
    const scoreBoard = await axios.get(getScoreBoardURL + userData.gameCode + "," + userData.roundNumber)
        .then(response => response.data.scoreboard)
    return scoreBoard
}

async function createNextRound(userData){
    const payload = {
        game_code: userData.gameCode,
        round_number: userData.roundNumber.toString()
    }
    await axios.post(createNextRoundURL, payload)
    return
}

async function postCreateRounds(gameCode, imageURLs){
    const payload = {
        game_code: gameCode,
        images: imageURLs
    }
    const imageURL = await axios.post(createRounds, payload)
        .then(response => response.data.image)
    return imageURL
}

// old code without retry
// async function getNextImage(gameCode, roundNumber){
//     const payload = {
//         game_code: gameCode,
//         round_number: roundNumber.toString()
//     }
//     const imageURL = await axios.post(nextImage, payload)
//         .then(response => response.data.image)
//     return imageURL
// }

async function getNextImage(gameCode, roundNumber) {
    const payload = {
        game_code: gameCode,
        round_number: roundNumber.toString()
    };

    const maxRetries = 3;
    let retries = 0;
    let error;

    while (retries < maxRetries) {
        console.log("Trying API---->", retries , +" times");
        try {
            const response = await axios.post(nextImage, payload);
            return response.data.image;
        } catch (err) {
            // Capture the error 
            error = err;
            // Increment the retry count
            retries++;
        }
    }

    // trow error after retries exhaust
    throw error;
}


async function sendError(code1, code2){
    await axios.get(errorURL + code1 + "*" + code2).then(res => {console.log(res)})
    return
}
async function getGameScore(gameCode,roundNo){
    // const scoreboard = await axios.get(getgameScoreURL + '/' + gameCode + ',' + roundNo).then(response => {
    const scoreboard = await axios.get(getgameScoreURL + gameCode + ',' + roundNo).then(response => {
        return response.data.scoreboard
    })
    return scoreboard
}
async function addFeedback(userData, feedback) {
    const payload = {
        name: userData.name,
        email: userData.email,
        feedback: feedback
    }
    await axios.post(addFeedbackURL, payload)
}
async function summary(gameUID) {
    return await axios.get(`${summaryURL}?gameUID=${gameUID}`)
}

async function getCurrentRound(gameUID){
    return await axios.get(`${getCurrentRoundURL}?gameUID=${gameUID}`)
}
function summaryEmail(userData) {
    const payload = {
        gameUID: userData.gameUID,
        email: userData.email,
    }
    axios.post(summaryEmailURL, payload)
}
export { checkGameCode, checkEmailCode, addUser, createGame, addUserByEmail, summary,
    joinGame, getDecks, selectDeck, assignDeck, setDatabaseImages, addFeedback, summaryEmail,
    getApiImages, postRoundImage, getDatabaseImage, getPlayers, submitCaption,
    getSubmittedCaptions, postVote, updateScores, leftOverVotingPlayers, getScoreBoard,
    createNextRound, postCreateRounds, getNextImage, sendError,getCnnImageURLS ,checkGameStarted,getGameScore,getGameImageForRound, getCurrentRound}