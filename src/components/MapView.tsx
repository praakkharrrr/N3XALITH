"use client";

import { useEffect, useRef, useState } from "react";
import type { ParcelFeature } from "@/lib/types";
import { LAND_USE_COLORS } from "@/lib/colors";

type Props = {
  parcels: ParcelFeature[];
  selectedParcelId?: number | null;
  onSelectParcel: (parcel: ParcelFeature) => void;
  className?: string;
};

export function MapView({ parcels, selectedParcelId, onSelectParcel, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").GeoJSON | null>(null);
  const onSelectRef = useRef(onSelectParcel);
  onSelectRef.current = onSelectParcel;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([26.8674, 81.016], 17);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 20,
      }).addTo(map);

      mapRef.current = map;
      setReady(true);
    };
    void setup();
    return () => {
      cancelled = true;
      setReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || parcels.length === 0) return;
    let disposed = false;
    const draw = async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !mapRef.current) return;
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      const fc: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: parcels.map((p) => ({
          type: "Feature" as const,
          properties: {
            id: p.id,
            name: p.name,
            parcelCode: p.parcelCode,
            landUse: p.landUse,
            ulpin: p.ulpin,
            buildingCount: p.buildingCount,
            address: p.address,
          },
          geometry: p.geojson,
        })),
      };
      const layer = L.geoJSON(fc, {
        style: (feature) => {
          const id = feature?.properties?.id as number;
          const landUse = String(feature?.properties?.landUse ?? "vacant");
          const selected = id === selectedParcelId;
          const color = LAND_USE_COLORS[landUse] ?? "#64748b";
          return {
            color,
            weight: selected ? 4 : 1.5,
            fillColor: color,
            fillOpacity: selected ? 0.55 : 0.28,
          };
        },
        onEachFeature: (feature, lyr) => {
          const p = feature.properties as {
            id: number;
            name: string;
            parcelCode: string;
            ulpin: string;
            landUse: string;
            buildingCount: number;
          };
          lyr.bindPopup(
            `<div style="min-width:180px">
              <div style="font-size:11px;letter-spacing:.12em;color:#5eead4">PARCEL ${p.parcelCode}</div>
              <div style="font-weight:600;margin:4px 0">${p.name}</div>
              <div style="font-family:monospace;font-size:11px;color:#fcd34d">${p.ulpin}</div>
              <div style="margin-top:6px;font-size:12px;color:#cbd5e1">${p.landUse} · ${p.buildingCount} building(s)</div>
            </div>`,
          );
          lyr.on("click", () => {
            const parcel = parcels.find((x) => x.id === p.id);
            if (parcel) onSelectRef.current(parcel);
          });
        },
      }).addTo(map);
      layerRef.current = layer;
      parcels.forEach((p) => {
        if (p.buildingCount > 0) {
          L.circleMarker([p.latitude, p.longitude], {
            radius: 5,
            color: "#e8f1fb",
            weight: 1,
            fillColor: LAND_USE_COLORS[p.landUse] ?? "#2dd4bf",
            fillOpacity: 0.95,
          })
            .addTo(layer)
            .bindTooltip(p.name, { direction: "top" });
        }
      });
      if (selectedParcelId) {
        const sel = parcels.find((p) => p.id === selectedParcelId);
        if (sel) map.panTo([sel.latitude, sel.longitude]);
      } else {
        try {
          map.fitBounds(layer.getBounds().pad(0.15));
        } catch {
          map.setView([26.8674, 81.016], 17);
        }
      }
    };
    void draw();
    return () => {
      disposed = true;
    };
  }, [parcels, selectedParcelId, ready]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} />;
}
