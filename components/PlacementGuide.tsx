
import React from 'react';
import GarmentGraphic from './GarmentGraphic';

type Placement = 'full-front' | 'left-chest' | 'full-back' | 'sleeve' | 'back-collar';

interface Sizing {
    garment: string;
    transfer: string;
}

interface GuideSection {
    title: string;
    placement: Placement;
    description: string;
    sizes: Sizing[];
}

const guideData: GuideSection[] = [
    {
        title: 'Adult: Full Front',
        placement: 'full-front',
        description: 'Center the design on the chest. A good starting point is about 3-4 inches (4 fingers) down from the bottom of the collar.',
        sizes: [
            { garment: 'XS', transfer: '9" x 9"' },
            { garment: 'S', transfer: '10" x 10"' },
            { garment: 'M', transfer: '11" x 11"' },
            { garment: 'L', transfer: '11.5" x 11.5"' },
            { garment: 'XL', transfer: '12" x 12"' },
            { garment: '2XL', transfer: '12.5" x 12.5"' },
            { garment: '3XL', transfer: '13" x 13"' },
            { garment: '4XL', transfer: '13.5" x 13.5"' },
            { garment: '5XL', transfer: '14" x 14"' },
        ],
    },
    {
        title: 'Adult: Left Chest',
        placement: 'left-chest',
        description: 'Align the vertical center of the design with the edge of the collar. Typically 7-9 inches down from the shoulder seam.',
        sizes: [
            { garment: 'XS - M', transfer: '3" x 3" to 4" x 4"' },
            { garment: 'L - 5XL', transfer: '3.5" x 3.5" to 4.5" x 4.5"' },
        ],
    },
     {
        title: 'Adult: Full Back',
        placement: 'full-back',
        description: 'Place the design about 4-5 inches down from the back collar.',
        sizes: [
            { garment: 'XS - M', transfer: '10.5" x 10.5"' },
            { garment: 'L - XL', transfer: '11" x 11"' },
            { garment: '2XL - 5XL', transfer: '11.5" x 11.5" to 12.5" x 12.5"' },
        ],
    },
    {
        title: 'Adult: Sleeve',
        placement: 'sleeve',
        description: 'Position the design about 1-1.5 inches up from the sleeve hem.',
        sizes: [
            { garment: 'Short Sleeve', transfer: '3" x 3" to 3.5" x 3.5"' },
            { garment: 'Long Sleeve', transfer: '2.5" x 11" to 3" x 14"' },
        ],
    },
    {
        title: 'Youth & Toddler',
        placement: 'full-front',
        description: 'For youth sizes, place the design 2-3 inches below the collar. For toddlers, 1.5-2 inches is a good starting point.',
        sizes: [
            { garment: 'Youth XS (6-8)', transfer: '7" x 7"' },
            { garment: 'Youth S (8-10)', transfer: '8" x 8"' },
            { garment: 'Youth M (10-12)', transfer: '8.5" x 8.5"' },
            { garment: 'Youth L (12-14)', transfer: '9" x 9"' },
            { garment: 'Toddler (2T-5T)', transfer: '5" x 5" to 6" x 6"' },
        ],
    },
    {
        title: 'Infant / Baby',
        placement: 'full-front',
        description: 'For onesies and infant shirts, place the design about 1-1.5 inches below the collar.',
        sizes: [
            { garment: '0-3 Months', transfer: '3" x 3"' },
            { garment: '6-9 Months', transfer: '4" x 4"' },
            { garment: '12-18 Months', transfer: '5" x 5"' },
        ],
    },
];

const PlacementSection: React.FC<{ section: GuideSection }> = ({ section }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{section.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{section.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-lg flex justify-center items-center h-64">
                    <GarmentGraphic placement={section.placement} />
                </div>
                <div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="text-sm font-semibold text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-slate-700/50 border-b-2 border-gray-200 dark:border-slate-700">Garment Size</th>
                                <th className="text-sm font-semibold text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-slate-700/50 border-b-2 border-gray-200 dark:border-slate-700">Recommended Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {section.sizes.map((size, index) => (
                                <tr key={index}>
                                    <td className="p-2 border-b border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200">{size.garment}</td>
                                    <td className="p-2 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-mono">{size.transfer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
);


const PlacementGuide: React.FC = () => {
    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8">
                 <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">DTF Transfer Placement & Sizing Guide</h1>
                 <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Your reference for perfect prints, every time.</p>
                 <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/50 rounded-md p-2 inline-block">
                    <strong>Pro Tip:</strong> These are standard recommendations. Always measure and adjust based on the specific garment and design.
                 </p>
            </div>
            <div className="space-y-8">
                {guideData.map(section => <PlacementSection key={section.title} section={section} />)}
            </div>
        </div>
    );
};

export default PlacementGuide;
