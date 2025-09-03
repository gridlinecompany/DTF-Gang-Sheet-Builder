import React from 'react';

type Placement = 'full-front' | 'left-chest' | 'full-back' | 'sleeve' | 'back-collar';

interface GarmentGraphicProps {
  placement: Placement;
}

// A more realistic T-Shirt SVG shape
const TShirtBase: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-gray-300 dark:text-slate-500" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 20 95 L 20 40 L 5 30 L 25 15 C 35 25, 65 25, 75 15 L 95 30 L 80 40 L 80 95 Z" />
  </svg>
);


const PlacementRect: React.FC<{ x: number; y: number; width: number; height: number; transform?: string; }> = (props) => (
  <rect {...props} className="text-red-500/70" fill="currentColor" />
);

const GarmentGraphic: React.FC<GarmentGraphicProps> = ({ placement }) => {
  return (
    <div className="relative w-48 h-48">
      <div className="absolute inset-0">
        <TShirtBase />
      </div>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {/* Full front placement, centered on the chest */}
        {placement === 'full-front' && <PlacementRect x={30} y={45} width={40} height={40} />}
        {/* Left chest is the wearer's left, which is on the right side for the viewer */}
        {placement === 'left-chest' && <PlacementRect x={55} y={45} width={15} height={15} />}
        {/* Full back placement, similar to front for this graphic */}
        {placement === 'full-back' && <PlacementRect x={30} y={45} width={40} height={45} />}
        {/* Back collar placement, high on the back */}
        {placement === 'back-collar' && <PlacementRect x={40} y={20} width={20} height={10} />}
        {/* Sleeve placement shown on the wearer's left sleeve (viewer's left) */}
        {placement === 'sleeve' && <PlacementRect x={8} y={28} width={10} height={10} />}
      </svg>
    </div>
  );
};

export default GarmentGraphic;
