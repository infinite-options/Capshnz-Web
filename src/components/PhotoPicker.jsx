import { useEffect, useState } from 'react';

/* global google */

const PhotoPicker = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugInfo = (message) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const handlePhotoPicker = async () => {
      // Extract sessionId from URL
      const urlParams = new URLSearchParams(window.location.search);
      const sessionIdParam = urlParams.get('sessionId');
      
      if (!sessionIdParam) {
        setError('No sessionId provided');
        setLoading(false);
        return;
      }
      
      setSessionId(sessionIdParam);

      try {
        // Step 1: Load Google API scripts
        await loadGoogleScripts();
        
        // Step 2: Get access token from backend using sessionId
        const tokenUrl = `https://bmarz6chil.execute-api.us-west-1.amazonaws.com/dev/api/oauth/token/${sessionIdParam}`;
        addDebugInfo(`🔍 Fetching token for sessionId: ${sessionIdParam}`);
        addDebugInfo(`🌐 Full token URL: ${tokenUrl}`);
        
        const tokenResponse = await fetch(tokenUrl);
        
        addDebugInfo(`📡 Token response status: ${tokenResponse.status}`);
        addDebugInfo(`📡 Token response URL: ${tokenResponse.url}`);
        
        if (!tokenResponse.ok) {
          addDebugInfo(`❌ HTTP Error: ${tokenResponse.status} ${tokenResponse.statusText}`);
          setError(`HTTP Error: ${tokenResponse.status} ${tokenResponse.statusText}`);
          setLoading(false);
          return;
        }
        
        const tokenData = await tokenResponse.json();
        addDebugInfo(`📦 Raw token data received: ${JSON.stringify(tokenData, null, 2)}`);
        
        // Check response structure
        addDebugInfo(`🔍 tokenData.success: ${tokenData.success}`);
        addDebugInfo(`🔍 tokenData.tokens: ${JSON.stringify(tokenData.tokens)}`);
        addDebugInfo(`🔍 tokenData.tokens?.access_token: ${tokenData.tokens?.access_token}`);
        
        if (!tokenData.success || !tokenData.tokens || !tokenData.tokens.access_token) {
          addDebugInfo('❌ Token validation failed');
          addDebugInfo(`❌ Success check: ${tokenData.success}`);
          addDebugInfo(`❌ Tokens object check: ${!!tokenData.tokens}`);
          addDebugInfo(`❌ Access token check: ${!!tokenData.tokens?.access_token}`);
          
          // Check if it's a "Session not found" error
          if (tokenData.error === 'Session not found') {
            setError(`Session not found. SessionId: ${sessionIdParam}. Make sure you're using a valid sessionId from the OAuth flow.`);
          } else {
            setError(`Failed to get access token. Debug: success=${tokenData.success}, hasTokens=${!!tokenData.tokens}, hasAccessToken=${!!tokenData.tokens?.access_token}`);
          }
          setLoading(false);
          return;
        }
        
        addDebugInfo('✅ Token validation passed');

        // Step 3: Load Google Picker
        console.log('🔄 Loading Google Picker...');
        await loadGooglePicker();
        console.log('✅ Google Picker loaded');
        
        // Step 4: Create and show picker
        console.log('🎯 Creating picker with access token:', tokenData.tokens.access_token.substring(0, 20) + '...');
        createPicker(tokenData.tokens.access_token, sessionIdParam, tokenData);
        
      } catch (err) {
        setError('Failed to initialize photo picker: ' + err.message);
        setLoading(false);
      }
    };

    handlePhotoPicker();
  }, []);

  const loadGoogleScripts = () => {
    return new Promise((resolve) => {
      console.log('🔄 Loading Google API scripts...');
      if (window.gapi && window.gapi.load) {
        console.log('✅ Google API already loaded');
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        console.log('📜 Google API script loaded, waiting for gapi...');
        const checkGapi = () => {
          if (window.gapi && window.gapi.load) {
            console.log('✅ Google API (gapi) ready');
            resolve();
          } else {
            setTimeout(checkGapi, 100);
          }
        };
        checkGapi();
      };
      script.onerror = (err) => {
        console.error('❌ Failed to load Google API script:', err);
      };
      document.head.appendChild(script);
    });
  };

  const loadGooglePicker = () => {
    return new Promise((resolve, reject) => {
      window.gapi.load('picker', {
        callback: resolve,
        onerror: reject,
      });
    });
  };

  const createPicker = (accessToken, sessionId, tokenData) => {
    console.log('🎨 Creating Google Picker...');
        console.log('🔑 Using API Key:', process.env.REACT_APP_GOOGLE_API_KEY ? 'Set' : 'NOT SET');
        console.log('🔑 API Key value:', process.env.REACT_APP_GOOGLE_API_KEY);
        console.log('🔑 Access Token (first 20 chars):', accessToken.substring(0, 20));
        console.log('🔑 Token Scopes:', tokenData.tokens.scope);
        console.log('🔑 Token Type:', tokenData.tokens.token_type);
        console.log('🔑 Expires In:', tokenData.tokens.expires_in);
        console.log('🔑 Full Access Token:', accessToken);
    
    const pickerCallback = (data) => {
      console.log('📸 Picker callback triggered:', data);
      if (data.action === google.picker.Action.PICKED) {
        console.log('✅ Photos picked!');
        const docs = data[google.picker.Response.DOCUMENTS];
        console.log('📷 Selected documents:', docs);
        const selected = docs.map(doc => ({
          id: doc.id,
          name: doc.name,
          url: doc.url,
          thumbnail: doc.thumbnails?.[0]?.url || null,
        }));
        console.log('📦 Processed selection:', selected);

        // Send selected photos to backend
        console.log('📤 Sending selection to backend...');
        fetch('https://bmarz6chil.execute-api.us-west-1.amazonaws.com/dev/api/picker/selection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, selection: selected }),
        })
        .then(() => {
          console.log('✅ Selection saved to backend');
          // Redirect to mobile app
          const deepLink = `googleapidemo://photos/selection?sessionId=${encodeURIComponent(sessionId)}`;
          console.log('🔗 Redirecting to:', deepLink);
          window.location.href = deepLink;
        })
        .catch(err => {
          console.error('❌ Failed to save selection:', err);
          setError('Failed to save photo selection: ' + err.message);
        });
      } else {
        console.log('❌ Picker action:', data.action);
      }
    };

    try {
      const picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.PHOTOS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(process.env.REACT_APP_GOOGLE_API_KEY)
        .setCallback(pickerCallback)
        .build();
      
      console.log('✅ Picker built successfully');
      picker.setVisible(true);
      console.log('👁️ Picker made visible');
      setLoading(false);
    } catch (err) {
      console.error('❌ Failed to create picker:', err);
      setError('Failed to create Google Picker: ' + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading Google Photo Picker...</p>
        {debugInfo.length > 0 && (
          <div style={{ marginTop: '20px', textAlign: 'left', fontSize: '12px', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
            <h4>Debug Info:</h4>
            {debugInfo.map((info, index) => (
              <div key={index} style={{ marginBottom: '5px', fontFamily: 'monospace' }}>{info}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <p style={{ color: 'gray', fontSize: '12px', marginTop: '10px' }}>
          Error occurred at: {new Date().toLocaleString()}
        </p>
        <p style={{ color: 'gray', fontSize: '10px', marginTop: '5px' }}>
          SessionId: {sessionId || 'Not available'}
        </p>
        <p style={{ color: 'gray', fontSize: '10px', marginTop: '5px' }}>
          Check browser console for detailed logs
        </p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Google Photo Picker is loading...</p>
    </div>
  );
};

export default PhotoPicker;
