import React from "react";

function App() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        textAlign: "center",
        maxWidth: "600px"
      }}>
        <h1 style={{
          color: "#1e40af",
          marginBottom: "1rem",
          fontSize: "2.5rem"
        }}>
          🏦 Banking Platform
        </h1>
        <p style={{
          color: "#64748b",
          fontSize: "1.2rem",
          marginBottom: "2rem"
        }}>
          Enterprise-Grade Cloud-Native Banking Application
        </p>
        
        <div style={{
          background: "#f1f5f9",
          padding: "1.5rem",
          borderRadius: "6px",
          marginBottom: "2rem",
          textAlign: "left"
        }}>
          <h3 style={{ color: "#334155", marginBottom: "1rem" }}>🎯 Demo Features:</h3>
          <ul style={{ color: "#64748b", lineHeight: "1.8" }}>
            <li>✅ Secure Authentication & Authorization</li>
            <li>✅ Account Management & Balance Tracking</li>
            <li>✅ Real-time Money Transfers</li>
            <li>✅ Transaction History & Audit Trails</li>
            <li>✅ Professional Banking UI/UX</li>
            <li>✅ RESTful API Architecture</li>
          </ul>
        </div>

        <div style={{
          background: "#dbeafe",
          padding: "1rem",
          borderRadius: "6px",
          marginBottom: "1rem"
        }}>
          <h4 style={{ color: "#1e40af", margin: "0 0 0.5rem 0" }}>🔑 Demo Credentials</h4>
          <p style={{ color: "#1e40af", margin: "0" }}>
            Email: demo@bankingplatform.com<br/>
            Password: Demo123!
          </p>
        </div>

        <div style={{
          background: "#ecfdf5",
          padding: "1rem",
          borderRadius: "6px"
        }}>
          <h4 style={{ color: "#059669", margin: "0 0 0.5rem 0" }}>🛠️ Technology Stack</h4>
          <p style={{ color: "#059669", margin: "0", fontSize: "0.9rem" }}>
            .NET Core 8 • React TypeScript • Azure • Kubernetes • Docker • JWT • MySQL
          </p>
        </div>
      </div>
      
      <div style={{
        marginTop: "2rem",
        textAlign: "center"
      }}>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          🌐 <strong>Live API Documentation:</strong> <br/>
          <a href="/swagger" style={{ color: "#1e40af" }}>View Swagger API Docs</a>
        </p>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          💻 <strong>Source Code:</strong> <br/>
          <a href="https://github.com/ashishserco/banking-platform" target="_blank" rel="noopener noreferrer" style={{ color: "#1e40af" }}>
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;