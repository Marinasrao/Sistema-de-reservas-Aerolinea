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
  <div className={styles.page}>
    <div className={styles.card}>

      <div className={styles.header}>
        <h2 className={styles.title}>Administradores</h2>

        <button
          className={styles.addButton}
          onClick={handleCreate}
        >
          ➕ Agregar administrador
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <AdminUsersList admins={admins} onEdit={handleEdit} />
      </div>

    </div>
  </div>
);
};
export default AdminUsersPage;