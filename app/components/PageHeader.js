export default function PageHeader({ totalMahasiswa }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-sky-700">Dashboard Akademik</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Data Mahasiswa</h1>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
        <div className="border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{totalMahasiswa}</p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sumber</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">Supabase</p>
        </div>
      </div>
    </header>
  );
}
