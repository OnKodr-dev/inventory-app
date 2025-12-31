export const items = [
    { id: "i1", name: "HDMI Cable 2m", sku: "HDMI-2M", unit: "ks", minStock: 10 },
    { id: "i2", name: "USB-C Charger 65W", sku: "USBC-65W", unit: "ks", minStock: 5 },
    { id: "i3", name: "Ethernet Cable CAT6 5m", sku: "CAT6-5M", unit: "ks", minStock: 20 },
  ];
  
  export const movements = [
    { id: "m1", itemId: "i1", type: "IN", qty: 30, note: "Initial stock", createdAt: "2025-12-30T10:00:00Z" },
    { id: "m2", itemId: "i1", type: "OUT", qty: 8, note: "Issued to team", createdAt: "2025-12-31T08:00:00Z" },
  
    { id: "m3", itemId: "i2", type: "IN", qty: 6, note: "Supplier delivery", createdAt: "2025-12-29T12:00:00Z" },
    { id: "m4", itemId: "i2", type: "OUT", qty: 3, note: "Workstations", createdAt: "2025-12-31T09:15:00Z" },
  
    { id: "m5", itemId: "i3", type: "IN", qty: 40, note: "Initial stock", createdAt: "2025-12-28T14:00:00Z" },
    { id: "m6", itemId: "i3", type: "OUT", qty: 25, note: "Office wiring", createdAt: "2025-12-31T07:30:00Z" },
  ];
  