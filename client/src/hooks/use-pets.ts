import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertPet, type Pet, type Food } from "@shared/schema";
import { z } from "zod";

// Fetch user's pets
export function usePets() {
  return useQuery({
    queryKey: [api.pets.get.path],
    queryFn: async () => {
      const res = await fetch(api.pets.get.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return null; // Not logged in
        throw new Error("Failed to fetch pets");
      }
      return api.pets.get.responses[200].parse(await res.json());
    },
  });
}

// Create a new pet
export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPet) => {
      const res = await fetch(api.pets.create.path, {
        method: api.pets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create pet");
      return api.pets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pets.get.path] }),
  });
}

// Perform action (feed, insulin, etc.)
export function usePetAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.pets.action.input>) => {
      const url = buildUrl(api.pets.action.path, { id });
      const res = await fetch(url, {
        method: api.pets.action.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to perform action");
      }
      return api.pets.action.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pets.get.path] }),
  });
}

// Update blood sugar directly (simulating sensor)
export function useUpdateBloodSugar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, value }: { id: number; value: number }) => {
      const url = buildUrl(api.pets.updateBloodSugar.path, { id });
      const res = await fetch(url, {
        method: api.pets.updateBloodSugar.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update blood sugar");
      return api.pets.updateBloodSugar.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.pets.get.path] }),
  });
}

// Get food list
export function useFoods() {
  return useQuery({
    queryKey: [api.foods.list.path],
    queryFn: async () => {
      const res = await fetch(api.foods.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch foods");
      return api.foods.list.responses[200].parse(await res.json());
    },
  });
}

// Chat with AI about the pet
export function useChat() {
  return useMutation({
    mutationFn: async ({ petId, message }: { petId: number; message: string }) => {
      const res = await fetch(api.chat.message.path, {
        method: api.chat.message.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, message }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Chat failed");
      return api.chat.message.responses[200].parse(await res.json());
    },
  });
}
