function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClassName = 'mt-2 h-11 w-full border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100';

export default function StudentForm({
  nim,
  nama,
  angkatan,
  loading,
  isEditing,
  onNimChange,
  onNamaChange,
  onAngkatanChange,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">
          {isEditing ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}
        </h2>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1fr_1.4fr_0.8fr_auto] lg:items-end">
        <Field label="NIM">
          <input
            type="text"
            value={nim}
            onChange={(e) => onNimChange(e.target.value)}
            className={inputClassName}
            placeholder="23001"
          />
        </Field>

        <Field label="Nama Lengkap">
          <input
            type="text"
            value={nama}
            onChange={(e) => onNamaChange(e.target.value)}
            className={inputClassName}
            placeholder="Budi Santoso"
          />
        </Field>

        <Field label="Angkatan">
          <input
            type="number"
            value={angkatan}
            onChange={(e) => onAngkatanChange(e.target.value)}
            className={inputClassName}
            placeholder="2024"
          />
        </Field>

        <div className="flex min-w-48 gap-2">
          <button
            type="submit"
            disabled={loading}
            className="h-11 flex-1 bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Tambah'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="h-11 border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
