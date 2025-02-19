import React from "react";
import AccountComboBox from "./AccountComboBox";

interface HeaderProps {
    children: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
    return (
        <div className="grid grid-cols-1 items-center border border-l-0 border-b px-5 h-12">
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">{children}</div>
                <AccountComboBox />
            </div>
        </div>
    );
};

export default Header;