import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "../util/config";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { ReactComponent as Polygon } from "../assets/Polygon 1.svg";
import { ReactComponent as CloseButton } from "../assets/close-button.svg";
import "../styles/GooglePhotos.css";

export default function GooglePhotos() {
  console.log("In GooglePhotos - All Photos (No Albums)");
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]);
  
  const [tokens, setTokens] = useState({});
  const [signedIn, setSignedIn] = useState(false);
  const [allPhotos, setAllPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  
  const clientID = REACT_APP_GOOGLE_CLIENT_ID;
  const clientSecret = REACT_APP_GOOGLE_CLIENT_SECRET;

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (response) => {
      console.log("🔐 Auth code received:", response);
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("📡 Exchanging auth code for tokens...");
        
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
          code: response.code,
          client_id: clientID,
          client_secret: clientSecret,
          redirect_uri: window.location.origin,
          grant_type: "authorization_code",
        });

        console.log("✅ OAuth tokens received");
        console.log("📋 Scopes granted:", tokenResponse.data.scope);
        
        setSignedIn(true);
        setTokens(tokenResponse.data);

        // Automatically fetch photos after successful login
        await fetchAllPhotos(tokenResponse.data.access_token);
        
      } catch (err) {
        console.error("❌ OAuth error:", err);
        console.error("❌ Error response:", err.response?.data);
        
        let errorMessage = "Failed to authenticate with Google Photos. ";
        
        if (err.response?.status === 400) {
          errorMessage += "Invalid request. Please check your configuration.";
        } else if (err.response?.status === 401) {
          errorMessage += "Invalid credentials.";
        } else if (err.response?.data?.error_description) {
          errorMessage += err.response.data.error_description;
        } else {
          errorMessage += "Please try again.";
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("❌ Login failed:", error);
      setError(`Failed to sign in with Google: ${error?.error || "Unknown error"}`);
    },
    scope: "https://www.googleapis.com/auth/photoslibrary.readonly",
  });

  const fetchAllPhotos = async (accessToken) => {
    setLoadingPhotos(true);
    setError(null);
    
    try {
      console.log("📸 Fetching all photos from Google Photos Library...");
      
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      // Fetch recent photos (no album required)
      const response = await axios.post(
        "https://photoslibrary.googleapis.com/v1/mediaItems:search",
        {
          pageSize: 100, // Get up to 100 photos
          filters: {
            mediaTypeFilter: {
              mediaTypes: ["PHOTO"] // Only photos, no videos
            }
          }
        },
        { headers }
      );

      if (response.data.mediaItems && response.data.mediaItems.length > 0) {
        // Get high-resolution URLs
        let imageUrls = response.data.mediaItems.map((picture) => {
          return picture.baseUrl + "=w2048-h2048";
        });
        
        setAllPhotos(imageUrls);
        console.log(`✅ Loaded ${imageUrls.length} photos`);
      } else {
        setError("No photos found in your Google Photos library.");
        setAllPhotos([]);
      }
    } catch (err) {
      console.error("❌ Error fetching photos:", err);
      console.error("❌ Error response:", err.response?.data);
      
      if (err.response?.status === 403) {
        setError("Permission denied. Please make sure you granted access to your Google Photos library.");
      } else {
        setError("Failed to load photos. Please try again.");
      }
      
      setAllPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const submitPhotos = async () => {
    if (allPhotos.length <= userData.numOfRounds) {
      alert(
        `You need at least ${userData.numOfRounds} photos for your game.\n\n` +
        `Currently loaded: ${allPhotos.length} photo(s)\n\n` +
        `Please make sure you have enough photos in your Google Photos library.`
      );
      return;
    }
    
    const updatedUserData = {
      ...userData,
      deckSelected: true,
      isApi: true,
      deckTitle: "Google Photos",
      deckUID: "500-000005",
      googlePhotos: allPhotos,
    };
    
    console.log("✅ Navigating to WaitingRoom with Google Photos");
    navigate("/WaitingRoom", { state: updatedUserData });
  };

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        minHeight: "100vh",
        background: "#C8DAD8",
        padding: "2rem",
        paddingBottom: "1rem",
      }}
    >
      <Container>
        <Row className="text-center">
          <Col>
            <CloseButton
              onClick={() => navigate("/SelectDeck", { state: userData })}
              style={{ position: "absolute", right: 5, top: 5, cursor: "pointer" }}
            />
          </Col>
        </Row>

        <Row className="text-center mb-4">
          <Col style={{ position: "relative" }}>
            <Polygon style={{ position: "absolute", bottom: "-32px", right: "80px" }} />
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
                marginTop: "32px",
                border: "none",
                outline: "none",
                textAlign: "center",
              }}
              value="Google Photos"
              readOnly
            />
          </Col>
        </Row>

        {error && (
          <Row className="text-center mb-3">
            <Col>
              <Alert variant="danger" style={{ fontFamily: "Grandstander", maxWidth: "500px", margin: "0 auto" }}>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        <Row className="text-center mb-4" style={{ marginTop: "64px" }}>
          <Col>
            {!signedIn ? (
              <div>
                <p style={{ fontFamily: "Grandstander", fontSize: "18px", marginBottom: "1.5rem", color: "#333" }}>
                  Sign in to access your photos from Google Photos
                </p>
                <Button
                  className="selectedGooglePhotos"
                  onClick={() => login()}
                  disabled={isLoading}
                  style={{
                    width: 300,
                    height: 50,
                    background: "#DC816A",
                    borderRadius: 30,
                    fontSize: 20,
                    fontFamily: "Grandstander",
                    fontWeight: "700",
                    border: "none",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        style={{ marginRight: "8px" }}
                      />
                      Loading...
                    </>
                  ) : (
                    "Log In to Google Photos"
                  )}
                </Button>
              </div>
            ) : (
              <div>
                {loadingPhotos && (
                  <div style={{ marginBottom: "1rem" }}>
                    <Spinner animation="border" role="status" />
                    <p style={{ fontFamily: "Grandstander", fontSize: "14px", color: "#666", marginTop: "0.5rem" }}>
                      Loading your photos...
                    </p>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>

        {allPhotos.length > 0 && (
          <>
            <Row className="text-center mb-3">
              <Col>
                <p style={{ fontFamily: "Grandstander", fontSize: "20px", fontWeight: "600", color: "#333" }}>
                  {allPhotos.length} photo(s) from your library
                  <br />
                  <small style={{ fontSize: "16px", fontWeight: "400", color: "#666" }}>
                    (Need at least {userData.numOfRounds} for your game)
                  </small>
                </p>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col>
                <div style={{ 
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "0.5rem",
                  maxHeight: "400px", 
                  overflowY: "auto", 
                  padding: "1rem",
                  background: "white",
                  borderRadius: "10px",
                  maxWidth: "600px",
                  margin: "0 auto"
                }}>
                  {allPhotos.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Photo ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "5px",
                        border: "2px solid #46C3A6",
                      }}
                      onError={(e) => {
                        console.error("❌ Image failed to load:", url);
                        e.target.style.border = "2px solid red";
                      }}
                    />
                  ))}
                </div>
              </Col>
            </Row>

            <Row className="text-center">
              <Col>
                <Button
                  className="selectedGooglePhotos"
                  onClick={submitPhotos}
                  disabled={allPhotos.length < userData.numOfRounds}
                  style={{
                    width: 300,
                    height: 50,
                    background: allPhotos.length >= userData.numOfRounds ? "#71CAA3" : "#ccc",
                    borderRadius: 30,
                    fontSize: 20,
                    fontFamily: "Grandstander",
                    fontWeight: "600",
                    border: "none",
                    cursor: allPhotos.length >= userData.numOfRounds ? "pointer" : "not-allowed",
                  }}
                >
                  Continue with Photos ({allPhotos.length} loaded)
                </Button>
              </Col>
            </Row>
          </>
        )}

        <Row className="text-center mt-4">
          <Col>
            <Button
              variant="link"
              onClick={() => navigate("/SelectDeck", { state: userData })}
              style={{
                fontFamily: "Grandstander",
                color: "#666",
                textDecoration: "underline",
              }}
            >
              ← Back to Deck Selection
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}