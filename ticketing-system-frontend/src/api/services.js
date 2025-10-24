import api from './axios';

// Auth services
export const authService = {
    register: async (data) => {
        const response = await api.post('/register', data);
        return response.data;
    },

    login: async (data) => {
        const response = await api.post('/login', data);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/logout');
        return response.data;
    },

    me: async () => {
        const response = await api.get('/me');
        return response.data;
    },
};

// Ticket services
export const ticketService = {
    getAll: async (filters = {}) => {
        const response = await api.get('/tickets', { params: filters });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    create: async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        const response = await api.post('/tickets', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        formData.append('_method', 'PUT');

        const response = await api.post(`/tickets/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/tickets/${id}`);
        return response.data;
    },
};

// Comment services
export const commentService = {
    getByTicket: async (ticketId) => {
        const response = await api.get(`/tickets/${ticketId}/comments`);
        return response.data;
    },

    create: async (ticketId, data) => {
        const response = await api.post(`/tickets/${ticketId}/comments`, data);
        return response.data;
    },
};

// Chat services
export const chatService = {
    getByTicket: async (ticketId) => {
        const response = await api.get(`/tickets/${ticketId}/chats`);
        return response.data;
    },

    send: async (ticketId, data) => {
        const response = await api.post(`/tickets/${ticketId}/chats`, data);
        return response.data;
    },
};
