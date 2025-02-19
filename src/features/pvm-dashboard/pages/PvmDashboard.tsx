import React, { useState } from 'react';
import Card from '../components/card/Card';
import Legend from '../components/legend/Legend'
import { useGetPvmDashboardQuery } from '@/lib/redux/api/pvm-dashboard.api';

interface Card {
    title: string;
    valuePending: string | number;
    valueFetched: string | number;
    valueTransferredToPVM?: string | number;
    valueTransferredToHLS?: string | number;
    description: string;
    type: string;
}

interface DashboardData {
    SAP_to_3PL: Card[];
    KLI_Internal: Card[];
    '3PL_to_SAP': Card[];
}

interface LegendItem {
	label: string;
	color: string;
}

const PvmDashboard: React.FC = () => {
    const { data = {}, isSuccess } = useGetPvmDashboardQuery();

    const [dashboardData, setDashboardData] = React.useState<DashboardData>({
        SAP_to_3PL: [],
        KLI_Internal: [],
        '3PL_to_SAP': [],
    });

    const [currentTime] = useState<string>(() =>
        new Date().toLocaleString()
    );

    const legendItems: LegendItem[] = [
        { label: 'Files in PVM', color: 'bg-red-500' },
        { label: 'Fetched in MESI', color: 'bg-orange-500' },
        { label: 'Interfaced to HLS', color: 'bg-blue-500' },
        { label: 'Interfaced to PVM', color: 'bg-green-500' },
    ];

    React.useEffect(() => {
        if (isSuccess && data.dashboardData) {
            setDashboardData(data.dashboardData);
        }
    }, [isSuccess, data]);

    return (
    <div className="p-6">
        <div className="flex items-center-mi justify-between mb-6">
            <Legend items={legendItems} />
            <div className="text-sm text-gray-500">{currentTime}</div>
        </div>
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">PVM to KLI</h2>
                {isSuccess && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-4">
                        {dashboardData.SAP_to_3PL.map((card, index) => (
                            <Card
                            key={index}
                            title={card.title}
                            valuePending={card.valuePending}
                            valueFetched={card.valueFetched}
                            valueTransferredToHLS={card.valueTransferredToHLS}
                            description={card.description}
                            type={card.type}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div>
                <h4 className="text-2xl font-semibold tracking-tight">KLI Internal</h4>
                {isSuccess && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-4">
                        {dashboardData.KLI_Internal.map((card, index) => (
                            <Card
                            key={index}
                            title={card.title}
                            valuePending={card.valuePending}
                            valueFetched={card.valueFetched}
                            valueTransferredToHLS={card.valueTransferredToHLS}
                            description={card.description}
                            type={card.type}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">KLI to PVM</h2>
                {isSuccess && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-4">
                        {dashboardData['3PL_to_SAP'].map((card, index) => (
                            <Card
                                key={index}
                                title={card.title}
                                valuePending={card.valuePending}
                                valueFetched={card.valueFetched}
                                valueTransferredToPVM={card.valueTransferredToPVM}
                                valueTransferredToHLS={card.valueTransferredToHLS}
                                description={card.description}
                                type={card.type}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => console.log('data', data)}>{'.'}</div>
    </div>
    );
};

export default PvmDashboard;