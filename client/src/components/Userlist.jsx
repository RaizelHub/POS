import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Divider,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { FaUserCircle, FaSearch, FaTimes, FaMoneyBillWave, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import config from '../config';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUserDetails, setOpenUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState({ paid: [], payLater: [] });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/users`);
        const filteredUsers = response.data.filter((user) => !user.isAdmin);
        setUsers(filteredUsers);
      } catch (error) {
        setError(error.message);
        setSnackbarMessage("Error fetching users.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const fetchTransactionHistory = async (userId) => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/${userId}/transactions`);
      setTransactions({ paid: response.data.paid, payLater: response.data.payLater });
    } catch (error) {
      console.error("Error fetching transaction history:", error.message);
      setTransactions({ paid: [], payLater: [] });
    }
  };

  const handleAssignStation = async (userId, newStation) => {
    try {
      const response = await axios.put(`${config.apiUrl}/api/user/${userId}`, {
        station: newStation
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, station: newStation } : user
        )
      );
      
      setSnackbarSeverity("success");
      setSnackbarMessage(`Successfully assigned cashier to ${newStation === 'Unassigned' ? 'Standby' : newStation}.`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error assigning station:", error.message);
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to update workstation assignment.");
      setSnackbarOpen(true);
    }
  };

  const handleOpenUserDetails = async (user) => {
    setSelectedUser(user);
    setOpenUserDetails(true);
    await fetchTransactionHistory(user._id);
  };

  const handleCloseUserDetails = () => {
    setOpenUserDetails(false);
    setTransactions({ paid: [], payLater: [] });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading cashiers roster...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800 space-y-6">
      
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cashier Accounts</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage store registers and cashier sales records.</p>
        </div>

        {/* Search Input field */}
        <div className="relative max-w-xs w-full">
          <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search cashier profile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none rounded-lg text-xs bg-white font-semibold transition-all"
          />
        </div>
      </div>

      {/* Roster Cards list Grid */}
      <AnimatePresence mode="wait">
        {filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white border border-slate-200 rounded-xl space-y-3"
          >
            <FaUserCircle className="text-4xl text-slate-350 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">No Cashiers Found</h4>
              <p className="text-slate-450 text-xs max-w-xs mx-auto">There are no registered cashiers matching your query details.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {filteredUsers.map((user) => (
              <motion.div
                key={user._id}
                variants={itemVariants}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-sm hover:shadow transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-center">
                    {user.image ? (
                      <img src={user.image.startsWith('http') ? user.image : `${config.apiUrl}/${user.image}`} alt={user.firstname} className="w-full h-full object-cover" />
                    ) : (
                      <FaUserCircle className="text-slate-400 text-xl" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 text-sm block truncate">
                      {user.firstname} {user.lastname}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                      {user.email}
                    </span>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                      user.isVerified ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-650 border border-red-100'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-left border-t border-slate-100 pt-3 mt-1">
                  <span className="font-extrabold text-slate-450 uppercase text-[9px] tracking-wider">Assigned POS Workstation</span>
                  <select
                    value={user.station || 'Unassigned'}
                    onChange={(e) => handleAssignStation(user._id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 rounded-lg py-1.5 px-2.5 outline-none font-semibold text-xs text-slate-700 transition-all cursor-pointer"
                  >
                    <option value="Unassigned">Standby / Unassigned</option>
                    <option value="POS-01">Register Station 01 (POS-01)</option>
                    <option value="POS-02">Register Station 02 (POS-02)</option>
                    <option value="POS-03">Register Station 03 (POS-03)</option>
                    <option value="POS-04">Register Station 04 (POS-04)</option>
                  </select>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-end">
                  <button
                    onClick={() => handleOpenUserDetails(user)}
                    className="px-3 py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-all active:scale-97"
                  >
                    View Cash Logs
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed cash logs Dialog popup */}
      <Dialog
        open={openUserDetails}
        onClose={handleCloseUserDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          },
        }}
      >
        {selectedUser && (
          <>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-white">
                  {selectedUser.image ? (
                    <img src={selectedUser.image.startsWith('http') ? selectedUser.image : `${config.apiUrl}/${selectedUser.image}`} alt={selectedUser.firstname} className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle className="text-slate-400 text-lg" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedUser.firstname} {selectedUser.lastname}
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleCloseUserDetails}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <DialogContent>
              <div className="space-y-6 py-2">
                <h4 className="font-bold text-slate-800 text-sm">Register Settlement Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Paid list card */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
                    <h5 className="font-bold text-emerald-600 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <FaMoneyBillWave />
                      <span>Settle Paid Items</span>
                    </h5>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin divide-y divide-slate-100">
                      {transactions.paid.length > 0 ? (
                        transactions.paid.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 text-xs">
                            <span className="font-semibold text-slate-700">{item.name}</span>
                            <span className="font-bold text-slate-900">₱{item.price.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">No settled paid items.</div>
                      )}
                    </div>
                  </div>

                  {/* Pay later list card */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
                    <h5 className="font-bold text-amber-600 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <FaClock />
                      <span>Log Pay Later Credit</span>
                    </h5>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin divide-y divide-slate-100">
                      {transactions.payLater.length > 0 ? (
                        transactions.payLater.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 text-xs">
                            <span className="font-semibold text-slate-700">{item.name}</span>
                            <span className="font-bold text-slate-900">₱{item.price.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">No logged unpaid items.</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </DialogContent>

            <DialogActions className="p-4 border-t border-slate-100">
              <button
                onClick={handleCloseUserDetails}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 text-xs font-bold transition-all active:scale-95"
              >
                Close Logs
              </button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </div>
  );
}

export default UserList;
