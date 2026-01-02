import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

// Challenge templates with stat effects
const challengeTemplates = [
  {
    id: "hypo",
    desc: "Oh no! Your buddy's blood sugar dropped too low after playing! They feel dizzy and weak. Give them some food to raise their blood sugar!",
    effects: { bloodSugar: -60, health: -15, energy: -10 }
  },
  {
    id: "hyper", 
    desc: "Yikes! Your buddy ate too many sweets at a party! Their blood sugar is way too high. They need insulin to bring it down!",
    effects: { bloodSugar: 80, health: -20 }
  },
  {
    id: "hungry",
    desc: "Your buddy's tummy is rumbling loudly! They haven't eaten in a while and feel weak. Feed them something healthy!",
    effects: { hunger: -40, health: -10, energy: -15 }
  },
  {
    id: "tired",
    desc: "Your buddy stayed up way too late! They're exhausted and their body isn't working well. They need rest or a snack!",
    effects: { energy: -50, bloodSugar: 20, health: -10 }
  }
];

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

  app.patch("/api/pets/:id", async (req, res) => {
    try {
      const petId = Number(req.params.id);
      const { name } = req.body;
      
      const pet = await storage.getPet(petId);
      if (!pet) {
        res.status(404).json({ message: "Pet not found" });
        return;
      }

      const updates: any = {};
      if (name && typeof name === "string") {
        updates.name = name.trim();
      }

      const updatedPet = await storage.updatePet(petId, updates);
      res.json(updatedPet);
    } catch (err) {
      console.error("Error updating pet:", err);
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
            const foods = await storage.getFoods();
            const food = foods.find(f => f.id === input.foodId);
            if (food) {
              updates.hunger = Math.min(100, pet.hunger + 20);
              updates.bloodSugar = pet.bloodSugar + food.carbImpact;
              updates.health = Math.min(100, Math.max(0, pet.health + food.healthValue));
              updates.lastFed = new Date();
            }
          }
          break;
        case "insulin":
          if (input.insulinUnits) {
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
          updates.bloodSugar = Math.max(0, pet.bloodSugar - 5);
          
          // Trigger a challenge every 30 seconds (if no active challenge)
          const now = new Date();
          const challengeCooldown = 30 * 1000; // 30 seconds
          const lastChallenge = pet.lastChallengeAt ? new Date(pet.lastChallengeAt).getTime() : 0;
          const canStartChallenge = !pet.activeScenario && (now.getTime() - lastChallenge >= challengeCooldown);
          
          if (canStartChallenge) {
            const challenge = challengeTemplates[Math.floor(Math.random() * challengeTemplates.length)];
            updates.activeScenario = challenge.id;
            updates.scenarioDescription = challenge.desc;
            updates.lastChallengeAt = now;
            
            // Apply stat effects from the challenge
            if (challenge.effects.bloodSugar) {
              updates.bloodSugar = Math.max(0, Math.min(300, (updates.bloodSugar ?? pet.bloodSugar) + challenge.effects.bloodSugar));
            }
            if (challenge.effects.health) {
              updates.health = Math.max(0, Math.min(100, pet.health + challenge.effects.health));
            }
            if (challenge.effects.hunger) {
              updates.hunger = Math.max(0, Math.min(100, pet.hunger + challenge.effects.hunger));
            }
            if (challenge.effects.energy) {
              updates.energy = Math.max(0, Math.min(100, (updates.energy ?? pet.energy) + challenge.effects.energy));
            }
          }
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

  app.post(api.pets.bloodTest.path, async (req, res) => {
    const petId = Number(req.params.id);
    const pet = await storage.getPet(petId);
    if (!pet) {
      res.status(404).json({ message: "Pet not found" });
      return;
    }

    // Check cooldown (60 seconds)
    const cooldownSeconds = 60;
    const now = new Date();
    if (pet.lastBloodTest) {
      const lastTest = new Date(pet.lastBloodTest);
      const elapsedSeconds = (now.getTime() - lastTest.getTime()) / 1000;
      if (elapsedSeconds < cooldownSeconds) {
        const remainingSeconds = Math.ceil(cooldownSeconds - elapsedSeconds);
        res.json({ 
          success: false, 
          cooldown: true, 
          remainingSeconds,
          pet 
        });
        return;
      }
    }

    const updates: any = {};
    // Blood test gives a small amount of XP
    const xpGain = 10;
    let newExp = pet.experience + xpGain;
    let newLevel = pet.level;
    const levelThreshold = 100 + (pet.level - 1) * 25;

    if (newExp >= levelThreshold) {
      newLevel += 1;
      newExp = newExp - levelThreshold;
    }

    // Check if blood sugar is in a bad range
    const isBloodSugarBad = pet.bloodSugar < 70 || pet.bloodSugar > 180;
    const coinChange = isBloodSugarBad ? -1 : 1;
    const newCoins = Math.max(0, (pet.coins || 0) + coinChange);

    updates.experience = newExp;
    updates.level = newLevel;
    updates.coins = newCoins;
    updates.lastBloodTest = now;

    const updatedPet = await storage.updatePet(petId, updates);
    res.json({ 
      success: true, 
      cooldown: false,
      coinsEarned: coinChange,
      isBloodSugarBad,
      pet: updatedPet 
    });
  });

  app.post("/api/pets/:id/auto-heal", async (req, res) => {
    const petId = Number(req.params.id);
    const pet = await storage.getPet(petId);
    
    if (!pet) {
      res.status(404).json({ message: "Pet not found" });
      return;
    }

    // Check if all conditions are good (pet is stabilized)
    const isBloodSugarGood = pet.bloodSugar >= 70 && pet.bloodSugar <= 180;
    const isNotHungry = pet.hunger >= 50;
    const isNotTired = pet.energy >= 40;
    const isStabilized = isBloodSugarGood && isNotHungry && isNotTired;
    const needsHealing = pet.health < 100;

    const updates: any = {};
    let leveledUp = false;
    let challengeCompleted = false;

    // If pet has an active challenge and is now stabilized, complete the challenge!
    if (pet.activeScenario && isStabilized) {
      challengeCompleted = true;
      
      // Award XP for completing the challenge
      const xpGain = 40;
      let newExp = pet.experience + xpGain;
      let newLevel = pet.level;
      const levelThreshold = 100 + (pet.level - 1) * 25;

      if (newExp >= levelThreshold) {
        newLevel += 1;
        newExp = newExp - levelThreshold;
        leveledUp = true;
      }

      updates.experience = newExp;
      updates.level = newLevel;
      updates.coins = (pet.coins || 0) + 5; // Bonus coins for challenge completion
      updates.activeScenario = null;
      updates.scenarioDescription = null;
    }

    // Auto-heal if stabilized
    if (isStabilized && needsHealing) {
      const healAmount = 5;
      updates.health = Math.min(100, pet.health + healAmount);
    }

    if (Object.keys(updates).length > 0) {
      const updatedPet = await storage.updatePet(petId, updates);
      res.json({ 
        healed: needsHealing && isStabilized, 
        challengeCompleted,
        leveledUp,
        newLevel: leveledUp ? updates.level : pet.level,
        pet: updatedPet 
      });
    } else {
      res.json({ healed: false, challengeCompleted: false, leveledUp: false, pet });
    }
  });

  app.post("/api/pets/:id/tick", async (req, res) => {
    const petId = Number(req.params.id);
    const pet = await storage.getPet(petId);
    
    if (!pet) {
      res.status(404).json({ message: "Pet not found" });
      return;
    }

    const updates: any = {};
    
    // Decrease hunger by 2 every tick (called every 15 seconds) - slower decrease
    if (!pet.isAsleep && pet.hunger > 0) {
      updates.hunger = Math.max(0, pet.hunger - 2);
    }
    
    // Decrease energy slowly when awake
    if (!pet.isAsleep && pet.energy > 0) {
      updates.energy = Math.max(0, pet.energy - 2);
    }

    if (Object.keys(updates).length > 0) {
      const updatedPet = await storage.updatePet(petId, updates);
      res.json(updatedPet);
    } else {
      res.json(pet);
    }
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

  // AI Recommendations endpoint
  app.post("/api/pets/:id/recommendations", async (req, res) => {
    const petId = Number(req.params.id);
    const pet = await storage.getPet(petId);
    
    if (!pet) {
      res.status(404).json({ message: "Pet not found" });
      return;
    }

    try {
      const { OpenAI } = await import("openai");
      const openai = new OpenAI();

      const prompt = `
        You are an AI health advisor for a virtual pet diabetes management game for children.
        
        Analyze this pet's current health data and provide 3-4 simple, actionable recommendations:
        - Blood Sugar: ${pet.bloodSugar} mg/dL (normal range: 70-180)
        - Health: ${pet.health}/100
        - Hunger: ${pet.hunger}/100
        - Energy: ${pet.energy}/100
        - Current Mood: ${pet.mood}
        - Is Sleeping: ${pet.isAsleep}
        - Level: ${pet.level}
        
        Based on patterns:
        ${pet.bloodSugar > 180 ? "- Blood sugar is HIGH" : ""}
        ${pet.bloodSugar < 70 ? "- Blood sugar is LOW" : ""}
        ${pet.hunger < 40 ? "- Pet is HUNGRY" : ""}
        ${pet.energy < 30 ? "- Pet is TIRED" : ""}
        ${pet.health < 50 ? "- Health is LOW" : ""}
        
        Provide recommendations in simple language a child can understand.
        Format: Return ONLY a JSON array of 3-4 recommendation strings. No explanation.
        Example: ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
      `;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content || '{"recommendations": []}';
      let recommendations: string[] = [];
      
      try {
        const parsed = JSON.parse(content);
        recommendations = Array.isArray(parsed) ? parsed : (parsed.recommendations || []);
      } catch {
        recommendations = ["Keep checking your pet's blood sugar regularly!", "Feed your pet healthy foods to keep them strong!", "Make sure your pet gets enough rest!"];
      }

      res.json({ recommendations });

    } catch (error) {
      console.error("Recommendations Error:", error);
      // Fallback recommendations
      const fallbackRecs = [];
      
      if (pet.bloodSugar > 180) {
        fallbackRecs.push("Your pet's blood sugar is high! Consider giving some insulin to bring it down.");
      } else if (pet.bloodSugar < 70) {
        fallbackRecs.push("Your pet's blood sugar is low! Give them some food with carbs to raise it.");
      } else {
        fallbackRecs.push("Great job! Your pet's blood sugar is in a healthy range.");
      }
      
      if (pet.hunger < 40) {
        fallbackRecs.push("Your pet is getting hungry. Time for a healthy snack!");
      }
      
      if (pet.energy < 30) {
        fallbackRecs.push("Your pet is tired. Let them take a nap to restore energy.");
      }
      
      if (pet.health < 50) {
        fallbackRecs.push("Your pet's health is low. Keep their stats balanced to help them recover.");
      }
      
      if (fallbackRecs.length === 0) {
        fallbackRecs.push("Your pet is doing great! Keep up the good care.");
      }

      res.json({ recommendations: fallbackRecs });
    }
  });

  // Shop Routes
  app.get("/api/shop/items", async (req, res) => {
    try {
      const items = await storage.getShopItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching shop items:", error);
      res.status(500).json({ message: "Failed to fetch shop items" });
    }
  });

  app.get("/api/pets/:id/owned-items", async (req, res) => {
    try {
      const petId = Number(req.params.id);
      const items = await storage.getOwnedItemsByPetId(petId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching owned items:", error);
      res.status(500).json({ message: "Failed to fetch owned items" });
    }
  });

  app.get("/api/pets/:id/equipped-items", async (req, res) => {
    try {
      const petId = Number(req.params.id);
      const items = await storage.getEquippedItems(petId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching equipped items:", error);
      res.status(500).json({ message: "Failed to fetch equipped items" });
    }
  });

  app.post("/api/pets/:id/purchase", async (req, res) => {
    try {
      const petId = Number(req.params.id);
      const { itemId } = req.body;

      const pet = await storage.getPet(petId);
      if (!pet) {
        res.status(404).json({ message: "Pet not found" });
        return;
      }

      // Look up item price server-side (don't trust client)
      const shopItems = await storage.getShopItems();
      const shopItem = shopItems.find(item => item.itemId === itemId);
      if (!shopItem) {
        res.status(404).json({ message: "Item not found in shop" });
        return;
      }

      const price = shopItem.price;

      if (pet.coins < price) {
        res.status(400).json({ message: "Not enough coins" });
        return;
      }

      // Check if already owned
      const ownedItems = await storage.getOwnedItemsByPetId(petId);
      if (ownedItems.some(item => item.itemId === itemId)) {
        res.status(400).json({ message: "Item already owned" });
        return;
      }

      // Deduct coins and add item
      await storage.updatePet(petId, { coins: pet.coins - price });
      const ownedItem = await storage.purchaseItem(petId, itemId);

      res.json({ success: true, ownedItem, newCoins: pet.coins - price });
    } catch (error) {
      console.error("Error purchasing item:", error);
      res.status(500).json({ message: "Failed to purchase item" });
    }
  });

  app.post("/api/pets/:id/equip", async (req, res) => {
    try {
      const petId = Number(req.params.id);
      const { itemId } = req.body;

      const ownedItem = await storage.equipItem(petId, itemId);
      res.json({ success: true, ownedItem });
    } catch (error) {
      console.error("Error equipping item:", error);
      res.status(500).json({ message: "Failed to equip item" });
    }
  });

  app.post("/api/pets/:id/unequip", async (req, res) => {
    try {
      const petId = Number(req.params.id);
      const { itemId } = req.body;

      const ownedItem = await storage.unequipItem(petId, itemId);
      res.json({ success: true, ownedItem });
    } catch (error) {
      console.error("Error unequipping item:", error);
      res.status(500).json({ message: "Failed to unequip item" });
    }
  });

  return httpServer;
}
