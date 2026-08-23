import { pgTable, serial, varchar, numeric, timestamp } from "drizzle-orm/pg-core"



export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});
