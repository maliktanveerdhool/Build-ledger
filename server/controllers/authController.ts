import { Request, Response } from 'express';
import { getUsers, saveUsers, UserRecord } from '../utils/jsonStore';
import { User, AuthResponse } from '../../src/types';

function sanitizeUser(record: UserRecord): User {
  const { passwordHash, ...user } = record;
  return user;
}

export function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const userRecord = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!userRecord || userRecord.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = sanitizeUser(userRecord);
    const token = `token_${user.id}_${Date.now()}`;

    const response: AuthResponse = { token, user };
    return res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to process login request.' });
  }
}

export function register(req: Request, res: Response) {
  try {
    const { name, email, password, role, company, clientId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newUserRecord: UserRecord = {
      id: `usr_${Date.now().toString(36)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password,
      role: 'user', // Public registration always creates standard user accounts
      company: company?.trim() || undefined,
      clientId: clientId || undefined,
      createdAt: new Date().toISOString()
    };

    saveUsers([...users, newUserRecord]);

    const user = sanitizeUser(newUserRecord);
    const token = `token_${user.id}_${Date.now()}`;

    const response: AuthResponse = { token, user };
    return res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register new account.' });
  }
}

export function getProfile(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const userIdMatch = token.match(/^token_(usr_[a-z0-9_]+)_/);

    if (!userIdMatch) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }

    const userId = userIdMatch[1];
    const users = getUsers();
    const userRecord = users.find(u => u.id === userId);

    if (!userRecord) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.json(sanitizeUser(userRecord));
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}

export function getAllUsers(req: Request, res: Response) {
  try {
    const users = getUsers().map(sanitizeUser);
    return res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Failed to fetch user directory.' });
  }
}

export function updateUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ error: 'Role must be either "admin" or "user".' });
    }

    const users = getUsers();
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    users[index] = { ...users[index], role };
    saveUsers(users);

    return res.json(sanitizeUser(users[index]));
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
}

export function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const users = getUsers();
    const filtered = users.filter(u => u.id !== id);

    if (users.length === filtered.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    saveUsers(filtered);
    return res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user account.' });
  }
}
