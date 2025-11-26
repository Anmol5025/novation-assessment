import { create } from 'zustand';
import { documentsAPI } from '../lib/api';

const useDocumentStore = create((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,

  fetchDocuments: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentsAPI.getAll(params);
      set({
        documents: response.data.documents,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch documents', isLoading: false });
    }
  },

  fetchDocument: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentsAPI.getById(id);
      set({ currentDocument: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch document', isLoading: false });
    }
  },

  uploadDocument: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentsAPI.upload(formData);
      set((state) => ({
        documents: [response.data.document, ...state.documents],
        isLoading: false,
      }));
      return { success: true, document: response.data.document };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Upload failed', isLoading: false });
      return { success: false, error: error.response?.data?.error };
    }
  },

  updateDocument: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentsAPI.update(id, data);
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc._id === id ? response.data.document : doc
        ),
        currentDocument: response.data.document,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Update failed', isLoading: false });
      return { success: false };
    }
  },

  deleteDocument: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await documentsAPI.delete(id);
      set((state) => ({
        documents: state.documents.filter((doc) => doc._id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Delete failed', isLoading: false });
      return { success: false };
    }
  },

  analyzeDocument: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentsAPI.analyze(id);
      set((state) => ({
        currentDocument: {
          ...state.currentDocument,
          aiInsights: response.data.insights,
        },
        isLoading: false,
      }));
      return { success: true, insights: response.data.insights };
    } catch (error) {
      set({ error: error.response?.data?.error || 'Analysis failed', isLoading: false });
      return { success: false };
    }
  },
}));

export default useDocumentStore;
