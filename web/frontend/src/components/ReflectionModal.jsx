import { useState } from "react";

function ReflectionModal({ isOpen, onClose, onSave, onSaveAndFeedback,isLoadingFeedBack }) {
  const [reflection, setReflection] = useState("");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Today’s Habit Reflection
        </h2>

        <div>

            {isLoadingFeedBack ? (<div>Generating feedback .......</div>):(
                <div>
                            {/* Reflection Textarea */}
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Write about your progress, challenges, or feelings about this habit..."
          className="w-full min-h-[150px] p-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800  text-gray-600 dark:text-gray-300"
        />

        {/* Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold"
          >
            Skip
          </button>
          <div className="space-x-2">
            <button
              onClick={() => onSave(reflection)}
              className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => onSaveAndFeedback(reflection)}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Save & Ask Feedback
            </button>
          </div>
        </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}

export default ReflectionModal;
