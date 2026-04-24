import React, { useEffect, useRef, useState, useContext } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { AuthContext } from "../context/auth-context";
import { Pencil, X, KeyRound, Check } from "lucide-react";

const BRANCHES = ["CSE", "ECE", "ME", "CE", "EE", "IT", "Other"];
const YEARS = [1, 2, 3, 4, 5];

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { setUser: setAuthUser } = useContext(AuthContext);

  /* ── Edit profile state ────────────── */
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", branch: "", year: "" });
  const [saving, setSaving] = useState(false);

  /* ── Change password state ─────────── */
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPw, setChangingPw] = useState(false);

  /* ── Fetch profile ─────────────────── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile");
        setUser(res.data.user);
        setAuthUser(res.data.user);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setAuthUser]);

  /* ── Upload profile pic ────────────── */
  const handleProfilePicUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePic", file);
    try {
      setUploading(true);
      const res = await API.put("/profile", formData);
      setUser(res.data.user);
      setAuthUser(res.data.user);
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  /* ── Open edit mode ────────────────── */
  const openEdit = () => {
    setEditForm({
      name:   user.name   || "",
      phone:  user.phone  || "",
      branch: user.branch || "",
      year:   user.year   || ""
    });
    setEditing(true);
  };

  /* ── Save profile edits ────────────── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return toast.error("Name is required");
    try {
      setSaving(true);
      const res = await API.put("/profile", editForm);
      setUser(res.data.user);
      setAuthUser(res.data.user);
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* ── Change password ───────────────── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword)
      return toast.error("All fields are required");
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return toast.error("New passwords do not match");
    if (pwForm.newPassword.length < 6)
      return toast.error("Password must be at least 6 characters");
    try {
      setChangingPw(true);
      await API.put("/profile/change-password", {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword
      });
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPwForm(false);
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Profile not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col sm:flex-row gap-6 items-center">
          <div className="relative group">
            {user.profilePic?.url ? (
              <img
                src={`${user.profilePic.url}?t=${Date.now()}`}
                alt="profile"
                className="w-24 h-24 rounded-full object-cover border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0)}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute inset-0 bg-black/40 text-white text-sm rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Change"}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              hidden
              onChange={(e) => handleProfilePicUpload(e.target.files[0])}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{user.role}</span>
              {user.isVerified && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Verified</span>
              )}
              {user.is_blocked && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Blocked</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Profile Details / Edit Form ─────────── */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Profile Details</h2>
            {!editing && (
              <button
                onClick={openEdit}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Pencil size={14} /> Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Branch</label>
                  <select
                    value={editForm.branch}
                    onChange={(e) => setEditForm((f) => ({ ...f, branch: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select branch</option>
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Year</label>
                  <select
                    value={editForm.year}
                    onChange={(e) => setEditForm((f) => ({ ...f, year: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select year</option>
                    {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  <Check size={15} /> {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ProfileItem label="Roll Number" value={user.roll_no || "—"} />
              <ProfileItem label="Branch" value={user.branch || "—"} />
              <ProfileItem label="Year" value={user.year ? `Year ${user.year}` : "—"} />
              <ProfileItem label="Phone" value={user.phone || "—"} />
              <ProfileItem label="Joined On" value={new Date(user.createdAt).toLocaleDateString()} />
              <ProfileItem label="Last Updated" value={new Date(user.updatedAt).toLocaleDateString()} />
            </div>
          )}
        </div>

        {/* ── Change Password ─────────────────────── */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Security</h2>
            {!showPwForm && (
              <button
                onClick={() => setShowPwForm(true)}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <KeyRound size={14} /> Change Password
              </button>
            )}
          </div>

          {showPwForm ? (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              {[
                { key: "oldPassword", label: "Current Password" },
                { key: "newPassword", label: "New Password" },
                { key: "confirmPassword", label: "Confirm New Password" }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-sm text-gray-500 mb-1 block">{label}</label>
                  <input
                    type="password"
                    value={pwForm[key]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={changingPw}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  <Check size={15} /> {changingPw ? "Saving..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPwForm(false); setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  <X size={15} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-500">Keep your account secure with a strong password.</p>
          )}
        </div>

      </div>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default Profile;
