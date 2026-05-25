export enum OrdersPermissions {
  Read = "read:orders",
  Write = "write:orders",
  Read_Single = "read:orders-single",
  Create = "create:orders",
}

export enum ItemsPermissions {
  Write = "write:items",
  Create = "create:items",
}

export enum CustomersPermissions {
  Read = "read:customers",
  Read_Single = "read:customers-single",
  Write = "write:customers",
  Create = "create:customers",
}

export enum SecurityPermissions {
  Deny = "deny:not-assigned",
}
