import React, { ReactNode } from 'react';

interface DialogProps {
    isOpen: boolean;
    onClose?: () => void;
    OnYes?: () => void;
    OnNo?: () => void;
    title: string;
    buttonClose?: boolean;
    buttonYesNo?: boolean;
    children: ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, OnYes, OnNo, title, buttonClose, buttonYesNo, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">
                        &times;
                    </button>
                </div>
                <div>
                    {children}
                </div>
                {buttonClose && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Close
                        </button>
                    </div>
                )}
                {buttonYesNo && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={OnYes}
                            className="mr-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Có
                        </button>
                        <button
                            onClick={OnNo}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Không
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dialog;
