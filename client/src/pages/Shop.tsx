import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Coins, Check, ShoppingBag, Crown, Glasses, Ribbon, Shirt, Shield, Circle, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ShopItem, OwnedItem, Pet } from "@shared/schema";

const iconMap: Record<string, any> = {
  Ribbon: Ribbon,
  Crown: Crown,
  Glasses: Glasses,
  PartyPopper: PartyPopper,
  Shirt: Shirt,
  Circle: Circle,
  Shield: Shield,
};

interface ShopProps {
  pet: Pet;
  onClose: () => void;
}

export function Shop({ pet, onClose }: ShopProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("accessories");

  const { data: shopItems = [], isLoading: itemsLoading } = useQuery<ShopItem[]>({
    queryKey: ["/api/shop/items"],
  });

  const { data: ownedItems = [] } = useQuery<OwnedItem[]>({
    queryKey: ["/api/pets", pet.id, "owned-items"],
    queryFn: async () => {
      const res = await fetch(`/api/pets/${pet.id}/owned-items`);
      return res.json();
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await apiRequest("POST", `/api/pets/${pet.id}/purchase`, { itemId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets", pet.id, "owned-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets", pet.id, "equipped-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      toast({
        title: t.shop.purchaseSuccess,
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast({
        title: error.message || t.shop.notEnoughCoins,
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const equipMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await apiRequest("POST", `/api/pets/${pet.id}/equip`, { itemId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets", pet.id, "owned-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets", pet.id, "equipped-items"] });
      toast({
        title: t.shop.equipSuccess,
        duration: 2000,
      });
    },
  });

  const unequipMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await apiRequest("POST", `/api/pets/${pet.id}/unequip`, { itemId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets", pet.id, "owned-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets", pet.id, "equipped-items"] });
      toast({
        title: t.shop.unequipSuccess,
        duration: 2000,
      });
    },
  });

  const isOwned = (itemId: string) => ownedItems.some(item => item.itemId === itemId);
  const isEquipped = (itemId: string) => ownedItems.some(item => item.itemId === itemId && item.equipped);

  const getItemName = (itemId: string) => {
    const key = itemId as keyof typeof t.shop;
    return t.shop[key] || itemId;
  };

  const categorizedItems = {
    accessories: shopItems.filter(item => item.category === "accessories"),
    clothes: shopItems.filter(item => item.category === "clothes"),
    toys: shopItems.filter(item => item.category === "toys"),
  };

  const renderItemCard = (item: ShopItem) => {
    const IconComponent = iconMap[item.icon] || ShoppingBag;
    const owned = isOwned(item.itemId);
    const equipped = isEquipped(item.itemId);
    const canAfford = pet.coins >= item.price;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <Card className={`overflow-visible ${equipped ? 'ring-2 ring-primary' : ''}`}>
          <CardContent className="p-4 flex flex-col items-center gap-3">
            <motion.div
              animate={equipped ? { y: [0, -5, 0] } : {}}
              transition={{ repeat: equipped ? Infinity : 0, duration: 2, ease: "easeInOut" }}
              className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                owned ? 'bg-primary/20' : 'bg-muted'
              }`}
            >
              <IconComponent className={`w-8 h-8 ${owned ? 'text-primary' : 'text-muted-foreground'}`} />
            </motion.div>
            
            <div className="text-center">
              <p className="font-medium text-sm">{getItemName(item.itemId)}</p>
              {!owned && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Coins className="w-3 h-3 text-yellow-600" />
                  <span className={`text-xs font-bold ${canAfford ? 'text-yellow-600' : 'text-red-500'}`}>
                    {item.price}
                  </span>
                </div>
              )}
            </div>

            {owned ? (
              equipped ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => unequipMutation.mutate(item.itemId)}
                  disabled={unequipMutation.isPending}
                  data-testid={`button-unequip-${item.itemId}`}
                >
                  <Check className="w-3 h-3 mr-1" />
                  {t.shop.equipped}
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => equipMutation.mutate(item.itemId)}
                  disabled={equipMutation.isPending}
                  data-testid={`button-equip-${item.itemId}`}
                >
                  {t.shop.equip}
                </Button>
              )
            ) : (
              <Button
                size="sm"
                className="w-full"
                disabled={!canAfford || purchaseMutation.isPending}
                onClick={() => purchaseMutation.mutate(item.itemId)}
                data-testid={`button-buy-${item.itemId}`}
              >
                {t.shop.buy}
              </Button>
            )}

            {owned && !equipped && (
              <Badge variant="secondary" className="absolute -top-2 -right-2">
                {t.shop.owned}
              </Badge>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex items-center justify-center px-4 py-6"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-[450px] h-full bg-card rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/5">
        <div className="p-6 flex items-center justify-between border-b border-border/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-shop-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold">{t.shop.title}</h1>
          <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1.5 rounded-full">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300" data-testid="text-shop-coins">
              {pet.coins || 0}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="accessories" data-testid="tab-accessories">
                {t.shop.accessories}
              </TabsTrigger>
              <TabsTrigger value="clothes" data-testid="tab-clothes">
                {t.shop.clothes}
              </TabsTrigger>
              <TabsTrigger value="toys" data-testid="tab-toys">
                {t.shop.toys}
              </TabsTrigger>
            </TabsList>

            {itemsLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                <TabsContent value="accessories" className="mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    {categorizedItems.accessories.map(renderItemCard)}
                  </div>
                </TabsContent>

                <TabsContent value="clothes" className="mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    {categorizedItems.clothes.map(renderItemCard)}
                  </div>
                </TabsContent>

                <TabsContent value="toys" className="mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    {categorizedItems.toys.length > 0 ? (
                      categorizedItems.toys.map(renderItemCard)
                    ) : (
                      <p className="col-span-2 text-center text-muted-foreground py-8">
                        {t.games.soon}
                      </p>
                    )}
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
