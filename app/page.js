'use client';

import { useState, useEffect } from 'react';
import { supabase, supabaseUrl, supabaseAnonKey } from './lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [fileFoto, setFileFoto] = useState(null); // State untuk file fisik foto
  const [linkKtp, setLinkKtp] = useState('');     // State untuk URL Google Drive
  const [loading, setLoading] = useState(false);
  const [editingNim, setEditingNim] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [user, setUser] = useState(null);

  const handleEditClick = (m) => {
    setEditingNim(m.nim);
    setNim(m.nim);
    setNama(m.nama);
    setAngkatan(m.angkatan.toString());
    setLinkKtp(m.foto_ktp || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalEdit = () => {
    setEditingNim(null);
    setNim('');
    setNama('');
    setAngkatan('');
    setLinkKtp('');
    setFileFoto(null);
  };

  const hapusMahasiswa = async (nimMahasiswa) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('mahasiswa')
        .delete()
        .eq('nim', nimMahasiswa);
      if (error) throw error;
      alert('Data berhasil dihapus!');
      ambilData();
    } catch (error) {
      alert('Gagal menghapus data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  // 1. FUNGSI READ: Mengambil data mahasiswa beserta link foto
  const ambilData = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase env vars are missing:', {
        supabaseUrl,
        hasAnonKey: Boolean(supabaseAnonKey),
      });
      return;
    }

    const { data, error } = await supabase
      .from('mahasiswa')
      .select('*')
      .order('nim', { ascending: true });

    console.log('Supabase fetch', { data, error });

    if (error) {
      console.error('Gagal mengambil data:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status: error.status,
      });
    } else {
      setMahasiswa(data);
    }
  };

  useEffect(() => {
    ambilData();
    
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. FUNGSI CREATE & UPDATE: Menambah atau mengubah data beserta proses upload berkas
  const tambahMahasiswa = async (e) => {
    e.preventDefault();
    if (!nim || !nama || !angkatan) return alert('Data utama wajib diisi!');
    
    setLoading(true);
    let urlFotoSupabase = null;

    try {
      // PROSES A: Jika ada file foto, upload ke Supabase Storage terlebih dahulu
      if (fileFoto) {
        const fileExt = fileFoto.name.split('.').pop();
        const fileName = `${nim}_${Date.now()}.${fileExt}`;
        const filePath = `avatar/${fileName}`;

        // Proses upload ke bucket 'foto-mahasiswa'
        const { error: uploadError } = await supabase.storage
          .from('foto-mahasiswa')
          .upload(filePath, fileFoto);

        if (uploadError) throw uploadError;

        // Ambil Public URL hasil upload
        const { data: publicUrlData } = supabase.storage
          .from('foto-mahasiswa')
          .getPublicUrl(filePath);

        urlFotoSupabase = publicUrlData.publicUrl;
      }

      if (editingNim) {
        // PROSES UPDATE: Perbarui data di Tabel Database
        const updateData = {
          nama,
          angkatan: parseInt(angkatan),
          foto_ktp: linkKtp
        };
        // Hanya update foto jika ada upload baru
        if (urlFotoSupabase) {
          updateData.foto_mahasiswa = urlFotoSupabase;
        }

        const { error: updateError } = await supabase
          .from('mahasiswa')
          .update(updateData)
          .eq('nim', editingNim);

        if (updateError) throw updateError;
        alert('Data berhasil diperbarui!');
        setEditingNim(null);
      } else {
        // PROSES INSERT: Simpan data baru ke Tabel Database
        const { error: insertError } = await supabase
          .from('mahasiswa')
          .insert([
            { 
              nim, 
              nama, 
              angkatan: parseInt(angkatan),
              foto_mahasiswa: urlFotoSupabase, // URL dari Supabase Storage
              foto_ktp: linkKtp                // URL dari Google Drive
            }
          ]);

        if (insertError) throw insertError;
        alert('Data dan Aset sukses disimpan!');
      }

      // Reset Form
      setNim('');
      setNama('');
      setAngkatan('');
      setFileFoto(null);
      setLinkKtp('');
      e.target.reset(); // Reset elemen input file di HTML
      ambilData();

    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      {/* Navigation Bar */}
      <div className="max-w-6xl mx-auto mb-8 bg-white shadow-sm border border-gray-150 rounded-2xl px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" />
            </svg>
          </div>
          <span className="font-bold text-gray-800 tracking-tight">MHS Online</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-400 font-medium">Masuk sebagai</p>
                <p className="text-sm font-semibold text-gray-700 max-w-[150px] truncate">{user.email || user.phone}</p>
              </div>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                }}
                className="px-4 py-2.5 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Masuk / Daftar
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Sistem Informasi Mahasiswa v3 (Multi-Cloud Assets)
        </h1>

        {/* FORM REGISTER */}
        {user ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {editingNim ? `Edit Mahasiswa & Berkas (NIM: ${editingNim})` : 'Tambah Mahasiswa & Berkas'}
            </h2>
            <form onSubmit={tambahMahasiswa} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">NIM</label>
                  <input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    disabled={Boolean(editingNim)}
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-gray-50 border text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="e.g. 23001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Nama Lengkap</label>
                  <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-gray-50 border text-gray-800" placeholder="e.g. Budi Santoso" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Angkatan</label>
                  <input type="number" value={angkatan} onChange={(e) => setAngkatan(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-gray-50 border text-gray-800" placeholder="e.g. 2023" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Foto Profil (Supabase Storage)</label>
                  <input type="file" accept="image/*" onChange={(e) => setFileFoto(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Link Direct Foto KTP (Google Drive)</label>
                  <input type="text" value={linkKtp} onChange={(e) => setLinkKtp(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-gray-50 border text-gray-800" placeholder="https://drive.google.com/uc?export=view&id=..." />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-md transition disabled:bg-gray-400 cursor-pointer"
                >
                  {loading ? 'Sedang Memproses Data...' : editingNim ? 'Simpan Perubahan' : 'Simpan Data Lengkap'}
                </button>
                {editingNim && (
                  <button
                    type="button"
                    onClick={batalEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium p-2 rounded-md transition cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center shadow-sm max-w-2xl mx-auto">
            <svg className="w-12 h-12 text-amber-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-bold text-amber-900 mb-1">Akses Terbatas</h3>
            <p className="text-sm text-amber-700 mb-4">
              Silakan masuk ke akun Anda terlebih dahulu untuk menambah, mengubah, atau menghapus data mahasiswa.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Masuk Sekarang
            </Link>
          </div>
        )}

        {/* TABEL DATA */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM / Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Angkatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen KTP</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
              {mahasiswa.length === 0 ? (
                <tr key="empty-state">
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-400">Belum ada data mahasiswa.</td>
                </tr>
              ) : (
                mahasiswa.map((m) => (
                  <tr key={m.id ?? m.nim}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.foto_mahasiswa ? (
                        <div className="relative w-12 h-12">
                          <Image src={m.foto_mahasiswa} alt={m.nama} fill className="rounded-full object-cover border border-gray-200" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm font-bold text-gray-900">{m.nim}</div>
                      <div className="text-sm text-gray-500">{m.nama}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{m.angkatan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {m.foto_ktp ? (
                        <a href={m.foto_ktp} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium underline inline-flex items-center gap-1">
                          Lihat KTP (Drive)
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Tidak ada file</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedStudent(m)}
                        className="text-sky-600 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded transition cursor-pointer font-semibold"
                      >
                        Detail
                      </button>
                      {user && (
                        <>
                          <button
                            onClick={() => handleEditClick(m)}
                            className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded transition cursor-pointer font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => hapusMahasiswa(m.nim)}
                            className="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded transition cursor-pointer font-semibold"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
    </main>
  );
}