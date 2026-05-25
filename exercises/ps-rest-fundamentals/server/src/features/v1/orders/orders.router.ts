import express from "express";
import {
  upsertOrder,
  deleteOrder,
  getOrderDetail,
  getOrders,
  deleteOrderItem,
  addOrderItems,
} from "./orders.service";
import {
  idItemIdUUIDRequestSchema,
  idUUIDRequestSchema,
  orderItemsDTORequestSchema,
  orderPOSTRequestSchema,
  orderPUTRequestSchema,
  pagingRequestSchema,
} from "../types";
import { validate } from "../../../middleware/validation.middleware";
import { create } from "xmlbuilder2";
import {
  OrdersPermissions,
  SecurityPermissions,
} from "../../../config/permissions";
import { checkRequiredScope } from "../../../middleware/auth0.middleware";

export const ordersRouter = express.Router();

ordersRouter.get(
  "/",
  checkRequiredScope(OrdersPermissions.Read),
  validate(pagingRequestSchema),
  async (req, res) => {
    /*
    #swagger.summary = "Gets all orders"
    #swagger.parameters["start"]={
      description: "The starting index of orders to retrieve",
      required: true,
      type: "number"
    }
    #swagger.parameters["size"]={
      description: "The number of orders to retrieve",
      required: true,
      type: "number"
    }
    #swagger.responses[200] = {
      description: "The list of orders",
      schema: {$ref: "#/components/schemas/orders"}
    }
  */
    const data = pagingRequestSchema.parse(req);
    const orders = await getOrders(data.query.skip, data.query.take);

    res.json(orders);
  }
);

ordersRouter.get(
  "/:id",
  checkRequiredScope(OrdersPermissions.Read_Single),
  validate(idUUIDRequestSchema),
  async (req, res) => {
    /*
    #swagger.summary = "Gets a specific order by ID"
    #swagger.responses[200] = {
      description: "The order",
      schema: {$ref: "#/components/schemas/order"}
    }
  */
    const data = idUUIDRequestSchema.parse(req);
    const order = await getOrderDetail(data.params.id);
    if (order != null) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order Not Found" });
    }
  }
);

ordersRouter.post(
  "/",
  checkRequiredScope(OrdersPermissions.Create),
  validate(orderPOSTRequestSchema),
  async (req, res) => {
    /*
      #swagger.summary = "Creates a new order"
      #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/orderDTO"}
      }
      #swagger.responses[201] = {
        description: "The order",
        schema: {$ref: "#/components/schemas/order"}
      } 
    */
    const data = orderPOSTRequestSchema.parse(req);
    const order = await upsertOrder(data.body);
    if (order != null) {
      if (req.headers["accept"] == "application/xml") {
        res.status(201).send(create().ele("order", order).end());
      } else {
        res.status(201).json(order);
      }
    } else {
      if (req.headers["accept"] == "application/xml") {
        res
          .status(500)
          .send(create().ele("error", { message: "Creation failed" }).end());
      } else {
        res.status(500).json({ message: "Creation failed" });
      }
    }
  }
);

ordersRouter.delete(
  "/:id",
  checkRequiredScope(SecurityPermissions.Deny),
  validate(idUUIDRequestSchema),
  async (req, res) => {
    /*
      #swagger.summary = "Deletes a specific order by ID"
      #swagger.responses[200] = {
        description: "The order that was deleted",
        schema: {$ref: "#/components/schemas/order"}
      }
    */
    const data = idUUIDRequestSchema.parse(req);
    const order = await deleteOrder(data.params.id);
    if (order != null) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order Not Found" });
    }
  }
);

ordersRouter.put(
  "/:id",
  checkRequiredScope(OrdersPermissions.Write),
  validate(orderPUTRequestSchema),
  async (req, res) => {
    /*
      #swagger.summary = "Updates an order's status"
      #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/updateOrderDTO"}
      }
      #swagger.responses[200] = {
        description: "The order",
        schema: {$ref: "#/components/schemas/order"}
      } 
    */
    const data = orderPUTRequestSchema.parse(req);
    const orderData = { customerId: "", ...data.body };
    const order = await upsertOrder(orderData, data.params.id);
    if (order != null) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order Not Found" });
    }
  }
);

ordersRouter.delete(
  "/:id/items/:itemId",
  checkRequiredScope(OrdersPermissions.Create),
  validate(idItemIdUUIDRequestSchema),
  async (req, res) => {
    /*
    #swagger.summary = "Deletes a specific item from an order by order and item ID"
    #swagger.responses[200] = {
      description: "The order after the item is deleted",
      schema: {$ref: "#/components/schemas/order"}
    }
  */
    const data = idItemIdUUIDRequestSchema.parse(req);
    const order = await deleteOrderItem(data.params.id, data.params.itemId);
    if (order != null) {
      if (req.headers["accept"] == "application/xml") {
        res.status(201).send(create().ele("order", order).end());
      } else {
        res.status(201).json(order);
      }
    } else {
      if (req.headers["accept"] == "application/xml") {
        res
          .status(404)
          .send(
            create().ele("error", { message: "Order or item not found" }).end()
          );
      } else {
        res.status(404).json({ message: "Order or item not found" });
      }
    }
  }
);

ordersRouter.post(
  "/:id/items",
  checkRequiredScope(OrdersPermissions.Create),
  validate(orderItemsDTORequestSchema),
  async (req, res) => {
    /*
    #swagger.summary = "Adds items to an order"
    #swagger.requestBody = {
      required: true,
      schema: { $ref: "#/components/schemas/orderItemsDTO"}
    } 
    #swagger.responses[201] = {
      description: "The order after the item is added",
      schema: {$ref: "#/components/schemas/order"}
    }
  */
    const data = orderItemsDTORequestSchema.parse(req);
    const order = await addOrderItems(data.params.id, data.body);

    if (order != null) {
      if (req.headers["accept"] == "application/xml") {
        res.status(201).send(create().ele("order", order).end());
      } else {
        res.status(201).json(order);
      }
    } else {
      if (req.headers["accept"] == "application/xml") {
        res
          .status(500)
          .send(create().ele("error", { message: "Creation failed" }).end());
      } else {
        res.status(500).json({ message: "Creation failed" });
      }
    }
  }
);
