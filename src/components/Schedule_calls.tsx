import React from "react";

interface SelectCallProps {
  isOpen: boolean;
  onClose: () => void;
}

const Schedule_calls: React.FC<SelectCallProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null; 

  return (
    <div className="fixed  inset-0 flex items-center justify-center  z-50">
      <div className="bg-white p-6  rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-xl font-semibold mb-4">Choose Call Type</h2>
        <button
          onClick={() => {
            onClose();
            window.location.href = "/consultation-call"; 
          }}
          className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Consultation Call
        </button>
        <button
          onClick={() => {
            onClose();
            window.location.href = "/partnership-call"; 
          }}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Partnership Call
        </button>
        <button
          onClick={onClose}
          className="mt-4 text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Schedule_calls;
