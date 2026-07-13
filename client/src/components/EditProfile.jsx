import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSave, FaCamera, FaEnvelope, FaLock, FaCheckCircle, FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';
import { uploadToCloudinary } from '../config/cloudinary';
import config from '../config';

function EditProfile() {
  const [user, setUser] = useState({
    firstname: '',
    lastname: '',
    email: '',
    image: '',
  });
  const [previewImage, setPreviewImage] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login-selection');
        return;
      }

      try {
        const response = await axios.get(`${config.apiUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUser = response.data;
        setUser(fetchedUser);
        setPreviewImage(fetchedUser.image || '');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please log in again.');
        setLoading(false);
        navigate('/login-selection');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setUser((prevUser) => ({ ...prevUser, image: file }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in. Please log in and try again.');
      setSaving(false);
      return;
    }

    let imageUrl = user.image;
    if (user.image instanceof File) {
      try {
        imageUrl = await uploadToCloudinary(user.image);
      } catch (err) {
        setError('Image upload failed. Please try again.');
        setSaving(false);
        return;
      }
    }

    const payload = {
      firstname: user.firstname,
      lastname: user.lastname,
      pin: pin,
      image: imageUrl,
    };

    try {
      const response = await axios.put(`${config.apiUrl}/api/user/me`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = response.data.user;
      setUser(updatedUser);
      setPreviewImage(updatedUser.image || '');
      setSuccess('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTimeout(() => navigate('/scan'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3 min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Retrieving cashier profile settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Back and title bar */}
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-slate-100 p-2 rounded-lg text-slate-550 hover:text-slate-800 transition-all border border-slate-200"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Cashier Profile</h2>
            <p className="text-[10px] text-slate-400">Configure personal account details and photo.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Picture Upload Grid */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border border-slate-250 overflow-hidden shadow-sm flex items-center justify-center bg-slate-50 relative">
                {previewImage ? (
                  <img src={previewImage} alt="Cashier Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-slate-400 text-2xl" />
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                id="cashier-photo-input"
              />
              <label htmlFor="cashier-photo-input" className="absolute bottom-0.5 right-0.5 bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-full cursor-pointer shadow border border-slate-800 transition-all hover:scale-105 active:scale-95">
                <FaCamera className="text-[10px]" />
              </label>
            </div>
          </div>

          {/* Core Text Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block uppercase">First Name</label>
              <input
                type="text"
                name="firstname"
                required
                value={user.firstname}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-slate-200 focus:border-slate-450 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block uppercase">Last Name</label>
              <input
                type="text"
                name="lastname"
                required
                value={user.lastname}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-slate-200 focus:border-slate-450 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 block uppercase">Email Address (Read-only)</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
              <input
                type="email"
                readOnly
                value={user.email}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs bg-slate-100 font-semibold cursor-not-allowed text-slate-450"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 block uppercase">New Cashier PIN (Optional)</label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
              <input
                type="password"
                name="pin"
                placeholder="Leave blank to keep existing PIN"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val) && val.length <= 6) setPin(val);
                }}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-slate-450 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 text-xs font-bold transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <FaSave />
              <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>

        </form>

      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold shadow flex items-center gap-2 z-55"
          >
            <FaCheckCircle className="text-emerald-500 text-sm" />
            <span>{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-xs font-semibold shadow flex items-center gap-2 z-55"
          >
            <FaExclamationCircle className="text-red-500 text-sm" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default EditProfile;
