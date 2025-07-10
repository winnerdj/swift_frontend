import React, { useState, useEffect, useRef } from 'react';
import useDisclosure from '@/hooks/useDisclosure';
import { Button } from '@/components/ui/button'
import CreatePodTicket from '../components/modals/CreatePodTicket';
import CreateDefautTicket from '../components/modals/CreateDefaultTicket';
import { Maximize } from 'lucide-react' // Import Maximize for fullscreen icon
import { useGetServiceQuery } from '@/lib/redux/api/service.api';
import { getUserDetails } from "@/lib/redux/slices/auth.slice";
import { useAppSelector } from "@/hooks/redux.hooks";

interface Service {
    service_id: string;
    service_name: string;
    service_location: string;
    service_status: number;
    service_modal_ui: string;
}

const Kiosk: React.FC = () => {
    const userSessionDetails = useAppSelector(getUserDetails);
    const kioskDisclosure = useDisclosure();
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [ticketNumber, setTicketNumber] = useState<number | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const kioskRef = useRef<HTMLDivElement>(null);

    const { data = {}, isLoading, isSuccess } = useGetServiceQuery({
        filters: {
            service_location: userSessionDetails?.user_location || 'undefined',
            service_status: 1
        }
    });

    useEffect(() => {
        if(isSuccess && data) {
            setServices(data.rows);
        }
    }, [data, isSuccess]);

    const handleServiceSelection = (service: Service) => {
        setSelectedService(service);

        if(service.service_modal_ui) {
            console.error("Invalid service selected:", service);
            kioskDisclosure.onOpen(service.service_modal_ui);
            return;
        }
        else {
            kioskDisclosure.onOpen('createDefaultTicket');
        }
    };

    const handleCreateTicket = (ticketNum: number) => {
        setTicketNumber(ticketNum);
        console.log('Created ticket number: ', ticketNumber)
    };

    const toggleFullscreen = () => {
        const element = kioskRef.current;
        if(!element) return;

        if(!document.fullscreenElement) {
            if(element.requestFullscreen) {
                element.requestFullscreen()
                    .then(() => {
                        setIsFullscreen(true);
                    })
                    .catch(err => {
                        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                    });
            }
        } else {
            if(document.exitFullscreen) {
                document.exitFullscreen()
                    .then(() => {
                        setIsFullscreen(false);
                    });
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div
            className={`grid gap-3 pl-2 pr-2 ${isFullscreen ? 'h-screen' : ''}`}
            ref={kioskRef}
        >
            {/* HEADER */}
            <div className='flex w-full items-center justify-end rounded-xs p-3 h-12 gap-x-4 bg-gray-50 shadow-2xs'>
                <Button
                    variant="ghost"
                    className="p-2 h-7 hover:bg-gray-400"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    <Maximize className="h-4 w-4" />
                </Button>
            </div>
            <div
                className={`rounded-xs bg-gray-50 shadow-2xs p-4 ${isFullscreen ? 'flex-grow' : ''}`}
            >
                <div className="flex flex-col items-center justify-center min-h-full p-4">
                    <div className="w-full max-w-8xl">
                        {isLoading ? (
                            <div>
                                <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-8 text-gray-800 text-center">
                                    Loading services...
                                </h2>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-8 text-gray-800 text-center">
                                    Select a Service
                                </h2>
                                <div className={`flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8`}>
                                    {services.map((service) => (
                                        <Button
                                            key={service.service_name}
                                            onClick={() => handleServiceSelection(service)}
                                            className={`bg-[#CD3E3A] hover:bg-blue-700 text-white font-bold
                                                rounded-lg shadow-md
                                                flex items-center justify-center
                                                w-full sm:w-3/4 md:w-3/4 lg:w-1/4 h-full text-lg sm:text-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
                                                ${isFullscreen ? 'py-16 sm:py-20 md:py-100 md:text-6xl ' : 'py-16 sm:py-20 md:py-40 md:text-3xl'}
                                                ${selectedService?.service_id === service.service_id ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                            disabled={selectedService?.service_id === service.service_id}
                                        >
                                            {service.service_name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreatePodTicket
                isOpen={kioskDisclosure.isOpen('createPodTicket')}
                onClose={() => {
                    kioskDisclosure.onClose('createPodTicket');
                    setSelectedService(null);
                }}
                selectedService={selectedService}
                onCreateTicket={handleCreateTicket}
            />

            <CreateDefautTicket
                isOpen={kioskDisclosure.isOpen('createDefaultTicket')}
                onClose={() => {
                    kioskDisclosure.onClose('createDefaultTicket');
                    setSelectedService(null);
                }}
                selectedService={selectedService}
                onCreateTicket={handleCreateTicket}
            />
        </div>
    );
};

export default Kiosk;