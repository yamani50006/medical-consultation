import { create } from "zustand";

import { ConsultationStatus, ConsultationFilter } from "@/domain/entities/Consultation";

type ConsultationFiltersState = {
  activeFilter: ConsultationFilter;
  selectedStatus: ConsultationStatus | "all";
  setActiveFilter: (filter: ConsultationFilter) => void;
  setSelectedStatus: (status: ConsultationStatus | "all") => void;
  reset: () => void;
};

export const useConsultationFiltersStore = create<ConsultationFiltersState>((set) => ({
  activeFilter: "all",
  selectedStatus: "all",
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  reset: () => set({ activeFilter: "all", selectedStatus: "all" })
}));
