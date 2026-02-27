import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { type Order, type UserProfile, type Shop, type Area, type Broadcast, type Complaint, type AdminStats, type User, type ClothingItem, OrderStatus, ShopStatus } from '../backend';
import { Principal } from '@dfinity/principal';

// ── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.registerUser(name, phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const principalStr = identity?.getPrincipal().toString() ?? 'anonymous';

  const query = useQuery<boolean>({
    // Include the principal in the query key so the result is per-identity
    queryKey: ['isCallerAdmin', principalStr],
    queryFn: async () => {
      if (!actor) return false;
      if (!isAuthenticated) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        // If the call fails (e.g. anonymous user, network error), treat as non-admin
        return false;
      }
    },
    // Only fire when:
    // 1. Actor is ready and not fetching
    // 2. II is not initializing (avoid firing with stale anonymous actor)
    // 3. User is authenticated via Internet Identity
    enabled: !!actor && !actorFetching && !isInitializing && isAuthenticated,
    retry: 0,
    staleTime: 10000,
  });

  // isLoading: true while II is initializing, actor is fetching, or query is in initial load
  const isLoading =
    isInitializing ||
    actorFetching ||
    (isAuthenticated && !!actor && query.fetchStatus === 'fetching' && !query.isFetched);

  return {
    ...query,
    isLoading,
    isFetched: isAuthenticated && !!actor && query.isFetched,
    // Treat error or unauthenticated as non-admin
    data: !isAuthenticated ? false : query.isError ? false : query.data,
  };
}

// ── Debug / Setup Helpers ────────────────────────────────────────────────────

/** Returns the caller's principal text. No auth guard — works for anyone. */
export function useWhoAmI() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['whoAmI'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.whoAmI();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
    retry: 2,
  });
}

/** Claims admin access if no admin exists yet. Returns true on success, false if already claimed. */
export function useClaimAdminIfFirst() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimAdminIfFirst();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['adminPrincipals'] });
    },
  });
}

// ── Customer Orders ──────────────────────────────────────────────────────────

/** Fetches the current caller's own orders (customer view). */
export function useGetMyOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

/** @deprecated Use useGetMyOrders instead. Kept for backward compat with CustomerDashboard. */
export function useGetUserOrders(_userId: Principal | null) {
  return useGetMyOrders();
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      address,
      shirts,
      pants,
      dresses,
      itemQuantities,
      paymentMethod,
    }: {
      address: string;
      shirts: bigint;
      pants: bigint;
      dresses: bigint;
      itemQuantities: Array<{ itemId: bigint; quantity: bigint }>;
      paymentMethod: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(shirts, pants, dresses, itemQuantities, address, paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useGetOrder(orderId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order>({
    queryKey: ['order', orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) throw new Error('Actor or orderId not available');
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !actorFetching && orderId !== null,
    refetchInterval: 10000,
  });
}

// ── Partner Orders ───────────────────────────────────────────────────────────

/**
 * Returns all pending orders (available for partners to accept).
 * Uses getAllOrders filtered client-side since no dedicated partner endpoint exists.
 */
export function useGetPendingOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['pendingOrders'],
    queryFn: async () => {
      if (!actor) return [];
      const all = await actor.getAllOrders();
      return all.filter((o) => o.status === OrderStatus.pending);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

/**
 * Returns orders assigned to the current partner.
 * Uses getMyOrders since no dedicated getPartnerOrders endpoint exists.
 */
export function useGetPartnerOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['partnerOrders'],
    queryFn: async () => {
      if (!actor) return [];
      // Use getAllOrders and filter by non-pending statuses as a proxy for partner orders
      const all = await actor.getAllOrders();
      return all.filter((o) => o.status !== OrderStatus.pending);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

/**
 * "Accept" an order by updating its status to accepted.
 * The backend has no dedicated acceptOrder; updateOrderStatus is used instead.
 */
export function useAcceptOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateOrderStatus(orderId, OrderStatus.accepted);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
      queryClient.invalidateQueries({ queryKey: ['partnerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: bigint; newStatus: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateOrderStatus(orderId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

// ── Admin ────────────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 20000,
  });
}

/**
 * Returns all orders filtered by status client-side.
 * No dedicated getAllOrdersByStatus endpoint exists in the backend.
 */
export function useGetAllOrdersByStatus(status: OrderStatus) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrdersByStatus', status],
    queryFn: async () => {
      if (!actor) return [];
      const all = await actor.getAllOrders();
      return all.filter((o) => o.status === status);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 20000,
  });
}

/**
 * No getAllUsers endpoint in backend — returns empty array.
 * Admin users table will show an empty state.
 */
export function useGetAllUsers() {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => [] as { name: string; phone: string; balance: bigint; totalEarnings: bigint; completedOrders: bigint }[],
    enabled: false,
  });
}

/**
 * No getPlatformRevenue endpoint in backend — derives from all orders client-side.
 */
export function useGetPlatformRevenue() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['platformRevenue'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      const all = await actor.getAllOrders();
      return all.reduce((sum, o) => sum + o.totalAmount, BigInt(0));
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

/**
 * Cancel an order by setting its status to cancelled.
 * No dedicated cancelOrder endpoint; uses updateOrderStatus.
 */
export function useCancelOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateOrderStatus(orderId, OrderStatus.cancelled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrdersByStatus'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

/**
 * Reassign order — no backend endpoint exists; no-op mutation that shows a warning.
 */
export function useReassignOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_params: { orderId: bigint; newPartnerId: Principal }) => {
      // Backend does not support reassignOrder; this is a no-op
      throw new Error('Reassign order is not supported by the current backend.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrdersByStatus'] });
    },
  });
}

