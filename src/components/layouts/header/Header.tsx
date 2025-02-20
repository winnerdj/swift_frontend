import React from "react";
import AccountComboBox from "./AccountComboBox";

interface HeaderProps {
    children: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
    return (
        <div className="flex items-center border-l-0 bg-[#44536C] h-12 gap-4">
            <div className="flex bg-[#CD3E3A] w-50 h-12 items-center justify-center" >
                <h4 className="font-bold text-cyan-50">CLARS QMS</h4>
            </div>
            <div className="flex flex-1 w-50 h-12 border-0 items-center justify-between" >
                <div className="flex col-span-8 justify-items-normal items-center gap-4">
                    <div className="flex items-center gap-2">
                        {children}
                    </div>
                </div>
                <div className="flex justify-items-normal items-center gap-4">
                    <AccountComboBox/>
                </div>
            </div>
        </div>
    );
};

export default Header;