import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUsersList from '../components/AdminUsersList';
import { getAdmins } from '../services/adminUsersService';
import styles from './AdminUsersPage.module.css';

const AdminUsersPage = () => {
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    const data = await getAdmins();
    setAdmins(Array.isArray(data) ? data : []);
  };

  const handleCreate = () => {
    navigate('/admin/admin-user', {
      state: { mode: 'create' }
    });
  };

 
const handleEdit = (admin) => {
  navigate(`/admin/admin-user/${admin.id}`);
};

  

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Administradores</h2>
      </div>

      <button
        onClick={handleCreate}
        style={{
          padding: '1rem',
          marginBottom: '1rem',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        ➕ Agregar administrador
      </button>

      <div className={styles.tableWrapper}>
        <AdminUsersList admins={admins} onEdit={handleEdit} />
      </div>
    </div>
  );
};

export default AdminUsersPage;
