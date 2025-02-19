import React from 'react';

interface CardProps {
  title: string;
  valuePending: string | number;
  valueFetched: string | number;
  valueTransferredToHLS?: string | number;
  valueTransferredToPVM?: string | number;
  description: string;
  type: string;
}

const Card: React.FC<CardProps> = ({ title, valuePending, valueFetched, valueTransferredToHLS, valueTransferredToPVM, description, type }) => {
  return (
    <div className="bg-white shadow-2xl rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
      {type === 'stat' ? (
        <div className='grid grid-cols-3 gap-8 p-6'>
          <div className="text-3xl font-bold text-red-500">{valuePending}</div>
          <div className="text-3xl font-bold text-orange-500">{valueFetched}</div>
          {valueTransferredToHLS ? <div className="text-3xl font-bold text-blue-500">{valueTransferredToHLS}</div> : ''}
          {valueTransferredToPVM ? <div className="text-3xl font-bold text-green-500">{valueTransferredToPVM}</div> : ''}
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg">
          {/* Placeholder for graph */}
          <p className="text-gray-500">Graph will be rendered here.</p>
        </div>
      )}
    </div>
  );
};

export default Card;