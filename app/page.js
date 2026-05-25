'use client';

import { useState, useEffect } from 'react';
import PageHeader from './components/PageHeader';
import StudentForm from './components/StudentForm';
import StudentTable from './components/StudentTable';
import { supabase } from './lib/supabase';

export default function Home() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [editingNim, setEditingNim] = useState(null);

  const tampilkanError = (label, error) => {
    console.error(label, {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
    });
  };

  const resetForm = () => {
    setNim('');
    setNama('');
    setAngkatan('');
    setEditingNim(null);
  };

  const urutkanMahasiswa = (data) => {
    return [...data].sort((a, b) => String(a.nim).localeCompare(String(b.nim)));
  };

  // 1. FUNGSI READ: Mengambil data dari Supabase
  const ambilData = async () => {
    const { data, error } = await supabase
      .from('mahasiswa')
      .select('*')
      .order('nim', { ascending: true });

    if (error) tampilkanError('Gagal mengambil data:', error);
    else setMahasiswa(data);
  };

  useEffect(() => {
    let dibatalkan = false;

    const muatDataAwal = async () => {
      const { data, error } = await supabase
        .from('mahasiswa')
        .select('*')
        .order('nim', { ascending: true });

      if (dibatalkan) return;

      if (error) {
        console.error('Gagal mengambil data:', {
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
        });
      } else {
        setMahasiswa(data);
      }

      setLoadingData(false);
    };

    muatDataAwal();

    return () => {
      dibatalkan = true;
    };
  }, []);

  // 2. FUNGSI CREATE / UPDATE: Menambah atau mengubah data di Supabase
  const tambahMahasiswa = async (e) => {
    e.preventDefault();
    if (!nim || !nama || !angkatan) return alert('Semua data wajib diisi!');

    setLoading(true);

    if (editingNim) {
      const dataBaru = {
        nim: nim.trim(),
        nama: nama.trim(),
        angkatan: parseInt(angkatan, 10),
      };
      const { error, count } = await supabase
        .from('mahasiswa')
        .update(dataBaru, { count: 'exact' })
        .eq('nim', editingNim);

      setLoading(false);

      if (error) {
        alert('Gagal mengubah data: ' + error.message);
      } else if (count === 0) {
        alert('Gagal mengubah data: data ditemukan, tetapi tidak bisa diubah. Periksa policy UPDATE/RLS tabel mahasiswa di Supabase.');
      } else {
        setMahasiswa((dataLama) => (
          urutkanMahasiswa(dataLama.map((m) => (m.nim === editingNim ? dataBaru : m)))
        ));
        alert('Data berhasil diubah!');
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from('mahasiswa')
        .insert([{ nim: nim.trim(), nama: nama.trim(), angkatan: parseInt(angkatan, 10) }])
        .select()
        .single();

      setLoading(false);

      if (error) {
        alert('Gagal menambah data: ' + error.message);
      } else {
        setMahasiswa((dataLama) => urutkanMahasiswa([...dataLama, data]));
        alert('Data berhasil ditambahkan!');
        resetForm();
      }
    }
  };

  // 3. FUNGSI EDIT: Siapkan form untuk mengubah data mahasiswa
  const editMahasiswa = (nimMahasiswa) => {
    const m = mahasiswa.find((mm) => mm.nim === nimMahasiswa);
    if (!m) return alert('Data tidak ditemukan.');
    setNim(m.nim || '');
    setNama(m.nama || '');
    setAngkatan(m.angkatan ? String(m.angkatan) : '');
    setEditingNim(nimMahasiswa);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. FUNGSI DELETE: Hapus data mahasiswa berdasarkan NIM
  const hapusMahasiswa = async (nimMahasiswa) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    const { error } = await supabase
      .from('mahasiswa')
      .delete()
      .eq('nim', nimMahasiswa);

    if (error) {
      alert('Gagal menghapus data: ' + error.message);
    } else {
      alert('Data berhasil dihapus!');
      ambilData(); // Refresh data tabel
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader totalMahasiswa={mahasiswa.length} />

        <StudentForm
          nim={nim}
          nama={nama}
          angkatan={angkatan}
          loading={loading}
          isEditing={Boolean(editingNim)}
          onNimChange={setNim}
          onNamaChange={setNama}
          onAngkatanChange={setAngkatan}
          onSubmit={tambahMahasiswa}
          onCancel={resetForm}
        />

        <StudentTable
          mahasiswa={mahasiswa}
          loading={loadingData}
          onEdit={editMahasiswa}
          onDelete={hapusMahasiswa}
        />
      </div>
    </main>
  );
}
