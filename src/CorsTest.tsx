import { useState, useEffect } from "react";

const CorsTest = () => {
  const [corsResult, setCorsResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const testCors = async () => {
      try {
        /* console.log("Testing CORS with API URL:", apiUrl); */
        const response = await fetch(`${apiUrl}/cors-test`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        /* console.log("CORS test result:", data); */
        setCorsResult(JSON.stringify(data, null, 2));
      } catch (err) {
        console.error("CORS test error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    testCors();
  }, [apiUrl]);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>CORS Test</h1>
      <p>API URL: {apiUrl}</p>

      {corsResult ? (
        <div>
          <h2>Success! CORS is working</h2>
          <pre
            style={{
              background: "#f0f0f0",
              padding: "10px",
              borderRadius: "4px",
              overflow: "auto",
            }}
          >
            {corsResult}
          </pre>
        </div>
      ) : error ? (
        <div>
          <h2>CORS Error</h2>
          <p style={{ color: "red" }}>{error}</p>
          <p>
            This indicates a CORS issue. Make sure your backend CORS settings
            allow requests from your frontend origin.
          </p>
        </div>
      ) : (
        <p>Testing CORS configuration...</p>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>Debugging Tips</h3>
        <ul>
          <li>Check browser console for CORS errors</li>
          <li>Verify that your backend allows your frontend origin</li>
          <li>Check that VITE_API_URL is set correctly in your .env file</li>
          <li>Make sure your backend is running at {apiUrl}</li>
        </ul>
      </div>
    </div>
  );
};

export default CorsTest;
