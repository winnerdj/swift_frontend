import React from 'react';

interface Legend {
	label: string;
	color: string;
}

const Legend: React.FC<{ items: Legend[] }> = ({ items }) => (


	<div className='flex item-mi'>
		<ul className="flex space-x-4 mb-6">
			{items.map((item, index) => (
			<li key={index} className="flex items-center space-x-2">
				<span className={`w-4 h-4 rounded-full ${item.color}`} aria-label={`${item.label} indicator`}></span>
				<span className="text-gray-700 text-sm">{item.label}</span>
			</li>
			))}
		</ul>
	</div>
);

export default Legend;