import { useEffect, useId, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Search, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "leaflet/dist/leaflet.css";

export interface DestinationPoint {
  lat: number;
  lng: number;
  neighborhood: string;
  confirmed: boolean;
  query: string;
}
// Pilot search index: approximate area centres only, never delivery addresses.
// Replace with a contracted geocoder for broader coverage and street search.
const areas = [
  { name: "Akwa", city: "Douala", lat: 4.051, lng: 9.703 },
  { name: "Bonapriso", city: "Douala", lat: 4.025, lng: 9.705 },
  { name: "Bonanjo", city: "Douala", lat: 4.043, lng: 9.689 },
  { name: "Bali", city: "Douala", lat: 4.039, lng: 9.706 },
  { name: "Deido", city: "Douala", lat: 4.074, lng: 9.713 },
  { name: "Bonamoussadi", city: "Douala", lat: 4.099, lng: 9.742 },
  { name: "Makepe", city: "Douala", lat: 4.093, lng: 9.754 },
  { name: "Bepanda", city: "Douala", lat: 4.069, lng: 9.737 },
  { name: "Bastos", city: "Yaoundé", lat: 3.897, lng: 11.51 },
  { name: "Mvan", city: "Yaoundé", lat: 3.817, lng: 11.52 },
  { name: "Mendong", city: "Yaoundé", lat: 3.826, lng: 11.463 },
  { name: "Essos", city: "Yaoundé", lat: 3.881, lng: 11.546 },
];
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
function MapInteraction({
  value,
  onChange,
  center,
}: {
  value: DestinationPoint | null;
  onChange: (p: DestinationPoint) => void;
  center: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [map, center]);
  useMapEvents({
    click: (e) =>
      onChange({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        neighborhood: value?.neighborhood ?? "",
        query: value?.query ?? "",
        confirmed: false,
      }),
  });
  return (
    value && (
      <CircleMarker
        center={[value.lat, value.lng]}
        radius={11}
        pathOptions={{
          color: "#121317",
          fillColor: "#CAF76F",
          fillOpacity: 1,
          weight: 3,
        }}
      />
    )
  );
}
export function DestinationPicker({
  value,
  onChange,
}: {
  value: DestinationPoint | null;
  onChange: (p: DestinationPoint) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState(value?.query ?? "");
  const [center, setCenter] = useState<[number, number]>(
    value ? [value.lat, value.lng] : [4.051, 9.703],
  );
  const matches =
    query.trim().length >= 2
      ? areas
          .filter((a) =>
            normalize(`${a.name} ${a.city}`).includes(normalize(query)),
          )
          .slice(0, 6)
      : [];
  const [tilesFailed, setTilesFailed] = useState(false);
  return (
    <fieldset className="flex flex-col gap-3 min-w-0">
      <legend className="text-sm font-semibold mb-2">
        Position exacte
      </legend>
      <label htmlFor={id} className="text-xs text-muted-foreground">
        Commencez par le quartier ou la ville
      </label>
      <div className="flex items-center gap-2">
        <Search className="size-4 shrink-0" />
        <Input
          id={id}
          value={query}
          placeholder="Ex. Bonapriso, Douala"
          onChange={(e) => {
            setQuery(e.target.value);
            if (value)
              onChange({
                ...value,
                query: e.target.value,
                neighborhood: e.target.value,
                confirmed: false,
              });
          }}
        />
      </div>
      {matches.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Quartiers proposés">
          {matches.map((a) => (
            <Button
              key={a.name}
              type="button"
              variant="outline"
              onClick={() => {
                setQuery(`${a.name}, ${a.city}`);
                setCenter([a.lat, a.lng]);
                onChange({
                  lat: a.lat,
                  lng: a.lng,
                  neighborhood: a.name,
                  query: `${a.name}, ${a.city}`,
                  confirmed: false,
                });
              }}
            >
              <MapPin data-icon="inline-start" />
              {a.name} · {a.city}
            </Button>
          ))}
        </div>
      )}
      {query.length >= 2 && matches.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Quartier absent du catalogue pilote. Déplacez la carte ou indiquez les
          coordonnées du point.
        </p>
      )}
      <div className="rounded-xl overflow-hidden border isolate">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: 280, width: "100%" }}
        >
          <TileLayer
            url={
              import.meta.env.VITE_MAP_TILE_URL ||
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            eventHandlers={{ tileerror: () => setTilesFailed(true) }}
          />
          <MapInteraction
            value={value}
            center={center}
            onChange={(p) =>
              onChange({
                ...p,
                neighborhood: value?.neighborhood || query,
                query,
              })
            }
          />
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Le quartier situe la zone. Touchez ensuite l’entrée exacte sur la carte
        et confirmez le point.
      </p>
      {tilesFailed && (
        <p role="status" className="text-xs">
          Le fond de carte est indisponible. Réessayez ou renseignez les
          coordonnées exactes.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {(["lat", "lng"] as const).map((axis) => (
          <label key={axis} className="text-xs flex flex-col gap-1">
            {axis === "lat" ? "Latitude" : "Longitude"}
            <Input
              aria-label={axis === "lat" ? "Latitude" : "Longitude"}
              type="number"
              step="any"
              value={value?.[axis] ?? ""}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (e.target.value && Number.isFinite(next)) {
                  const point = {
                    ...(value ?? {
                      lat: center[0],
                      lng: center[1],
                      neighborhood: query,
                      query,
                      confirmed: false,
                    }),
                    [axis]: next,
                    confirmed: false,
                  };
                  if (Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180) {
                    onChange(point);
                    setCenter([point.lat, point.lng]);
                  }
                }
              }}
            />
          </label>
        ))}
      </div>
      <Button
        type="button"
        variant={value?.confirmed ? "secondary" : "yolo"}
        disabled={!value || query.trim().length < 2}
        onClick={() =>
          value &&
          onChange({
            ...value,
            neighborhood: value.neighborhood || query,
            confirmed: true,
          })
        }
      >
        <Check data-icon="inline-start" />
        {value?.confirmed
          ? "Position confirmée"
          : "Confirmer cette position"}
      </Button>
    </fieldset>
  );
}
