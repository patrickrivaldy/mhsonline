import Image from 'next/image';

function LoadingRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index}>
      <td className="px-5 py-4">
        <div className="fb-shimmer h-12 w-12 rounded-full" />
      </td>
      <td className="px-5 py-4">
        <div className="fb-shimmer h-4 w-28" />
      </td>
      <td className="px-5 py-4">
        <div className="fb-shimmer h-4 w-44" />
      </td>
      <td className="px-5 py-4">
        <div className="fb-shimmer h-4 w-16" />
      </td>
      <td className="px-5 py-4">
        <div className="fb-shimmer h-4 w-32" />
      </td>
      <td className="px-5 py-4">
        <div className="fb-shimmer ml-auto h-8 w-28" />
      </td>
    </tr>
  ));
}

export default function StudentTable({ mahasiswa, loading = false, onDetail }) {
  return (
    <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Daftar Mahasiswa</h2>
          {loading && (
            <span className="h-4 w-4 animate-spin border-2 border-slate-300 border-t-sky-600" />
          )}
        </div>
        <span className="text-sm font-medium text-slate-500">
          {loading ? 'Memuat...' : `${mahasiswa.length} data`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Foto</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">NIM</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Angkatan</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Dokumen KTP</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <LoadingRows />
            ) : mahasiswa.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-10 text-center text-sm text-slate-500">
                  Belum ada data mahasiswa.
                </td>
              </tr>
            ) : (
              mahasiswa.map((m) => (
                <tr key={m.nim} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4">
                    {m.foto_mahasiswa ? (
                      <div className="relative w-12 h-12">
                        <Image
                          src={m.foto_mahasiswa}
                          alt={m.nama}
                          fill
                          className="rounded-full object-cover border border-slate-200"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-xs text-slate-400">
                        No Img
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-sm text-slate-900">{m.nim}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">{m.nama}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{m.angkatan}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm">
                    {m.foto_ktp ? (
                      <a
                        href={m.foto_ktp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:text-sky-800 font-medium underline inline-flex items-center gap-1"
                      >
                        Lihat KTP (Drive)
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Tidak ada file</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => onDetail(m)}
                        className="rounded-md border border-sky-300 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 active:scale-95 cursor-pointer"
                      >
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
