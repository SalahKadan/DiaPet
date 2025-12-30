import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";
export * from "./models/chat";

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id), // maps to users.id which is varchar in auth model
  name: text("name").notNull(),
  type: text("type").notNull().default("cat"),
  health: integer("health").notNull().default(100),
  hunger: integer("hunger").notNull().default(50), // 0-100, 100 is very hungry
  energy: integer("energy").notNull().default(100), // 0-100, 100 is full energy
  bloodSugar: integer("blood_sugar").notNull().default(100), // mg/dL
  insulinLevel: integer("insulin_level").notNull().default(0),
  mood: text("mood").notNull().default("happy"),
  isAsleep: boolean("is_asleep").notNull().default(false),
  lastFed: timestamp("last_fed").defaultNow(),
  lastInsulin: timestamp("last_insulin").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  carbImpact: integer("carb_impact").notNull(), // Effect on blood sugar
  healthValue: integer("health_value").notNull(), // Effect on health
  image: text("image"), // Icon name or url
});

export const insertPetSchema = createInsertSchema(pets).omit({ 
  id: true, 
  userId: true,
  health: true,
  hunger: true,
  energy: true,
  bloodSugar: true,
  insulinLevel: true,
  mood: true,
  isAsleep: true,
  lastFed: true,
  lastInsulin: true,
  createdAt: true 
});
export const insertFoodSchema = createInsertSchema(foods).omit({ id: true });

export type Pet = typeof pets.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Food = typeof foods.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;

export type ChatRequest = {
  message: string;
  petState: Pet;
};

export type ChatResponse = {
  message: string;
  action?: string;
};
