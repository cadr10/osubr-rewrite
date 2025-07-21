import type { GetServerSidePropsContext } from 'next';
import Layout from '../../components/Layout';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { options } from '../api/auth/[...nextauth]';
import { useState, useEffect } from 'react';

type User = {
  id: string;
  osuId: string;
  username: string;
  isAdmin: boolean;
  isBanned: boolean;
};


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, options);

  if (!session || session.user?.id !== process.env.SUPER_ADMIN_ID) {
    return {
      redirect: {
        destination: '/', 
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [osuIdToAdd, setOsuIdToAdd] = useState('');
  const [osuIdToBan, setOsuIdToBan] = useState('');
  const [message, setMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [dbMessage, setDbMessage] = useState('');


  const fetchUsers = async () => {
    try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        } else {
            const errorData = await res.json();
            setMessage(`Failed to fetch users: ${errorData.message}`);
        }
    } catch (error) {
        setMessage('An error occurred while fetching users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const admins = users.filter(u => u.isAdmin);
  const bannedUsers = users.filter(u => u.isBanned);


  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ osuId: osuIdToAdd, isAdmin: true }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
      setOsuIdToAdd('');
      fetchUsers();
    }
  };

  const handleToggleAdmin = async (osuId: string, isAdmin: boolean) => {
    setMessage('');
    const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ osuId, isAdmin: !isAdmin }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
        fetchUsers();
    }
  };
  
  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ osuId: osuIdToBan, isBanned: true }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
        setOsuIdToBan('');
        fetchUsers();
    }
  };

  const handleUnbanUser = async (osuId: string) => {
    setMessage('');
    const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ osuId, isBanned: false }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
        fetchUsers();
    }
  };

  const handleUpdateAll = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/populate/updateAll', { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Server responded with an error');
      }
      alert('All songs have been updated successfully!');
    } catch (error) {
      console.error('Failed to update all songs:', error);
      alert(`Failed to update all songs: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setDbMessage('');
    try {
      const res = await fetch('/api/db/export');
      if (!res.ok) throw new Error('Failed to export database.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setDbMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setDbMessage('');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setDbMessage('Please select a file to import.');
      return;
    }
    setIsImporting(true);
    setDbMessage('');
    const formData = new FormData();
    formData.append('backup', file);
    try {
      const res = await fetch('/api/db/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import backup.');
      setDbMessage('Import successful!');
    } catch (error) {
      console.error(error);
      setDbMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Layout>
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h1>Super Admin Panel</h1>
      <p>Welcome, <strong>{session?.user?.name}</strong>.</p>
      {message && <p style={{ fontWeight: 'bold' }}>{message}</p>}

      <hr style={{ margin: '2rem 0' }} />
      <section>
        <h2>Manage Admins</h2>
        <p>Grant admin privileges to a user or revoke them from an existing admin.</p>
        <form onSubmit={handleAddAdmin} style={{ marginBottom: '2rem' }}>
          <input type="text" placeholder="Enter Osu! ID to add as admin" value={osuIdToAdd} onChange={(e) => setOsuIdToAdd(e.target.value)} required style={{ marginRight: '1rem', padding: '0.5rem' }} />
          <button type="submit" style={{ padding: '0.5rem' }}>Add Admin</button>
        </form>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Osu! ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Username</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{admin.osuId}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{admin.username}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button onClick={() => handleToggleAdmin(admin.osuId, admin.isAdmin)}>
                      Revoke Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </section>

      {/* --- MANAGE BANS --- */}
      <hr style={{ margin: '2rem 0' }} />
      <section>
        <h2>Manage User Bans</h2>
        <p>Ban a user to prevent them from submitting new songs.</p>
        <form onSubmit={handleBanUser} style={{ marginBottom: '2rem' }}>
          <input type="text" placeholder="Enter Osu! ID to ban" value={osuIdToBan} onChange={(e) => setOsuIdToBan(e.target.value)} required style={{ marginRight: '1rem', padding: '0.5rem' }} />
          <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>Ban User</button>
        </form>
        
        <h3>Banned Users</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Osu! ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Username</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {bannedUsers.map((user) => (
              <tr key={user.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.osuId}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => handleUnbanUser(user.osuId)} style={{ padding: '0.5rem' }}>
                    Unban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <hr style={{ margin: '2rem 0' }} />
      <section>
        <h2>Song Management</h2>
        <p>This will update metadata (title, artist, BPM, etc.) for all songs in the database, leaving genres untouched.</p>
        <button onClick={handleUpdateAll} disabled={isUpdating} style={{ padding: '0.5rem' }}>{isUpdating ? 'Updating...' : 'Update All Songs'}</button>
      </section>
      
      <hr style={{ margin: '2rem 0' }} />
      <section>
        <h2>Database Management</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3>Export Database</h3>
          <p>Download a full JSON backup of the 'song' and 'outsong' tables.</p>
          <button onClick={handleExport} disabled={isExporting} style={{ padding: '0.5rem' }}>{isExporting ? 'Exporting...' : 'Export Database'}</button>
        </div>

        <div>
          <h3>Import Database</h3>
          <p><strong>Warning:</strong> This will delete all current songs and pending songs before importing data from the file.</p>
          <input type="file" accept=".json" onChange={handleFileChange} />
          <button onClick={handleImport} disabled={isImporting || !file} style={{ marginTop: '0.5rem', padding: '0.5rem' }}>{isImporting ? 'Importing...' : 'Import Backup'}</button>
        </div>
        
        {dbMessage && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{dbMessage}</p>}
      </section>
    </div>
    </Layout>
  );
}