import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LeafletMap = ({ receiveCoords }) => {
  useEffect(() => {
    const map = L.map("map").setView([36.8065, 10.1815], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.on("click", function (e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      if (typeof receiveCoords === "function") {
        receiveCoords(lat, lng);
      } else {
        console.log("Clicked coordinates:", lat, lng);
      }
    });

    // Cleanup on unmount
    return () => map.remove();
  }, [receiveCoords]);

  return (
    <div id="map" style={{ height: "100vh", width: "100vw", margin: 0 }} />
  );
};

export default LeafletMap;
