import pool from '../db.js';
import { verify_token } from './verify.js';

export default async function handler(req, res) {
    switch (req.method) {
        case 'POST':
            verify_token(req, res, async () => await createTask(req, res));
            break;
        case 'GET':
            verify_token(req, res, async () => await getTasks(req, res));
            break;
        case 'PUT':
            verify_token(req, res, async () => await updateTask(req, res));
            break;
        case 'DELETE':
            verify_token(req, res, async () => await deleteTask(req, res));
            break;
        case 'PATCH':
            verify_token(req, res, async () => await completeTask(req, res)); 
            break;
        default:
            res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE', 'PATCH']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}


// Create a Task
async function createTask(req, res) {
    verify_token(req, res, async () => {
        const { task_name, task_due_date, task_due_time, task_priority } = req.body;

        if (!task_name) {
            return res.status(400).json({ message: 'Task name is required!' });
        }

        try {
            const userId = req.user.userId;

            const result = await pool.query(
                'INSERT INTO tasks (user_id, task_name, task_due_date, task_due_time, task_priority) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [userId, task_name, task_due_date, task_due_time, task_priority]
            );

            res.status(201).json({ message: 'Task created successfully', task: result.rows[0] });
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    });
}

// Get All Tasks
async function getTasks(req, res) {
    verify_token(req, res, async () => {
        try {
            const userId = req.user.userId;

            const result = await pool.query(
                'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );

            res.status(200).json({ tasks: result.rows });
        } catch (error) {
            console.error('Error retrieving tasks:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    });
}

// Update a Task
async function updateTask(req, res) {
    const { id, task_name, task_due_date, task_due_time, task_priority, task_completed } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Task ID is required!' });
    }

    try {
        const userId = req.user.userId;

        const result = await pool.query(
            'UPDATE tasks SET task_name = $1, task_due_date = $2, task_due_time = $3, task_priority = $4, task_completed = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *',
            [task_name, task_due_date, task_due_time, task_priority, task_completed, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found or you do not have permission to update it' });
        }

        res.status(200).json({ message: 'Task updated successfully', task: result.rows[0] });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}


// Delete a Task
async function deleteTask(req, res) {
    verify_token(req, res, async () => {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Task ID is required!' });
        }

        try {
            const userId = req.user.userId;

            const result = await pool.query(
                'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Task not found or you do not have permission to delete it' });
            }

            res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    });
}


// Complete a Task
async function completeTask(req, res) {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Task ID is required!' });
    }

    try {
        const userId = req.user.userId;

        const result = await pool.query(
            'UPDATE tasks SET task_completed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found or you do not have permission to complete it' });
        }

        res.status(200).json({ message: 'Task marked as completed', task: result.rows[0] });
    } catch (error) {
        console.error('Error completing task:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
