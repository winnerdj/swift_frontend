import { useSidebar } from "../../ui/sidebar";

// Backdrop Component
const Backdrop: React.FC = () => {
    const { open, setOpen } = useSidebar(); // Access sidebar state

    if(!open) return null; // Hide backdrop if sidebar is closed

    return (
        <div
            className="fixed inset-0 top-12 left-50 right-0 bottom-0 bg-black/50 transition-opacity z-40"
            onClick={() => setOpen(false)} // Close sidebar on click
        />
    );
};

export default Backdrop;