// ── Shop / Owner ─────────────────────────────────────────────────────────────

export function useRegisterShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      ownerName: string;
      mobile: string;
      shopName: string;
      address: string;
      serviceArea: bigint;
      pricePerCloth: bigint;
      workingHours: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerShop(
        params.ownerName,
        params.mobile,
        params.shopName,
        params.address,
        params.serviceArea,
        params.pricePerCloth,
        params.workingHours,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
      queryClient.invalidateQueries({ queryKey: ['allShops'] });
    },
  });
}

export function useGetMyShop() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Shop | null>({
    queryKey: ['myShop'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyShop();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetAllShops() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Shop[]>({
    queryKey: ['allShops'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllShops();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 20000,
  });
}

export function useApproveShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.approveShop(shopId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allShops'] });
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
}

export function useRejectShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rejectShop(shopId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allShops'] });
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
}

export function useSuspendShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.suspendShop(shopId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allShops'] });
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
}

export function useGetShopsByStatus(status: ShopStatus) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Shop[]>({
    queryKey: ['shopsByStatus', status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShopsByStatus(status);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 20000,
  });
}

export function useDeleteShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteShop(shopId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allShops'] });
      queryClient.invalidateQueries({ queryKey: ['myShop'] });
    },
  });
}

// ── Admin Stats ───────────────────────────────────────────────────────────────

export function useGetAdminStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminStats();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

// ── Registered Users ─────────────────────────────────────────────────────────

export function useGetAllRegisteredUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[Principal, User]>>({
    queryKey: ['allRegisteredUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRegisteredUsers();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.blockUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRegisteredUsers'] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unblockUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRegisteredUsers'] });
    },
  });
}

// ── Areas ─────────────────────────────────────────────────────────────────────

export function useGetAllAreas() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Area[]>({
    queryKey: ['allAreas'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAreas();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useAddArea() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, city, pincode }: { name: string; city: string; pincode: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addArea(name, city, pincode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAreas'] });
    },
  });
}

export function useDisableArea() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (areaId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.disableArea(areaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAreas'] });
    },
  });
}

export function useEnableArea() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (areaId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.enableArea(areaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAreas'] });
    },
  });
}

export function useAssignShopToArea() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shopId, areaId }: { shopId: bigint; areaId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.assignShopToArea(shopId, areaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAreas'] });
    },
  });
}

export function useSetAreaPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      areaId,
      shirtPrice,
      pantPrice,
      dressPrice,
    }: {
      areaId: bigint;
      shirtPrice: bigint;
      pantPrice: bigint;
      dressPrice: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setAreaPrice(areaId, shirtPrice, pantPrice, dressPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAreas'] });
    },
  });
}

// ── Broadcasts / Notifications ────────────────────────────────────────────────

export function useGetAllBroadcasts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Broadcast[]>({
    queryKey: ['allBroadcasts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBroadcasts();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 60000,
  });
}

export function useSendBroadcastNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, targetAudience }: { message: string; targetAudience: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendBroadcastNotification(message, targetAudience);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBroadcasts'] });
    },
  });
}

// ── Complaints ────────────────────────────────────────────────────────────────

export function useGetAllComplaints() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Complaint[]>({
    queryKey: ['allComplaints'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllComplaints();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ complaintId, status }: { complaintId: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateComplaintStatus(complaintId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allComplaints'] });
    },
  });
}

// ── Pricing ───────────────────────────────────────────────────────────────────

export function useGetPricing() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ pantPrice: bigint; dressPrice: bigint; shirtPrice: bigint }>({
    queryKey: ['pricing'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPricing();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
  });
}

export function useSetShirtPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (price: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setShirtPrice(price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    },
  });
}

export function useSetPantPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (price: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setPantPrice(price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    },
  });
}

export function useSetDressPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (price: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setDressPrice(price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    },
  });
}

// ── Clothing Items ────────────────────────────────────────────────────────────

export function useGetActiveClothingItems() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<ClothingItem[]>({
    queryKey: ['activeClothingItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveClothingItems();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
  });
}

export function useGetAllClothingItems() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<ClothingItem[]>({
    queryKey: ['allClothingItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClothingItems();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useAddClothingItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, pricePerItem }: { name: string; pricePerItem: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addClothingItem(name, pricePerItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allClothingItems'] });
      queryClient.invalidateQueries({ queryKey: ['activeClothingItems'] });
    },
  });
}

export function useUpdateClothingItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, name, pricePerItem }: { itemId: bigint; name: string; pricePerItem: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateClothingItem(itemId, name, pricePerItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allClothingItems'] });
      queryClient.invalidateQueries({ queryKey: ['activeClothingItems'] });
    },
  });
}

export function useDeleteClothingItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteClothingItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allClothingItems'] });
      queryClient.invalidateQueries({ queryKey: ['activeClothingItems'] });
    },
  });
}

export function useEnableClothingItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.enableClothingItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allClothingItems'] });
      queryClient.invalidateQueries({ queryKey: ['activeClothingItems'] });
    },
  });
}

export function useDisableClothingItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.disableClothingItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allClothingItems'] });
      queryClient.invalidateQueries({ queryKey: ['activeClothingItems'] });
    },
  });
}
