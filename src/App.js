import "./App.css";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function App() {
  const [alerts, setAlerts] = useState([]); // Lista över trafikvarningar.
  const [transportMode, setTransportMode] = useState(""); // Vald transporttyp, t.ex. buss eller tåg.
  const [lineNumber, setLineNumber] = useState(""); // Vald linjenummer för att filtrera varningar.
  const [trafficStatus, setTrafficStatus] = useState([]); // Lista över trafikstatus för olika linjer.

  // statusmeddelanden till svenska beskrivningar.
  const statusMessages = {
    EventGood: "Inga störningar",
    EventMinor: "Mindre störningar",
    EventPlanned: "Större störningar",
    // Lägg till fler om du hittar
  };

  // Funktion för att hämta trafikvarningar baserat på valda filter.
  const fetchData = useCallback(async () => {
    setAlerts([]);
    const params = {
      transportMode,
      lineNumber,
    };
    try {
      const response = await axios.get("https://sl-sandbox-ace39d1f7a48.herokuapp.com/service-alerts", {
        params,
      });
      // Kontrollera om vi fick tillbaka en lista från API:et.
      if (Array.isArray(response.data.ResponseData)) {
        setAlerts(response.data.ResponseData);
      } else {
        console.error("Oväntat format mottaget från API:", response.data);
      }
    } catch (error) {
      console.error("Fel vid hämtning av servicevarningar:", error);
    }
  }, [transportMode, lineNumber]);

  // Funktion för att hämta övergripande trafikstatus.
  const fetchTrafficStatus = useCallback(async () => {
    try {
      const response = await axios.get("https://sl-sandbox-ace39d1f7a48.herokuapp.com/traffic-status");
      // Kontrollera om vi fick tillbaka en lista med trafiktyper från API:et.
      if (Array.isArray(response.data.ResponseData.TrafficTypes)) {
        setTrafficStatus(response.data.ResponseData.TrafficTypes);
      } else {
        console.error(
          "Oväntat format mottaget från Trafik Status API:",
          response.data
        );
      }
    } catch (error) {
      console.error("Fel vid hämtning av trafikstatus:", error);
    }
  }, []);

  // Vid första renderingen, hämta både trafikvarningar och trafikstatus.
  useEffect(() => {
    fetchData();
    fetchTrafficStatus();
  }, [fetchData, fetchTrafficStatus]);

  return (
    // Huvudlayout för applikationen.
    <div className="app-container">
      <div className="side-panel">
        <div className="filters">
          <select
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
          >
            <option value="">Välj Transportmedel</option>
            <option value="bus">Buss</option>
            <option value="train">Tåg</option>
            <option value="tram">Spårvagn</option>
            <option value="metro">Tunnelbana</option>
          </select>
          <input
            type="text"
            placeholder="Linjenummer"
            onChange={(e) => setLineNumber(e.target.value)}
          />
          <button onClick={fetchData}>Tillämpa Filter</button>
        </div>
        <div className="traffic-status-window">
          <h1>SL Trafikstatus</h1>
          {trafficStatus &&
            trafficStatus.length > 0 &&
            trafficStatus.map((status) => (
              <div className="status" key={status.Id}>
                <div className="status-content">
                  <div className="left-side">
                    <img
                      src={`/icons/${status.Type}.svg`}
                      alt={status.Name}
                      width="24px"
                      height="24px"
                    />
                    <span>{status.TrafficLine || status.Name}</span>
                  </div>
                  <img
                    src={`/icons/${status.StatusIcon}.svg`}
                    alt={status.StatusIcon}
                    width="24px"
                    height="24px"
                    className="status-icon"
                  />
                  <div className="right-side">
                    <span>{statusMessages[status.StatusIcon]}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="teletext-window">
        <h1>SL Trafikinformation</h1>
        {alerts &&
          alerts.length > 0 &&
          alerts.map((alert) => (
            <div key={alert.DevCaseGid}>
              <h2>{alert.Header}</h2>
              <p>{alert.Details}</p>
              <hr />
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
