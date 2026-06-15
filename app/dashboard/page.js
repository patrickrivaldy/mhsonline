"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // MFA States
  const [mfaFactors, setMfaFactors] = useState([]);
  const [mfaLevel, setMfaLevel] = useState("aal1");
  const [enrollData, setEnrollData] = useState(null); // { qrCode, secret, factorId }
  const [enrollCode, setEnrollCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState("");

  const fetchMfaFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setMfaFactors(data.totp || []);
      
      const { data: levelData, error: levelError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (levelError) throw levelError;
      setMfaLevel(levelData.currentLevel);
    } catch (err) {
      console.error("Gagal mengambil status MFA:", err.message);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.replace("/login");
        return;
      }
      
      // Check if MFA is required but not completed
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!mfaError && mfaData.currentLevel === 'aal1' && mfaData.nextLevel === 'aal2') {
        router.replace("/login");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
      
      // Fetch MFA factors
      await fetchMfaFactors();
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleEnrollMfa = async () => {
    setMfaLoading(true);
    setMfaError("");
    setMfaSuccess("");
    
    try {
      // Bersihkan faktor unverified yang menggantung terlebih dahulu jika ada
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (!factorsError && factorsData?.all) {
        const unverifiedFactors = factorsData.all.filter(f => f.status === "unverified");
        for (const factor of unverifiedFactors) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "MHS Online"
      });
      
      if (error) throw error;
      
      setEnrollData({
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id
      });
    } catch (err) {
      setMfaError(err.message);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyEnroll = async (e) => {
    e.preventDefault();
    if (!enrollCode || enrollCode.length !== 6) {
      setMfaError("Masukkan 6-digit kode OTP.");
      return;
    }
    
    setMfaLoading(true);
    setMfaError("");
    
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollData.factorId
      });
      
      if (challengeError) throw challengeError;
      
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollData.factorId,
        challengeId: challengeData.id,
        code: enrollCode
      });
      
      if (verifyError) throw verifyError;
      
      setMfaSuccess("MFA berhasil diaktifkan!");
      setEnrollData(null);
      setEnrollCode("");
      await fetchMfaFactors();
    } catch (err) {
      setMfaError(err.message || "Gagal memverifikasi kode OTP.");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleUnenrollMfa = async (factorId) => {
    if (!confirm("Apakah Anda yakin ingin menonaktifkan MFA? Akun Anda akan menjadi kurang aman.")) {
      return;
    }
    
    setMfaLoading(true);
    setMfaError("");
    setMfaSuccess("");
    
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      
      setMfaSuccess("MFA berhasil dinonaktifkan.");
      await fetchMfaFactors();
    } catch (err) {
      setMfaError(err.message);
    } finally {
      setMfaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Dashboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Selamat datang di panel kontrol Anda.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="flex-1 sm:flex-initial text-center px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-all active:scale-[0.98]"
            >
              Halaman Utama
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-xl transition-all active:scale-[0.98]"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Informasi Akun & MFA Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Informasi Akun */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Informasi Akun
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-3">
                <span className="text-sm font-medium text-gray-500">ID Pengguna</span>
                <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-0.5 rounded text-xs truncate max-w-[200px]">{user.id}</span>
              </div>
              {user.email && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-sm font-medium text-gray-500">Email</span>
                  <span className="text-sm text-gray-900 truncate max-w-[200px]">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-sm font-medium text-gray-500">Telepon/WA</span>
                  <span className="text-sm text-gray-900">{user.phone}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-3">
                <span className="text-sm font-medium text-gray-500">Provider</span>
                <span className="text-sm text-gray-900 capitalize bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded text-xs font-semibold">{user.app_metadata?.provider || "Unknown"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Terakhir Login</span>
                <span className="text-sm text-gray-900 text-xs sm:text-sm">
                  {new Date(user.last_sign_in_at).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Card Keamanan Tambahan / MFA */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Keamanan Tambahan (MFA)
              </h2>

              {mfaError && (
                <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {mfaError}
                </div>
              )}
              
              {mfaSuccess && (
                <div className="p-3 mb-4 text-xs text-green-600 bg-green-50 rounded-lg border border-green-100">
                  {mfaSuccess}
                </div>
              )}

              {/* Status Box */}
              <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Status Authenticator</span>
                  {mfaFactors.length > 0 ? (
                    <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Aktif (aal2)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-bold bg-gray-200 text-gray-800 rounded-full">
                      Tidak Aktif (aal1)
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  {mfaFactors.length > 0
                    ? "Sesi Anda dilindungi dengan autentikasi dua-faktor (MFA)."
                    : "Aktifkan autentikator dua-faktor (TOTP) untuk melindungi akun Anda dengan aplikasi seperti Google Authenticator."}
                </p>
              </div>

              {/* QR Code / Enrollment Form */}
              {enrollData && (
                <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/20 space-y-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-indigo-900 mb-3">Pindai QR Code di bawah dengan aplikasi Authenticator Anda:</p>
                    <div className="flex justify-center p-2 bg-white rounded-lg border inline-block mx-auto">
                      <img src={enrollData.qrCode} alt="MFA QR Code" className="w-48 h-48" />
                    </div>
                    <div className="mt-3 text-left">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Secret Key (Untuk input manual)</p>
                      <code className="text-xs text-indigo-700 break-all select-all font-mono font-semibold block bg-white border p-1 rounded mt-1">
                        {enrollData.secret}
                      </code>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyEnroll} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Masukkan 6-Digit Kode Verifikasi</label>
                      <input
                        type="text"
                        required
                        value={enrollCode}
                        onChange={(e) => setEnrollCode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="mt-1 block w-full px-3 py-2 text-center text-lg tracking-widest rounded-lg border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={mfaLoading}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-75"
                      >
                        {mfaLoading ? "Memverifikasi..." : "Verifikasi & Aktifkan"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEnrollData(null);
                          setEnrollCode("");
                          setMfaError("");
                        }}
                        className="py-2 px-3 border border-gray-200 bg-white text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              {!enrollData && (
                mfaFactors.length > 0 ? (
                  <button
                    onClick={() => handleUnenrollMfa(mfaFactors[0].id)}
                    disabled={mfaLoading}
                    className="w-full py-2.5 px-4 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-70"
                  >
                    {mfaLoading ? "Memproses..." : "Nonaktifkan Authenticator (MFA)"}
                  </button>
                ) : (
                  <button
                    onClick={handleEnrollMfa}
                    disabled={mfaLoading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center"
                  >
                    {mfaLoading ? "Memproses..." : "Aktifkan Authenticator (MFA)"}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
