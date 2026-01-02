/**
 * API client for communicating with the backend
 */

import axios from 'axios'
import { auth } from './auth'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task'
import type { RegisterRequest, LoginRequest, AuthResponse } from '@/types/user'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add authorization token to all requests
api.interceptors.request.use((config) => {
  const token = auth.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Authentication API
export const authAPI = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data)
    return response.data
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data)
    return response.data
  }
}

// Task API
export const taskAPI = {
  /**
   * Get all tasks for a user
   */
  getTasks: async (userId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/api/v1/${userId}/tasks`)
    return response.data
  },

  /**
   * Create a new task
   */
  createTask: async (userId: string, data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>(`/api/v1/${userId}/tasks`, data)
    return response.data
  },

  /**
   * Get a single task by ID
   */
  getTask: async (userId: string, taskId: number): Promise<Task> => {
    const response = await api.get<Task>(`/api/v1/${userId}/tasks/${taskId}`)
    return response.data
  },

  /**
   * Update a task
   */
  updateTask: async (userId: string, taskId: number, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<Task>(`/api/v1/${userId}/tasks/${taskId}`, data)
    return response.data
  },

  /**
   * Delete a task
   */
  deleteTask: async (userId: string, taskId: number): Promise<void> => {
    await api.delete(`/api/v1/${userId}/tasks/${taskId}`)
  },

  /**
   * Toggle task completion status
   */
  toggleComplete: async (userId: string, taskId: number): Promise<Task> => {
    const response = await api.patch<Task>(`/api/v1/${userId}/tasks/${taskId}/complete`)
    return response.data
  }
}

export default api
