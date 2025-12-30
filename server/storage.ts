import { db } from "./db";
import { pets, foods, users, type Pet, type InsertPet, type Food, type User } from "@shared/schema";
import { eq } from "drizzle-orm";

type UpsertUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;

  getPet(id: number): Promise<Pet | undefined>;
  getPetsByUserId(userId: string): Promise<Pet[]>;
  createPet(pet: InsertPet & { userId: string }): Promise<Pet>;
  updatePet(id: number, updates: Partial<Pet>): Promise<Pet>;
  
  getFoods(): Promise<Food[]>;
  createFood(food: Food): Promise<Food>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(insertUser: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPet(id: number): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet;
  }

  async getPetsByUserId(userId: string): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.userId, userId));
  }

  async createPet(pet: InsertPet & { userId: string }): Promise<Pet> {
    const [newPet] = await db.insert(pets).values(pet).returning();
    return newPet;
  }

  async updatePet(id: number, updates: Partial<Pet>): Promise<Pet> {
    const [updated] = await db.update(pets).set(updates).where(eq(pets.id, id)).returning();
    return updated;
  }

  async getFoods(): Promise<Food[]> {
    return await db.select().from(foods);
  }

  async createFood(food: Food): Promise<Food> {
    // @ts-ignore
    const [newFood] = await db.insert(foods).values(food).returning();
    return newFood;
  }
}

export const storage = new DatabaseStorage();
