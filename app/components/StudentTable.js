function LoadingRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index}>
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
        <div className="fb-shimmer ml-auto h-8 w-28" />
      </td>
    </tr>
  ));
}

export default function StudentTable({ mahasiswa, loading = false, onEdit, onDelete }) {
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
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">NIM</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Angkatan</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <LoadingRows />
            ) : mahasiswa.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-5 py-10 text-center text-sm text-slate-500">
                  Belum ada data mahasiswa.
                </td>
              </tr>
            ) : (
              mahasiswa.map((m) => (
                <tr key={m.nim} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-sm text-slate-900">{m.nim}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900">{m.nama}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{m.angkatan}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(m.nim)}
                        className="border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(m.nim)}
                        className="border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Hapus
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
