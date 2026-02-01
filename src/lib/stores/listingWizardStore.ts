import { create } from 'zustand'
import { type ListingInput } from '@/lib/validations/listing'

interface ListingWizardState {
  step: number
  data: Partial<ListingInput> & {
    photos?: Array<{ file: File; preview: string }>
  }
  setStep: (step: number) => void
  updateData: (data: Partial<ListingWizardState['data']>) => void
  reset: () => void
}

const initialState = {
  step: 1,
  data: {},
}

export const useListingWizardStore = create<ListingWizardState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  updateData: (newData) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),
  reset: () => set(initialState),
}))
