import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MasterUserState {
  isMasterUser: boolean;
  authenticate: (secretKey: string) => boolean;
  logout: () => void;
}

const MASTER_SECRET_KEY = 'labubu_master_2024'; // In production, this should be env variable

export const useMasterUserStore = create<MasterUserState>()(
  persist(
    (set) => ({
      isMasterUser: false,
      authenticate: (secretKey: string) => {
        const isValid = secretKey === MASTER_SECRET_KEY;
        set({ isMasterUser: isValid });
        return isValid;
      },
      logout: () => set({ isMasterUser: false }),
    }),
    {
      name: 'master-user-storage',
    }
  )
);