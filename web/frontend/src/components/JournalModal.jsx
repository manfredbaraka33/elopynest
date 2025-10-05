import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function JournalModal({ isOpen, onClose, onSuccess }) {
  const { getData } = useApi();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserJournals = async () => {
    setLoading(true);
    try {
      const res = await getData('/user/alljournals/');
      setJournals(res?.data || []);
      onSuccess();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserJournals();
    } else {
      setJournals([]);
    }
  }, [isOpen]);

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
            <Dialog.Panel className="w-full max-w-2xl overflow-y-auto transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-colors duration-300">
              <div className="mt-6 flex justify-between gap-2 p-3">
                <Dialog.Title className="text-md font-medium text-gray-900 dark:text-gray-100">
                  My journals ({journals?.length})
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="px-2 py-1 rounded bg-gradient-to-br from-red-900 via-red-500 to-red-700 text-white hover:brightness-90 transition"
                >
                  Close
                </button>
              </div>

              <div className="inset-0 p-4 min-h-full max-h-screen overflow-y-auto">
                {loading ? (
                  <div className="text-gray-700 dark:text-gray-300">Loading journals...</div>
                ) : (
                  <div>
                    {journals?.length > 0 ? (
                      <div className="flex flex-col items-center text-black dark:text-gray-200 justify-center space-y-4">
                        {journals.map((j, i) => (
                          <div
                            key={i}
                            className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 w-full"
                          >
                            <div className="font-semibold">Prompt: {j.prompt}</div>
                            <div>Date:  {j.date}</div> <br />
                              <div>Text: {j.text}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-700 dark:text-gray-300">No journals</div>
                    )}
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

