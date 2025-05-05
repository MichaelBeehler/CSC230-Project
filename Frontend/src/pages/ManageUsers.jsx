import { useEffect, useState } from "react";
import axios from "axios";
const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

function ManageUsers () {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        axios.get(`${backendUrl}/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }).then(res => {
            setUsers(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        await axios.delete(`${backendUrl}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(u => u._id !== id));
    };

    const updateRole = async (id, newRole) => {
        await axios.put(`${backendUrl}/users/${id}`, { role: newRole }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div className="admin-panel">
            <h2>User Management</h2>
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Change Role</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <select value={user.role} onChange={(e) => updateRole(user._id, e.target.value)}>
                                    <option value="guest">Guest</option>
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="editor">Editor</option>
                                </select>
                            </td>
                            <td>
                                <button onClick={() => deleteUser(user._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default ManageUsers;
