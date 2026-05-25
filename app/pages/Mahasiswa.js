'use client';

import { useEffect, useState } from 'react';
import StudentTable from '../components/StudentTable';
import { supabase } from '../lib/supabase';

export default function Mahasiswa() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const editMahasiswa = () => {
    alert('Edit data mahasiswa dilakukan dari form utama.');
  };

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
      ambilData();
    }
  };

  return (
    <div className="space-y-3">
      <StudentTable
        mahasiswa={mahasiswa}
        loading={loading}
        onEdit={editMahasiswa}
        onDelete={hapusMahasiswa}
      />
    </div>
  );
}
