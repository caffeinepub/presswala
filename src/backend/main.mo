import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";



actor {
  // Access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User approval state
  let approvalState = UserApproval.initState(accessControlState);

  public type OrderStatus = {
    #pending;
    #accepted;
    #pickedUp;
    #ironing;
    #delivered;
    #cancelled;
  };
  public type ShopStatus = {
    #pending;
    #active;
    #rejected;
    #suspended;
  };

  public type Order = {
    id : Nat;
    customerId : Principal;
    partnerId : ?Principal;
    status : OrderStatus;
    shirts : Nat;
    pants : Nat;
    dresses : Nat;
    clothingItems : [{ itemId : Nat; quantity : Nat }];
    totalAmount : Nat;
    address : Text;
    paymentMethod : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Shop = {
    id : Nat;
    ownerId : Principal;
    ownerName : Text;
    mobile : Text;
    shopName : Text;
    address : Text;
    serviceArea : Nat;
    pricePerCloth : Nat;
    workingHours : Text;
    status : ShopStatus;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
  };

  public type User = {
    name : Text;
    phone : Text;
    balance : Nat;
    totalEarnings : Nat;
    completedOrders : Nat;
    isBlocked : Bool;
  };

  public type Preferences = {
    deliveryTime : Text;
    specialHandling : Text;
    language : Text;
  };

  public type Invoice = {
    id : Nat;
    orderId : Nat;
    amount : Nat;
    issuedAt : Int;
    paid : Bool;
    dueDate : Int;
  };

  public type Payment = {
    id : Nat;
    invoiceId : Nat;
    amount : Nat;
    paidAt : Int;
    method : Text;
  };

  public type Tracking = {
    orderId : Nat;
    partnerId : ?Principal;
    location : Text;
    updatedAt : Int;
  };

  public type Referral = {
    id : Nat;
    referrerId : Principal;
    referredId : Principal;
    reward : Nat;
    completed : Bool;
  };

  public type Notification = {
    id : Nat;
    userId : Principal;
    message : Text;
    read : Bool;
    createdAt : Int;
  };

  public type Tariff = {
    id : Nat;
    name : Text;
    shirtPrice : Nat;
    pantPrice : Nat;
    dressPrice : Nat;
    validFrom : Int;
    validTo : Int;
  };

  public type ShopReview = {
    id : Nat;
    shopId : Nat;
    reviewer : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Int;
  };

  public type Area = {
    id : Nat;
    name : Text;
    city : Text;
    pincode : Text;
    isActive : Bool;
    assignedShopIds : [Nat];
    shirtPrice : Nat;
    pantPrice : Nat;
    dressPrice : Nat;
  };

  public type Complaint = {
    id : Nat;
    orderId : Nat;
    customerId : Principal;
    complaintType : Text;
    description : Text;
    status : Text;
    createdAt : Int;
  };

  public type Broadcast = {
    id : Nat;
    message : Text;
    targetAudience : Text;
    sentAt : Int;
  };

  public type AdminStats = {
    totalOrdersToday : Nat;
    totalCustomers : Nat;
    totalShops : Nat;
    pendingShopApprovals : Nat;
    totalEarnings : Nat;
    activeOrders : Nat;
    pendingOrders : Nat;
  };

  public type ClothingItem = {
    id : Nat;
    name : Text;
    pricePerItem : Nat;
    isActive : Bool;
    createdAt : Int;
  };

  // State
  let orders = Map.empty<Nat, Order>();
  let shops = Map.empty<Nat, Shop>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let users = Map.empty<Principal, User>();
  let preferences = Map.empty<Principal, Preferences>();
  let invoices = Map.empty<Nat, Invoice>();
  let payments = Map.empty<Nat, Payment>();
  let trackings = Map.empty<Nat, Tracking>();
  let referrals = Map.empty<Nat, Referral>();
  let notifications = Map.empty<Nat, Notification>();
  let tariffs = Map.empty<Nat, Tariff>();
  let shopReviews = Map.empty<Nat, ShopReview>();
  let areas = Map.empty<Nat, Area>();
  let complaints = Map.empty<Nat, Complaint>();
  let broadcasts = Map.empty<Nat, Broadcast>();
  let clothingItems = Map.empty<Nat, ClothingItem>();

  var orderIdCounter = 0;
  var shopIdCounter = 0;
  var invoiceIdCounter = 0;
  var paymentIdCounter = 0;
  var trackingIdCounter = 0;
  var referralIdCounter = 0;
  var notificationIdCounter = 0;
  var tariffIdCounter = 0;
  var shopReviewIdCounter = 0;
  var areaIdCounter = 0;
  var complaintIdCounter = 0;
  var broadcastIdCounter = 0;
  var clothingItemIdCounter = 0;
  var shirtPrice = 12;
  var pantPrice = 12;
  var dressPrice = 15;

  let HARDCODED_ADMIN = "mq3jt-zv7li-ncvdq-ygu2h-ny2xr-kykyz-ybpm1-khcu3-qswgq-msguw-yae";

  // ID generators
  func getNextOrderId() : Nat {
    orderIdCounter += 1;
    orderIdCounter;
  };

  func getNextShopId() : Nat {
    shopIdCounter += 1;
    shopIdCounter;
  };

  func getNextInvoiceId() : Nat {
    invoiceIdCounter += 1;
    invoiceIdCounter;
  };

  func getNextPaymentId() : Nat {
    paymentIdCounter += 1;
    paymentIdCounter;
  };

  func getNextTrackingId() : Nat {
    trackingIdCounter += 1;
    trackingIdCounter;
  };

  func getNextReferralId() : Nat {
    referralIdCounter += 1;
    referralIdCounter;
  };

  func getNextNotificationId() : Nat {
    notificationIdCounter += 1;
    notificationIdCounter;
  };

  func getNextTariffId() : Nat {
    tariffIdCounter += 1;
    tariffIdCounter;
  };

  func getNextShopReviewId() : Nat {
    shopReviewIdCounter += 1;
    shopReviewIdCounter;
  };

  func getNextAreaId() : Nat {
    areaIdCounter += 1;
    areaIdCounter;
  };

  func getNextComplaintId() : Nat {
    complaintIdCounter += 1;
    complaintIdCounter;
  };

  func getNextBroadcastId() : Nat {
    broadcastIdCounter += 1;
    broadcastIdCounter;
  };

  func getNextClothingItemId() : Nat {
    clothingItemIdCounter += 1;
    clothingItemIdCounter;
  };

  func isAdminCaller(caller : Principal) : Bool {
    caller.toText() == HARDCODED_ADMIN or AccessControl.isAdmin(accessControlState, caller);
  };

  func currentTime() : Int {
    Time.now();
  };

  func checkUserNotBlocked(userId : Principal) {
    switch (users.get(userId)) {
      case (?user) {
        if (user.isBlocked) {
          Runtime.trap("User is blocked and cannot perform this action");
        };
      };
      case (null) { /* User not registered yet, allow */ };
    };
  };

  public shared ({ caller }) func claimAdminIfFirst() : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    true;
  };

  // Authorization and Approval Queries
  public query ({ caller }) func getAdminPrincipals() : async [Text] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view admin principals");
    };
    [HARDCODED_ADMIN];
  };

  public query ({ caller }) func isCallerApproved() : async Bool {
    isAdminCaller(caller) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can request approval");
    };
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // User Profile Methods
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(userId : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    if (caller != userId and not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(userId);
  };

  // Registered Users
  public shared ({ caller }) func registerUser(name : Text, phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register");
    };

    if (users.containsKey(caller)) {
      Runtime.trap("User already exists");
    };

    let user : User = {
      name;
      phone;
      balance = 0;
      totalEarnings = 0;
      completedOrders = 0;
      isBlocked = false;
    };

    users.add(caller, user);
  };

  public query ({ caller }) func getUser(userId : Principal) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    if (caller != userId and not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
  };

  // Admin - Get All Registered Users
  public query ({ caller }) func getAllRegisteredUsers() : async [(Principal, User)] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    users.toArray();
  };

  // Admin - Block / Unblock Users
  public shared ({ caller }) func blockUser(userId : Principal) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can block users");
    };
    let user = switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?u) { u };
    };
    let updatedUser = { user with isBlocked = true };
    users.add(userId, updatedUser);
  };

  public shared ({ caller }) func unblockUser(userId : Principal) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can unblock users");
    };
    let user = switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?u) { u };
    };
    let updatedUser = { user with isBlocked = false };
    users.add(userId, updatedUser);
  };

  public query func isUserBlocked(userId : Principal) : async Bool {
    switch (users.get(userId)) {
      case (null) { false };
      case (?user) { user.isBlocked };
    };
  };

  // Pricing
  public query ({ caller }) func getPricing() : async {
    shirtPrice : Nat;
    pantPrice : Nat;
    dressPrice : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view pricing");
    };
    { shirtPrice; pantPrice; dressPrice };
  };

  public shared ({ caller }) func setShirtPrice(price : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can update pricing");
    };
    shirtPrice := price;
  };

  public shared ({ caller }) func setPantPrice(price : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can update pricing");
    };
    pantPrice := price;
  };

  public shared ({ caller }) func setDressPrice(price : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can update pricing");
    };
    dressPrice := price;
  };

  // Shop Management
  public shared ({ caller }) func registerShop(ownerName : Text, mobile : Text, shopName : Text, address : Text, serviceArea : Nat, pricePerCloth : Nat, workingHours : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register shops");
    };
    checkUserNotBlocked(caller);

    let shopId = getNextShopId();
    let shop : Shop = {
      id = shopId;
      ownerId = caller;
      ownerName;
      mobile;
      shopName;
      address;
      serviceArea;
      pricePerCloth;
      workingHours;
      status = #pending;
      createdAt = currentTime();
    };
    shops.add(shopId, shop);
    shopId;
  };

  public query ({ caller }) func getShopsByStatus(status : ShopStatus) : async [Shop] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view shops by status");
    };
    let allShops = shops.values().toArray();
    allShops.filter(func(shop : Shop) : Bool { shop.status == status });
  };

  public query ({ caller }) func getAllShops() : async [Shop] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all shops");
    };
    shops.values().toArray();
  };

  public query ({ caller }) func getActiveShops() : async [Shop] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view active shops");
    };
    let allShops = shops.values().toArray();
    allShops.filter(func(shop : Shop) : Bool { shop.status == #active });
  };

  public shared ({ caller }) func approveShop(shopId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can approve shops");
    };
    let shop = switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?s) { s };
    };
    let updatedShop = { shop with status = #active };
    shops.add(shopId, updatedShop);
  };

  public shared ({ caller }) func rejectShop(shopId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can reject shops");
    };
    let shop = switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?s) { s };
    };
    let updatedShop = { shop with status = #rejected };
    shops.add(shopId, updatedShop);
  };

  public shared ({ caller }) func suspendShop(shopId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can suspend shops");
    };
    let shop = switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?s) { s };
    };
    let updatedShop = { shop with status = #suspended };
    shops.add(shopId, updatedShop);
  };

  public shared ({ caller }) func deleteShop(shopId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete shops");
    };
    switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop not found") };
      case (?_) { shops.remove(shopId) };
    };
  };

  public query ({ caller }) func getMyShop() : async ?Shop {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their shop");
    };
    shops.values().find(func(shop) { shop.ownerId == caller });
  };

  // Orders
  public shared ({ caller }) func placeOrder(
    shirts : Nat,
    pants : Nat,
    dresses : Nat,
    itemQuantities : [{ itemId : Nat; quantity : Nat }],
    address : Text,
    paymentMethod : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };
    checkUserNotBlocked(caller);

    let orderId = getNextOrderId();

    var totalAmount = shirts * shirtPrice + pants * pantPrice + dresses * dressPrice;

    for (item in itemQuantities.values()) {
      switch (clothingItems.get(item.itemId)) {
        case (?clothingItem) {
          totalAmount += clothingItem.pricePerItem * item.quantity;
        };
        case (null) {};
      };
    };

    let order : Order = {
      id = orderId;
      customerId = caller;
      partnerId = null;
      status = #pending;
      shirts;
      pants;
      dresses;
      clothingItems = itemQuantities;
      totalAmount;
      address;
      paymentMethod;
      createdAt = currentTime();
      updatedAt = currentTime();
    };
    orders.add(orderId, order);
    orderId;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their orders");
    };
    orders.values().toArray().filter(func(order) { order.customerId == caller });
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (caller != order.customerId and not isAdminCaller(caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };
    let updatedOrder = { order with status; updatedAt = currentTime() };
    orders.add(orderId, updatedOrder);
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Areas
  public shared ({ caller }) func addArea(name : Text, city : Text, pincode : Text) : async Nat {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can add areas");
    };
    let areaId = getNextAreaId();
    let area : Area = {
      id = areaId;
      name;
      city;
      pincode;
      isActive = true;
      assignedShopIds = [];
      shirtPrice = 12;
      pantPrice = 12;
      dressPrice = 15;
    };
    areas.add(areaId, area);
    areaId;
  };

  public shared ({ caller }) func disableArea(areaId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can disable areas");
    };
    let area = switch (areas.get(areaId)) {
      case (null) { Runtime.trap("Area not found") };
      case (?a) { a };
    };
    let newArea = { area with isActive = false };
    areas.add(areaId, newArea);
  };

  public shared ({ caller }) func enableArea(areaId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can enable areas");
    };
    let area = switch (areas.get(areaId)) {
      case (null) { Runtime.trap("Area not found") };
      case (?a) { a };
    };
    let newArea = { area with isActive = true };
    areas.add(areaId, newArea);
  };

  public query ({ caller }) func getAllAreas() : async [Area] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view areas");
    };
    areas.values().toArray();
  };

  public shared ({ caller }) func assignShopToArea(shopId : Nat, areaId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can assign shops to areas");
    };
    let area = switch (areas.get(areaId)) {
      case (null) { Runtime.trap("Area not found") };
      case (?a) { a };
    };

    let assignedShopsList = List.fromArray<Nat>(area.assignedShopIds);
    assignedShopsList.add(shopId);
    let newArea = { area with assignedShopIds = assignedShopsList.toArray() };
    areas.add(areaId, newArea);
  };

  public shared ({ caller }) func setAreaPrice(
    areaId : Nat,
    shirtPrice : Nat,
    pantPrice : Nat,
    dressPrice : Nat,
  ) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can set area pricing");
    };
    let area = switch (areas.get(areaId)) {
      case (null) { Runtime.trap("Area not found") };
      case (?a) { a };
    };
    let newArea = {
      area with
      shirtPrice;
      pantPrice;
      dressPrice;
    };
    areas.add(areaId, newArea);
  };

  // Broadcast Notifications
  public shared ({ caller }) func sendBroadcastNotification(message : Text, targetAudience : Text) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can send broadcasts");
    };
    let broadcastId = getNextBroadcastId();
    let broadcast : Broadcast = {
      id = broadcastId;
      message;
      targetAudience;
      sentAt = currentTime();
    };
    broadcasts.add(broadcastId, broadcast);
  };

  public query ({ caller }) func getAllBroadcasts() : async [Broadcast] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all broadcasts");
    };
    broadcasts.values().toArray();
  };

  public query ({ caller }) func getUserNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };
    let allNotifications = notifications.values().toArray();
    allNotifications.filter(func(notification) { notification.userId == caller });
  };

  // Complaints
  public shared ({ caller }) func submitComplaint(orderId : Nat, complaintType : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit complaints");
    };
    checkUserNotBlocked(caller);

    let complaintId = getNextComplaintId();
    let complaint : Complaint = {
      id = complaintId;
      orderId;
      customerId = caller;
      complaintType;
      description;
      status = "open";
      createdAt = currentTime();
    };
    complaints.add(complaintId, complaint);
  };

  public shared ({ caller }) func updateComplaintStatus(complaintId : Nat, status : Text) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can update complaint status");
    };
    let complaint = switch (complaints.get(complaintId)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?c) { c };
    };
    let newComplaint = { complaint with status };
    complaints.add(complaintId, newComplaint);
  };

  public query ({ caller }) func getAllComplaints() : async [Complaint] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all complaints");
    };
    complaints.values().toArray();
  };

  // Admin Stats
  public query ({ caller }) func getAdminStats() : async AdminStats {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view admin stats");
    };

    let allOrders = orders.values().toArray();
    let allShops = shops.values().toArray();
    let allUsers = users.values().toArray();

    let now = currentTime();
    let oneDayNanos : Int = 24 * 60 * 60 * 1_000_000_000;
    let todayStart = now - oneDayNanos;

    let totalOrdersToday = allOrders.filter(func(order) { order.createdAt >= todayStart }).size();
    let totalCustomers = allUsers.size();
    let totalShops = allShops.size();
    let pendingShopApprovals = allShops.filter(func(shop) { shop.status == #pending }).size();

    var totalEarnings = 0;
    for (order in allOrders.vals()) {
      totalEarnings += order.totalAmount;
    };

    let activeOrders = allOrders.filter(func(order) {
      order.status != #cancelled and order.status != #delivered
    }).size();

    let pendingOrders = allOrders.filter(func(order) {
      order.status == #pending
    }).size();

    {
      totalOrdersToday;
      totalCustomers;
      totalShops;
      pendingShopApprovals;
      totalEarnings;
      activeOrders;
      pendingOrders;
    };
  };

  // Clothing Item Catalog
  public shared ({ caller }) func addClothingItem(name : Text, pricePerItem : Nat) : async Nat {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can add clothing items");
    };
    let itemId = getNextClothingItemId();
    let clothingItem : ClothingItem = {
      id = itemId;
      name;
      pricePerItem;
      isActive = true;
      createdAt = currentTime();
    };
    clothingItems.add(itemId, clothingItem);
    itemId;
  };

  public shared ({ caller }) func updateClothingItem(itemId : Nat, name : Text, pricePerItem : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can update clothing items");
    };
    let clothingItem = switch (clothingItems.get(itemId)) {
      case (null) { Runtime.trap("Clothing item not found") };
      case (?item) { item };
    };
    let updatedItem = { clothingItem with name; pricePerItem };
    clothingItems.add(itemId, updatedItem);
  };

  public shared ({ caller }) func deleteClothingItem(itemId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete clothing items");
    };
    switch (clothingItems.get(itemId)) {
      case (null) { Runtime.trap("Clothing item not found") };
      case (?_) { clothingItems.remove(itemId) };
    };
  };

  public shared ({ caller }) func enableClothingItem(itemId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can enable clothing items");
    };
    let clothingItem = switch (clothingItems.get(itemId)) {
      case (null) { Runtime.trap("Clothing item not found") };
      case (?item) { item };
    };
    let updatedItem = { clothingItem with isActive = true };
    clothingItems.add(itemId, updatedItem);
  };

  public shared ({ caller }) func disableClothingItem(itemId : Nat) : async () {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can disable clothing items");
    };
    let clothingItem = switch (clothingItems.get(itemId)) {
      case (null) { Runtime.trap("Clothing item not found") };
      case (?item) { item };
    };
    let updatedItem = { clothingItem with isActive = false };
    clothingItems.add(itemId, updatedItem);
  };

  public query ({ caller }) func getActiveClothingItems() : async [ClothingItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view active clothing items");
    };
    clothingItems.values().toArray().filter(func(item) { item.isActive });
  };

  public query ({ caller }) func getAllClothingItems() : async [ClothingItem] {
    if (not isAdminCaller(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all clothing items");
    };
    clothingItems.values().toArray();
  };

  // Helper
  public query ({ caller }) func whoAmI() : async Text {
    caller.toText();
  };
};
