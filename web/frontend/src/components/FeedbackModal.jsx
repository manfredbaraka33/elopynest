import React from "react";

export default function FeedbackModal({ isOpen, feedback, onClose,isLoadingFeedBack }) {
  if (!isOpen) return null;

  console.log("Here is the feedback from ai",feedback)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-lg shadow-lg relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          AI Feedback
        </h2>

            {isLoadingFeedBack ? (<div  className="text-gray-800 dark:text-gray-300 whitespace-pre-line">Generating feedback...</div>):(
                <div>
                    <p className="text-gray-800 dark:text-gray-300 whitespace-pre-line">
                {feedback}
                  </p>
                </div>
            )}
        

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
