import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "../util/config";
import "../styles/GooglePhotos.css";
import { Button } from "react-bootstrap";

export default function GooglePhotos() {
  console.log("In GooglePhotos");
  const navigate = useNavigate(),
    location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]);
  const [tokens, setTokens] = useState({});
  const [albums, setAlbums] = useState([]);
  const [signedIn, setSignedIn] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [albumImages, setAlbumImages] = useState([]);
  const searchGooglePhotosURL = "https://photoslibrary.googleapis.com/v1/mediaItems:search";
  const clientID = "336598290180-69pe1qeuqku450vnoi8v1ehhi19jhpmt.apps.googleusercontent.com";
  const clientSecret = "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";

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (response) => {
      axios
        .post("https://oauth2.googleapis.com/token", {
          code: response.code,
          client_id: clientID,
          client_secret: clientSecret,
          redirect_uri: window.location.origin,
          grant_type: "authorization_code",
        })
        .then((res) => {
          setSignedIn(true);
          setTokens(res.data);

          const headers = {
            Accept: "application/json",
            Authorization: "Bearer " + res.data.access_token,
          };

          axios
            .get("https://photoslibrary.googleapis.com/v1/sharedAlbums", { headers })
            .then((resAlbums) => {
              setAlbums(resAlbums.data.sharedAlbums);
            })
            .catch((err) => {
              console.error("Failed to load shared albums:", err);
            });
        });
    },
    onFailure: (response) => console.log(response),
    scope: "https://www.googleapis.com/auth/photoslibrary.readonly",
  });

  const chooseAlbums = () => {
    if (albums !== null) {
      return albums.map((entry, index) => {
        return (
          <div key={index}>
            <Button
              className={selectedAlbum === entry.title ? "selectedGooglePhotos" : "buttonGooglePhotos"}
              onClick={() => {
                setSelectedAlbum(entry.title);
                getPhotos(entry, tokens.access_token);
              }}
            >
              {entry.title}
            </Button>
            <br />
          </div>
        );
      });
    }
  };

  function getPhotos(entry, accessToken) {
    if (!accessToken) {
      alert("Access token missing. Please log in again.");
      return;
    }

    setUserData({
      ...userData,
      googlePhotos: {
        albumId: entry.id,
        accessToken: accessToken,
      },
    });

    const body = {
      pageSize: "50",
      albumId: entry.id,
    };

    const headers = {
      Accept: "application/json",
      Authorization: "Bearer " + accessToken,
    };

    axios
      .post(searchGooglePhotosURL, body, { headers: headers })
      .then((res) => {
        let imageUrls = res.data.mediaItems.map((picture) => {
          return picture.baseUrl;
        });
        setAlbumImages(imageUrls);
      })
      .catch((err) => {
        console.error("Google Photos fetch error:", err.response || err);
        alert("Failed to load photos. Please check Google account access.");
      });
  }

  const submitAlbum = async () => {
    if (albumImages.length < userData.numOfRounds) {
      alert(
        "Please select an album with enough images for each round." +
          "\n" +
          "Total Images: " +
          albumImages.length +
          "\n" +
          "Total Rounds: " +
          userData.numOfRounds
      );
      return;
    }
    const updatedUserData = {
      ...userData,
      deckSelected: true,
      isApi: true,
      deckTitle: "Google Photos",
      deckUID: "500-000005",
      googlePhotos: albumImages,
    };
    console.log("Navigating to WaitingRoom from GooglePhotos");
    navigate("/WaitingRoom", { state: updatedUserData });
  };

  return (
    <div className='googlephotos'>
      <br></br>
      <div className='headerGooglePhotos'>
        {signedIn ? (
          <div>
            <h4>{"Select shared album as a deck"}</h4>
            <br />
          </div>
        ) : (
          <div>
            <h4>Sign in to play with an album</h4>
            <br />
            <Button className='selectedGooglePhotos' onClick={() => login()}>
              Log In to Google Photos
            </Button>
          </div>
        )}
      </div>
      <div className='headerGooglePhotos'>{chooseAlbums()}</div>
      <div className='containerGooglePhotos'>
        {albumImages.map((url, index) => {
          return <img key={index} className='imageGooglePhotos' src={url}></img>;
        })}
      </div>
      <br />
      {selectedAlbum === "" ? (
        ""
      ) : (
        <div>
          <Button className='selectedGooglePhotos' onClick={submitAlbum}>
            Continue
          </Button>
          <br />
        </div>
      )}
    </div>
  );
}
