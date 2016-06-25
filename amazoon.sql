PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customers(
  id INTEGER PRIMARY KEY ASC,
  customer_id char(10),
  customer_name char(50),
  customer_email char(50)
);

CREATE TABLE IF NOT EXISTS orders(
  id INTEGER PRIMARY KEY ASC,
  customer_id int,
  order_id char(25),
  order_date date,
  order_status char(10),
  order_total int(4,2),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS products(
  id INTEGER PRIMARY KEY ASC,
  product_id int,
  product_label char(50),
  unit_price number(3,2)
);

CREATE TABLE IF NOT EXISTS order_contents(
  order_id int,
  product_id int,
  quantity int(2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
