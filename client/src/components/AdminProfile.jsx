import React, { useState, useEffect } from "react";
import axios from "axios";
import { Avatar, Snackbar, Alert } from "@mui/material";
import { FaUser, FaSave, FaCamera, FaEnvelope, FaLock, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../config/cloudinary";
import config from '../config';

function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    pin: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setErrorMessage("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${config.apiUrl}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        if (response && response.data) {
          setAdmin(response.data);
          setFormData({
            firstname: response.data.firstname || "",
            lastname: response.data.lastname || "",
            email: response.data.email || "",
            pin: "",
            image: null,
          });
          setImagePreview(response.data.image);
        } else {
          setErrorMessage("Failed to fetch admin data.");
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setErrorMessage("Failed to fetch admin data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      let imageUrl = admin?.image;

      if (formData.image && formData.image instanceof File) {
        imageUrl = await uploadToCloudinary(formData.image);
      }

      const updateData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        image: imageUrl,
      };

      if (formData.pin) {
        updateData.pin = formData.pin;
      }

      const token = localStorage.getItem("token");
      await axios.put(`${config.apiUrl}/api/admin`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setErrorMessage("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Retrieving admin profile...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto font-sans text-slate-800 space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900">Admin Account Profile</h2>
        <p className="text-slate-500 text-sm mt-0.5">Modify administrator credentials and details.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Avatar details selection */}
        <div className="md:col-span-4 flex flex-col items-center space-y-4">
          <div className="relative group cursor-pointer">
            <div className="w-28 h-28 rounded-full border-2 border-slate-250 overflow-hidden shadow-sm flex items-center justify-center bg-slate-50 relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Admin profile preview" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-slate-400 text-3xl" />
              )}
            </div>
            
            {/* Upload trigger label overlay camera */}
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="admin-photo-input"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="admin-photo-input" className="absolute bottom-1 right-1 bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-full cursor-pointer shadow border border-slate-800 transition-all hover:scale-105 active:scale-95">
              <FaCamera className="text-xs" />
            </label>
          </div>
          <div className="text-center">
            <span className="font-bold text-slate-900 text-sm block">
              {formData.firstname || "Admin"} {formData.lastname || "User"}
            </span>
            <span className="text-slate-400 text-[11px] block mt-0.5">
              Administrator Profile
            </span>
          </div>
        </div>

        {/* Right column: Fields update form */}
        <div className="md:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block uppercase">First Name</label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block uppercase">Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block uppercase">Email Address (Read-only)</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                <input
                  type="email"
                  readOnly
                  value={formData.email}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-100 font-semibold cursor-not-allowed text-slate-450"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block uppercase">New Security PIN (Optional)</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                <input
                  type="password"
                  name="pin"
                  placeholder="Leave blank to keep existing PIN"
                  value={formData.pin}
                  onChange={handleInputChange}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-sm active:scale-97 disabled:opacity-50"
              >
                <FaSave />
                <span>{saving ? "Saving Profile..." : "Save Changes"}</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold shadow flex items-center gap-2 z-55"
          >
            <FaCheckCircle className="text-emerald-500 text-sm" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-xs font-semibold shadow flex items-center gap-2 z-55"
          >
            <FaExclamationCircle className="text-red-500 text-sm" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default AdminProfile;
