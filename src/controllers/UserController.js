import { db } from '../db/index.js';

// Update user info
export const update = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email,updated_by,updated_at } = req.body;

    try {
        
        if (!id) {
            return res.status(404).json({ message: "User doesn't exist!" });
        }

        const [result] = await db.query(
            'UPDATE users SET first_name = ?, last_name = ?, email = ?, updated_by = ? ,updated_at=?WHERE id = ?',
            [first_name, last_name, email, updated_by,updated_at, id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'User updated successfully!' });
        } else {
            res.status(400).json({ message: 'No changes made' });
        }
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user' });
    }
};