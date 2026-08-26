import React from 'react';

const LocationMap = ({ location = "Wardha" }) => {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=13&output=embed`;

  return (
    <div className="w-full rounded-[16px] overflow-hidden border border-slate-200 shadow-sm">
      <div className="bg-slate-900 text-white px-4 py-2.5 flex justify-between items-center">
        <p className="text-[11px] font-black tracking-widest">📍 PICKUP LOCATION - {location.toUpperCase()}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
          target="_blank" rel="noreferrer"
          className="bg-white text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full"
        >
          Open in Google Maps
        </a>
      </div>
      <iframe
        title="map"
        src={mapSrc}
        width="100%"
        height="280"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default LocationMap;