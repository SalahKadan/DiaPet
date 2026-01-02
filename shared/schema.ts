import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";
export * from "./models/chat";

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull().default("cat"),
  health: integer("health").notNull().default(100),
  hunger: integer("hunger").notNull().default(50),
  energy: integer("energy").notNull().default(100),
  bloodSugar: integer("blood_sugar").notNull().default(100),
  insulinLevel: integer("insulin_level").notNull().default(0),
  mood: text("mood").notNull().default("happy"),
  isAsleep: boolean("is_asleep").notNull().default(false),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  activeScenario: text("active_scenario"),
  scenarioDescription: text("scenario_description"),
  lastChallengeAt: timestamp("last_challenge_at"),
  lastFed: timestamp("last_fed").defaultNow(),
  lastInsulin: timestamp("last_insulin").defaultNow(),
  lastBloodTest: timestamp("last_blood_test"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  carbImpact: integer("carb_impact").notNull(), // Effect on blood sugar
  healthValue: integer("health_value").notNull(), // Effect on health
  image: text("image"), // Icon name or url
});

export const shopItems = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull().unique(), // e.g., "bowtie", "crown"
  category: text("category").notNull(), // "clothes", "accessories", "toys"
  price: integer("price").notNull(),
  icon: text("icon").notNull(), // Icon name from lucide-react
});

export const ownedItems = pgTable("owned_items", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => pets.id),
  itemId: text("item_id").notNull(),
  equipped: boolean("equipped").notNull().default(false),
  purchasedAt: timestamp("purchased_at").defaultNow(),
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
export const insertShopItemSchema = createInsertSchema(shopItems).omit({ id: true });
export const insertOwnedItemSchema = createInsertSchema(ownedItems).omit({ id: true, purchasedAt: true });

export type Pet = typeof pets.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Food = typeof foods.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;
export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = z.infer<typeof insertShopItemSchema>;
export type OwnedItem = typeof ownedItems.$inferSelect;
export type InsertOwnedItem = z.infer<typeof insertOwnedItemSchema>;

export type ChatRequest = {
  message: string;
  petState: Pet;
};

export type ChatResponse = {
  message: string;
  action?: string;
};
