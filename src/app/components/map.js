"use client";

import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { db, database } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { ref, onValue } from "firebase/database";

const containerStyle = {
  width: "100%",
  height: "540px",
};

const getFillColor = (fill) => {
  if (
    fill.distance <= 25 ||
    fill.airQuality > 3000 ||
    !(
      fill.accz <= -8 &&
      (fill.accx < 3 || fill.accx > -3) &&
      (fill.accy < 3 || fill.accY > -3)
    )
  )
    return "red";
  if (fill.distance <= 40) return "yellow";
  return "green";
};

const Map = () => {
  const [googleReady, setGoogleReady] = useState(false);
  const [dustbins, setDustbins] = useState([]);
  const [center, setCenter] = useState({ lat: 31.3959, lng: 75.5358 });
  const [pathCoordinates, setPathCoordinates] = useState([]);
  const [route, setRoute] = useState(null); // State to store the path from Directions API

  // Fetch Dustbin Locations from Firestore
  useEffect(() => {
    const fetchDustbin = async () => {
      const dustbinRef = collection(db, "sensorData");
      const snapshot = await getDocs(dustbinRef);

      const dustbinData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDustbins(dustbinData);

      // Set center to the first dustbin's position if available
      if (dustbinData.length > 0) {
        setCenter(dustbinData[0].location);
      }

      console.log("Fetched Firestore Data:", dustbinData);
      setupRealTimeListeners(dustbinData);

      // Collect all dustbin locations to calculate a path
      const coordinates = dustbinData
        .filter((dustbin) => dustbin.location)
        .map((dustbin) => ({
          lat: dustbin.location.lat,
          lng: dustbin.location.lng,
        }));

      setPathCoordinates(coordinates);
      if (coordinates.length > 1) {
        calculateRoute(coordinates);
      }
    };

    fetchDustbin();
  }, []);

  // Setup real-time Firebase listeners
  const setupRealTimeListeners = (initialDustbins) => {
    const unsubscribers = [];

    initialDustbins.forEach((dustbin, index) => {
      const sensorRef = ref(database, `/${dustbin.sensorName}`);

      const unsubscribe = onValue(sensorRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Real-time Data:", data);

          setDustbins((prevDustbins) => {
            const updatedDustbins = prevDustbins.map((d, i) =>
              i === index
                ? {
                    ...d,
                    distance: data.distance || "No Data",
                    aqi: data.airQuality || "No Data",
                    accx: data.accX || "No Data",
                    accy: data.accY || "No Data",
                    accz: data.accZ || "No Data",
                  }
                : d
            );

            console.log(
              "Updated Dustbins with Real-time Data:",
              updatedDustbins
            );
            return updatedDustbins;
          });
        } else {
          console.log("No data found");
        }
      });

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  };

  // Calculate route using Directions API
  const calculateRoute = (coordinates) => {
    const directionsService = new window.google.maps.DirectionsService();

    const request = {
      origin: coordinates[0],
      destination: coordinates[coordinates.length - 1], // Use last coordinate as destination
      waypoints: coordinates.slice(1, -1).map((coord) => ({
        location: coord,
        stopover: true,
      })),
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setRoute(result.routes[0].overview_path); // Store the path
      } else {
        console.error("Directions request failed due to " + status);
      }
    });
  };

  useEffect(() => {
    if (window.google) {
      setGoogleReady(true);
    }
  }, []);

  return (
    <LoadScript
      googleMapsApiKey={`${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
      onLoad={() => setGoogleReady(true)}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16}
        options={{
          tilt: 30,
        }}
      >
        {/* Render Dustbins */}
        {googleReady &&
          dustbins.map((dustbin) => {
            console.log("Dustbin Data: ", dustbin);

            const lat = dustbin.location?.lat;
            const lng = dustbin.location?.lng;

            if (typeof lat !== "number" || typeof lng !== "number") {
              console.error(
                `Invalid location for dustbin ${dustbin.id}:`,
                dustbin.location
              );
              return null;
            }

            return (
              <Marker
                key={dustbin.id}
                position={{ lat, lng }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: getFillColor(dustbin),
                  fillOpacity: 1,
                  strokeWeight: 1,
                }}
                title={`Dustbin ${dustbin.sensorName} - Fill: ${
                  ((dustbin?.sensorSize * 100 - dustbin.distance) /
                    dustbin.sensorSize) *
                    100 || 0
                } %`}
                zIndex={50}
              />
            );
          })}

        {/* Render Polyline for the calculated path */}
        {route && (
          <Polyline
            path={route}
            options={{
              strokeColor: "#2D68C4", // Line color
              strokeOpacity: 2,
              strokeWeight: 4,
              geodesic: true, // Use geodesic line
            }}
          />
        )}

        {/* Render Direction Arrows */}
        {route &&
          route.map((latLng, index) => {
            if (index % 2 == 0) return null;
            if (index < route.length - 1) {
              const nextLatLng = route[index + 1];
              const heading = google.maps.geometry.spherical.computeHeading(
                latLng,
                nextLatLng
              );

              return (
                <Marker
                  key={index}
                  position={latLng}
                  icon={{
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 2,
                    strokeColor: "#FF0000", // Arrow color
                    rotation: heading,
                  }}
                />
              );
            }
            return null;
          })}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
