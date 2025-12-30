import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Register Integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerImageRoutes(app);
  
  // Seed foods if empty
  const existingFoods = await storage.getFoods();
  if (existingFoods.length === 0) {
    const initialFoods = [
      { name: "Apple", carbImpact: 15, healthValue: 10, image: "apple" },
      { name: "Pizza Slice", carbImpact: 40, healthValue: -5, image: "pizza" },
      { name: "Salad", carbImpact: 5, healthValue: 15, image: "salad" },
      { name: "Soda", carbImpact: 50, healthValue: -15, image: "soda" },
      { name: "Water", carbImpact: 0, healthValue: 5, image: "water" },
    ];
    for (const food of initialFoods) {
      // @ts-ignore - ID is auto generated
      await storage.createFood(food);
    }
  }

  // Pet Routes
  app.get(api.pets.get.path, async (req, res) => {
    // For MVP, if no auth, just return a demo pet or create one for 'demo' user
    let userId = "demo_id"; 
    
    // Ensure demo user exists
    let user = await storage.getUser(userId);
    if (!user) {
      user = await storage.createUser({ id: userId, email: "demo@example.com", firstName: "Demo", lastName: "Kid" });
    }

    let pets = await storage.getPetsByUserId(userId);
    if (pets.length === 0) {
      await storage.createPet({
        userId,
        name: "Diabeats",
        type: "dragon",
      });
      pets = await storage.getPetsByUserId(userId);
    }
    res.json(pets);
  });

  app.post(api.pets.create.path, async (req, res) => {
    try {
      const input = api.pets.create.input.parse(req.body);
      // Mock user ID
      const pet = await storage.createPet({ ...input, userId: "demo_id" });
      res.status(201).json(pet);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.pets.action.path, async (req, res) => {
    try {
      const petId = Number(req.params.id);
      const input = api.pets.action.input.parse(req.body);
      const pet = await storage.getPet(petId);
      
      if (!pet) {
        res.status(404).json({ message: "Pet not found" });
        return;
      }

      const updates: any = {};

      switch (input.type) {
        case "feed":
          if (input.foodId) {
            // Simplified logic: Food increases hunger (satiety) and blood sugar
            // Hunger: 0 is full, 100 is starving? Or 100 is full? 
            // Schema: 100 is default. Let's assume 100 is FULL energy/satiety.
            // Wait, schema comment said "100 is very hungry" for hunger?
            // "hunger: integer... default(50)"
            // Let's assume standard game logic: Hunger bar decreases over time, eating refills it (increases value? or decreases "hunger"?)
            // Usually "Hunger" variable = how hungry you are. So eating DECREASES it.
            // But "Energy" = how much energy. Eating INCREASES it.
            // Let's treat "hunger" as "satiety" for simplicity in the UI (0=empty, 100=full). 
            // Actually, let's look at schema: "hunger... default(50)".
            // Let's assume: 0 = Starving, 100 = Full.
            
            // Fetch food
            const foods = await storage.getFoods();
            const food = foods.find(f => f.id === input.foodId);
            if (food) {
              updates.hunger = Math.min(100, pet.hunger + 20); // Eat fills up
              updates.bloodSugar = pet.bloodSugar + food.carbImpact;
              updates.health = Math.min(100, Math.max(0, pet.health + food.healthValue));
              updates.lastFed = new Date();
            }
          }
          break;
        case "insulin":
          if (input.insulinUnits) {
            // Insulin decreases blood sugar
            // 1 unit = -10 mg/dL (simplified)
            updates.bloodSugar = Math.max(0, pet.bloodSugar - (input.insulinUnits * 10));
            updates.insulinLevel = pet.insulinLevel + input.insulinUnits;
            updates.lastInsulin = new Date();
          }
          break;
        case "sleep":
          updates.isAsleep = true;
          updates.energy = Math.min(100, pet.energy + 30);
          break;
        case "wake":
          updates.isAsleep = false;
          break;
        case "play":
          updates.energy = Math.max(0, pet.energy - 10);
          updates.mood = "happy";
          updates.bloodSugar = Math.max(0, pet.bloodSugar - 5); // Exercise lowers sugar
          break;
      }

      const updatedPet = await storage.updatePet(petId, updates);
      res.json(updatedPet);

    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.pets.updateBloodSugar.path, async (req, res) => {
    const petId = Number(req.params.id);
    const { value } = req.body;
    
    const pet = await storage.getPet(petId);
    if (!pet) {
       res.status(404).json({ message: "Pet not found" });
       return;
    }

    const updatedPet = await storage.updatePet(petId, { bloodSugar: value });
    res.json(updatedPet);
  });

  app.get(api.foods.list.path, async (req, res) => {
    const foods = await storage.getFoods();
    res.json(foods);
  });

  // Chat API using OpenAI
  app.post(api.chat.message.path, async (req, res) => {
    const { message, petId } = req.body;
    const pet = await storage.getPet(petId);
    
    if (!pet) {
      res.status(404).json({ message: "Pet not found" });
      return;
    }

    // Call OpenAI
    // Note: Replit AI integration provides openai client or we can use fetch
    // Since we used the blueprint, it should be available. 
    // We'll use the standard 'openai' package if available or fetch.
    // The blueprint usually installs 'openai'.
    
    try {
      // Import dynamically to avoid issues if package not installed yet
      const { OpenAI } = await import("openai");
      const openai = new OpenAI(); // Replit handles api key if environment variable is set

      const prompt = `
        You are a virtual pet named ${pet.name}. You are a ${pet.type}.
        You have diabetes. Your current blood sugar is ${pet.bloodSugar} mg/dL.
        Hunger: ${pet.hunger}/100. Energy: ${pet.energy}/100.
        
        The user (a child) says: "${message}"
        
        Respond as the pet. Be educational but fun. If blood sugar is high (>180), complain about feeling dizzy or thirsty. If low (<70), complain about feeling shaky or hungry.
        Keep it short (under 50 words).
      `;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-4o-mini",
      });

      const responseMessage = completion.choices[0].message.content || "...";
      res.json({ message: responseMessage });

    } catch (error) {
      console.error("OpenAI Error:", error);
      // Fallback
      res.json({ message: "I'm not feeling very chatty right now... (AI Error)" });
    }
  });

  return httpServer;
}
