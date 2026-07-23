import React, { useState, useEffect } from 'react';

interface ParentguidePdfProps {
  isOpen: boolean;
  onClose: () => void;
}

const ParentguidePdf: React.FC<ParentguidePdfProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pdfs, setPdfs] = useState<string[]>([])
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);  
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCheckBox = (pdeKey: string) => {
    setPdfs(prev =>
      prev.includes(pdeKey) ? prev.filter(k => k !== pdeKey) : [...prev, pdeKey]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_URL}/api/sendpdf/sent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, pdf_keys: pdfs }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to send PDF');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setName('');
        setEmail('');
        setPdfs([])
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex justify-center items-center px-4 sm:px-0">
      <div className="relative bg-white p-6 sm:max-w-sm sm:p-6 rounded-lg shadow-xl w-full max-w-md z-[101]">

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl"
        >
          ×
        </button>

        {isSuccess ? (
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-700">
              The Parent Guide PDF has been sent to your email.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4 text-center">Email Parent Guide</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1d99c6] focus:border-[#1d99c6]"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1d99c6] focus:border-[#1d99c6]"
                />
              </div>
              <div>
                <label className='blck text-sm font-medium text-gray-700'>Select SHSAT PDFs</label>
                <div className='mt-2 space-y-2'>
                  <label className='flex items-center'>
                    <input type="checkbox" checked={pdfs.includes("parent_guide")} onChange={() => handleCheckBox("parent_guide")} className='mr-2' />
                    Parent Guide
                  </label>

                </div>
                {/* <div className='mt-2 space-y-2'>
                  <label className='flex items-center'>
                    <input type="checkbox" checked={pdfs.includes("ela_guide")} onChange={() => handleCheckBox("ela_guide")} className='mr-2' />
                    Ela Guide
                  </label>

                </div> */}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1d99c6] text-white py-2 rounded-md hover:bg-[#1782a7] transition"
              >
                {isSubmitting ? 'Sending...' : 'Submit & Get PDF'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ParentguidePdf;
