'use client';

import { useEffect, useState } from 'react';
import StudentTable from '../components/StudentTable';
import { supabase } from '../lib/supabase';
import Image from 'next/image';

export default function Mahasiswa() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const tampilkanError = (label, error) => {
    console.error(label, {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
    });
  };

  const ambilData = async () => {
    const { data, error } = await supabase
      .from('mahasiswa')
      .select('*')
      .order('nim', { ascending: true });

    if (error) {
      tampilkanError('Gagal mengambil data:', error);
    } else {
      setMahasiswa(data);
    }
  };

  useEffect(() => {
    let dibatalkan = false;

    const muatData = async () => {
      const { data, error } = await supabase
        .from('mahasiswa')
        .select('*')
        .order('nim', { ascending: true });

      if (dibatalkan) return;

      if (error) {
        tampilkanError('Gagal mengambil data:', error);
      } else {
        setMahasiswa(data);
      }

      setLoading(false);
    };

    muatData();

    return () => {
      dibatalkan = true;
    };
  }, []);

  return (
    <div className="space-y-3">
      <StudentTable
        mahasiswa={mahasiswa}
        loading={loading}
        onDetail={(student) => setSelectedStudent(student)}
      />

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedStudent(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col md:flex-row overflow-hidden z-10 transition-transform duration-300 scale-100 max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
            
            {/* Close Button X */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 md:bg-slate-100 md:hover:bg-slate-200 text-white md:text-slate-600 p-2 rounded-full transition duration-150 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Column (Profile Info Banner) */}
            <div className="w-full md:w-2/5 bg-gradient-to-br from-sky-600 to-indigo-700 p-8 flex flex-col items-center justify-center text-white text-center">
              <div className="relative w-32 h-32 rounded-full border-4 border-white/30 shadow-xl overflow-hidden mb-4 bg-white/10 flex items-center justify-center">
                {selectedStudent.foto_mahasiswa ? (
                  <Image
                    src={selectedStudent.foto_mahasiswa}
                    alt={selectedStudent.nama}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white/70">
                    {selectedStudent.nama ? selectedStudent.nama.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold leading-tight">{selectedStudent.nama}</h3>
              <span className="mt-2 inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono tracking-wider font-semibold">
                NIM: {selectedStudent.nim}
              </span>
            </div>

            {/* Right Column (Detailed Fields) */}
            <div className="w-full md:w-3/5 p-8 flex flex-col justify-between bg-white">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 border-b pb-2">
                  Detail Mahasiswa
                </h4>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Nama Lengkap
                    </label>
                    <p className="text-slate-900 font-semibold text-lg">{selectedStudent.nama}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        NIM (Nomor Induk)
                      </label>
                      <p className="text-slate-800 font-mono font-medium">{selectedStudent.nim}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Angkatan
                      </label>
                      <p className="text-slate-800 font-medium">{selectedStudent.angkatan}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Dokumen KTP (Google Drive)
                    </label>
                    {selectedStudent.foto_ktp ? (
                      <div className="border border-slate-200 bg-slate-50 p-4 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-700 truncate max-w-[150px] sm:max-w-none">
                              KTP_{selectedStudent.nim}.pdf
                            </p>
                            <p className="text-[10px] text-slate-400">Tautan Google Drive</p>
                          </div>
                        </div>
                        <a
                          href={selectedStudent.foto_ktp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-slate-100 text-sky-600 hover:text-sky-700 border border-slate-200 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition duration-150 flex items-center gap-1 cursor-pointer"
                        >
                          Buka
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                        Berkas KTP belum diunggah
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition duration-150 cursor-pointer active:scale-95 shadow-md shadow-slate-950/10"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
