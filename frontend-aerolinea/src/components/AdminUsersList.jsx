import React from "react";
import styles from "../pages/AdminUsersPage.module.css";

const AdminUsersList = ({ admins, onEdit }) => {
  if (!admins.length) {
    return <p>No hay administradores cargados.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {admins.map(admin => (
          <tr key={admin.id}>
            <td>{admin.firstName} {admin.lastName}</td>
            <td>{admin.email}</td>
            <td>
              <div className={styles.actions}>
                <button
                  className={styles.btnEdit}
                  onClick={() => onEdit(admin)}
                >
                  Editar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminUsersList;
