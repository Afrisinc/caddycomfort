import { create } from 'zustand';
import { wishlistApi } from '@/lib/api';

interface WishlistStore {
  ids: Set<string>;
  loaded: boolean;
  pending: Set<string>;
  load: () => Promise<void>;
  reset: () => void;
  setSaved: (productId: string, saved: boolean) => void;
  toggle: (productId: string) => Promise<boolean>;
}

const withId = (set: Set<string>, id: string, present: boolean) => {
  const next = new Set(set);
  if (present) next.add(id);
  else next.delete(id);
  return next;
};

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  ids: new Set(),
  loaded: false,
  pending: new Set(),

  load: async () => {
    try {
      const items = await wishlistApi.getAll();
      set({ ids: new Set(items.map((item) => item.productId)), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  reset: () => set({ ids: new Set(), loaded: false, pending: new Set() }),

  setSaved: (productId, saved) => set((state) => ({ ids: withId(state.ids, productId, saved) })),

  toggle: async (productId) => {
    const { ids, pending } = get();
    if (pending.has(productId)) return ids.has(productId);
    const saved = !ids.has(productId);

    set((state) => ({
      ids: withId(state.ids, productId, saved),
      pending: withId(state.pending, productId, true),
    }));
    try {
      if (saved) await wishlistApi.add(productId);
      else await wishlistApi.removeByProductId(productId);
      return saved;
    } catch (error) {
      set((state) => ({ ids: withId(state.ids, productId, !saved) }));
      throw error;
    } finally {
      set((state) => ({ pending: withId(state.pending, productId, false) }));
    }
  },
}));
