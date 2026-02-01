/**
 * Profile Page Component
 * User profile management and settings
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiLock,
  FiSettings,
  FiDownload,
  FiTrash2,
  FiArrowLeft,
  FiSave,
  FiSun,
  FiMoon,
  FiMonitor,
  FiEdit3,
  FiFileText,
  FiFolder,
  FiTag,
  FiArchive,
  FiTrendingUp
} from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Preferences
  const [theme, setTheme] = useState('system');
  const [defaultNoteColor, setDefaultNoteColor] = useState('#ffffff');
  const [notesPerPage, setNotesPerPage] = useState(20);
  
  // Modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    fetchProfileData();
    fetchStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.get();
      const userData = response.data.user;
      setProfileData(userData);
      setName(userData.name);
      setBio(userData.bio || '');
      setTheme(userData.preferences?.theme || 'system');
      setDefaultNoteColor(userData.preferences?.defaultNoteColor || '#ffffff');
      setNotesPerPage(userData.preferences?.notesPerPage || 20);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await profileAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await profileAPI.update({ name, bio });
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      await profileAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await profileAPI.updatePreferences({
        theme,
        defaultNoteColor,
        notesPerPage: parseInt(notesPerPage)
      });
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await profileAPI.exportData();
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    try {
      await profileAPI.deleteAccount(deletePassword);
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'preferences', label: 'Preferences', icon: FiSettings },
    { id: 'stats', label: 'Statistics', icon: FiTrendingUp }
  ];

  const colorOptions = [
    '#ffffff', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3',
    '#e0e7ff', '#fed7d7', '#d1fae5', '#e9d5ff', '#cffafe'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/dashboard"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-indigo-600">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
                    <p className="text-gray-500">{profileData?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <FiSave className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      minLength={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      minLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <FiLock className="w-4 h-4" />
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </form>

                <hr className="border-gray-200" />

                {/* Danger Zone */}
                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <form onSubmit={handleUpdatePreferences} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Theme
                  </label>
                  <div className="flex gap-4">
                    {[
                      { value: 'light', label: 'Light', icon: FiSun },
                      { value: 'dark', label: 'Dark', icon: FiMoon },
                      { value: 'system', label: 'System', icon: FiMonitor }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                          theme === option.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Default Note Color
                  </label>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setDefaultNoteColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          defaultNoteColor === color
                            ? 'border-indigo-500 ring-2 ring-indigo-200'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes Per Page
                  </label>
                  <select
                    value={notesPerPage}
                    onChange={(e) => setNotesPerPage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    Export Data
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <FiSave className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <FiFileText className="w-6 h-6 text-indigo-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats.totalNotes}</p>
                    <p className="text-sm text-gray-500">Total Notes</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <FiEdit3 className="w-6 h-6 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats.notesThisMonth}</p>
                    <p className="text-sm text-gray-500">This Month</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <FiFileText className="w-6 h-6 text-amber-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats.totalWords.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Words</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <FiTag className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{profileData?.stats?.totalTags || 0}</p>
                    <p className="text-sm text-gray-500">Tags</p>
                  </div>
                </div>

                {stats.mostUsedTags && stats.mostUsedTags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Most Used Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.mostUsedTags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                          style={{
                            backgroundColor: tag.color + '20',
                            color: tag.color
                          }}
                        >
                          <FiTag className="w-3 h-3" />
                          {tag.name}
                          <span className="text-xs opacity-70">({tag.count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stats.notesByDay && stats.notesByDay.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Activity (Last 30 Days)</h3>
                    <div className="h-40 flex items-end gap-1">
                      {stats.notesByDay.map((day, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-indigo-500 rounded-t"
                          style={{
                            height: `${Math.max(10, (day.count / Math.max(...stats.notesByDay.map(d => d.count))) * 100)}%`
                          }}
                          title={`${day._id}: ${day.count} notes`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Account Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeletePassword('');
          }}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          message={
            <div className="space-y-4">
              <p>This action cannot be undone. All your data will be permanently deleted.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Password"
                />
              </div>
            </div>
          }
          confirmText="Delete Account"
          confirmStyle="danger"
        />
      </div>
    </div>
  );
};

export default Profile;
