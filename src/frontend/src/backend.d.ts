import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface User {
    balance: bigint;
    isBlocked: boolean;
    name: string;
    completedOrders: bigint;
    totalEarnings: bigint;
    phone: string;
}
export interface ClothingItem {
    id: bigint;
    name: string;
    createdAt: bigint;
    pricePerItem: bigint;
    isActive: boolean;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    paymentMethod: string;
    shirts: bigint;
    clothingItems: Array<{
        itemId: bigint;
        quantity: bigint;
    }>;
    dresses: bigint;
    createdAt: bigint;
    partnerId?: Principal;
    updatedAt: bigint;
    totalAmount: bigint;
    address: string;
    customerId: Principal;
    pants: bigint;
}
export interface Broadcast {
    id: bigint;
    sentAt: bigint;
    targetAudience: string;
    message: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface AdminStats {
    pendingOrders: bigint;
    totalShops: bigint;
    activeOrders: bigint;
    totalEarnings: bigint;
    totalOrdersToday: bigint;
    pendingShopApprovals: bigint;
    totalCustomers: bigint;
}
export interface Area {
    id: bigint;
    city: string;
    name: string;
    isActive: boolean;
    assignedShopIds: Array<bigint>;
    pantPrice: bigint;
    dressPrice: bigint;
    pincode: string;
    shirtPrice: bigint;
}
export interface Notification {
    id: bigint;
    userId: Principal;
    createdAt: bigint;
    read: boolean;
    message: string;
}
export interface Complaint {
    id: bigint;
    status: string;
    complaintType: string;
    createdAt: bigint;
    description: string;
    orderId: bigint;
    customerId: Principal;
}
export interface Shop {
    id: bigint;
    serviceArea: bigint;
    status: ShopStatus;
    ownerName: string;
    ownerId: Principal;
    createdAt: bigint;
    workingHours: string;
    address: string;
    shopName: string;
    mobile: string;
    pricePerCloth: bigint;
}
export interface UserProfile {
    name: string;
    phone: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    pickedUp = "pickedUp",
    delivered = "delivered",
    accepted = "accepted",
    ironing = "ironing"
}
export enum ShopStatus {
    active = "active",
    pending = "pending",
    rejected = "rejected",
    suspended = "suspended"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addArea(name: string, city: string, pincode: string): Promise<bigint>;
    addClothingItem(name: string, pricePerItem: bigint): Promise<bigint>;
    approveShop(shopId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignShopToArea(shopId: bigint, areaId: bigint): Promise<void>;
    blockUser(userId: Principal): Promise<void>;
    claimAdminIfFirst(): Promise<boolean>;
    deleteClothingItem(itemId: bigint): Promise<void>;
    deleteShop(shopId: bigint): Promise<void>;
    disableArea(areaId: bigint): Promise<void>;
    disableClothingItem(itemId: bigint): Promise<void>;
    enableArea(areaId: bigint): Promise<void>;
    enableClothingItem(itemId: bigint): Promise<void>;
    getActiveClothingItems(): Promise<Array<ClothingItem>>;
    getActiveShops(): Promise<Array<Shop>>;
    getAdminPrincipals(): Promise<Array<string>>;
    getAdminStats(): Promise<AdminStats>;
    getAllAreas(): Promise<Array<Area>>;
    getAllBroadcasts(): Promise<Array<Broadcast>>;
    getAllClothingItems(): Promise<Array<ClothingItem>>;
    getAllComplaints(): Promise<Array<Complaint>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllRegisteredUsers(): Promise<Array<[Principal, User]>>;
    getAllShops(): Promise<Array<Shop>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyOrders(): Promise<Array<Order>>;
    getMyShop(): Promise<Shop | null>;
    getOrder(orderId: bigint): Promise<Order>;
    getPricing(): Promise<{
        pantPrice: bigint;
        dressPrice: bigint;
        shirtPrice: bigint;
    }>;
    getShopsByStatus(status: ShopStatus): Promise<Array<Shop>>;
    getUser(userId: Principal): Promise<User>;
    getUserNotifications(): Promise<Array<Notification>>;
    getUserProfile(userId: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isUserBlocked(userId: Principal): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    placeOrder(shirts: bigint, pants: bigint, dresses: bigint, itemQuantities: Array<{
        itemId: bigint;
        quantity: bigint;
    }>, address: string, paymentMethod: string): Promise<bigint>;
    registerShop(ownerName: string, mobile: string, shopName: string, address: string, serviceArea: bigint, pricePerCloth: bigint, workingHours: string): Promise<bigint>;
    registerUser(name: string, phone: string): Promise<void>;
    rejectShop(shopId: bigint): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendBroadcastNotification(message: string, targetAudience: string): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setAreaPrice(areaId: bigint, shirtPrice: bigint, pantPrice: bigint, dressPrice: bigint): Promise<void>;
    setDressPrice(price: bigint): Promise<void>;
    setPantPrice(price: bigint): Promise<void>;
    setShirtPrice(price: bigint): Promise<void>;
    submitComplaint(orderId: bigint, complaintType: string, description: string): Promise<void>;
    suspendShop(shopId: bigint): Promise<void>;
    unblockUser(userId: Principal): Promise<void>;
    updateClothingItem(itemId: bigint, name: string, pricePerItem: bigint): Promise<void>;
    updateComplaintStatus(complaintId: bigint, status: string): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    whoAmI(): Promise<string>;
}
