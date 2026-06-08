'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Image from 'next/image';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Home() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [fileFoto, setFileFoto] = useState(null); // State untuk file fisik foto
  const [linkKtp, setLinkKtp] = useState('');     // State untuk URL Google Drive
  const [loading, setLoading] = useState(false);

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
  }, []);

  // 2. FUNGSI CREATE: Menambah data beserta proses upload berkas
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

      // PROSES B: Simpan semua data teks dan URL aset ke Tabel Database
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
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Sistem Informasi Mahasiswa v2 (Multi-Cloud Assets)
        </h1>

        {/* FORM REGISTER */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Tambah Mahasiswa & Berkas</h2>
          <form onSubmit={tambahMahasiswa} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">NIM</label>
                <input type="text" value={nim} onChange={(e) => setNim(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2 bg-gray-50 border text-gray-800" placeholder="e.g. 23001" />
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

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-md transition disabled:bg-gray-400">
              {loading ? 'Sedang Memproses Data...' : 'Simpan Data Lengkap'}
            </button>
          </form>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM / Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Angkatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen KTP</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-700">
              {mahasiswa.length === 0 ? (
                <tr key="empty-state">
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">Belum ada data mahasiswa.</td>
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
                        <a href={m.foto_ktp} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1">
                          Lihat KTP (Drive)
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Tidak ada file</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}