import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useApi } from '../hooks/useApi';

export default function RoutineModal({ isOpen, onClose, onSuccess }) {
  const { postData } = useApi();
  const [title, setTitle] = useState('');

  const handleSubmit = async () => {
    try {
      await postData("user/addroutine/", { title });
      onSuccess();  // Refresh parent dashboard
      setTitle('');
      onClose();    // Close modal
    } catch (err) {
      console.error('Error creating routine:', err);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-colors duration-300">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Add New Routine
              </Dialog.Title>
              <div className="mt-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Routine title"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded transition-colors duration-300"
                  required
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded px-4 py-2 text-gray-600 bg-gradient-to-br from-red-400 via-yellow-400 to-orange-400 hover:brightness-90 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-gradient-to-tr from-blue-400 via-purple-500 to-orange-400 text-white rounded hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
