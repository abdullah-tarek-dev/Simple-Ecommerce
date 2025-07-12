-- Table: public.admins

-- DROP TABLE IF EXISTS public.admins;

CREATE TABLE IF NOT EXISTS public.admins
(
    id integer NOT NULL DEFAULT nextval('admins_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT admins_pkey PRIMARY KEY (id),
    CONSTRAINT admins_email_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.admins
    OWNER to postgres;


	-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

-- Table: public.products

-- DROP TABLE IF EXISTS public.products;

CREATE TABLE IF NOT EXISTS public.products
(
    id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    price numeric(10,2) NOT NULL,
    image text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    stock integer DEFAULT 0,
    admin_id integer,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT fk_admin FOREIGN KEY (admin_id)
        REFERENCES public.admins (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.products
    OWNER to postgres;



	-- Table: public.orders

-- DROP TABLE IF EXISTS public.orders;

CREATE TABLE IF NOT EXISTS public.orders
(
    id integer NOT NULL DEFAULT nextval('orders_id_seq'::regclass),
    user_id integer,
    total_price numeric(10,2),
    status character varying(50) COLLATE pg_catalog."default",
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.orders
    OWNER to postgres;



	
-- Table: public.order_details

-- DROP TABLE IF EXISTS public.order_details;

CREATE TABLE IF NOT EXISTS public.order_details
(
    id integer NOT NULL DEFAULT nextval('order_details_id_seq'::regclass),
    order_id integer,
    product_id integer,
    quantity integer,
    price numeric(10,2),
    CONSTRAINT order_details_pkey PRIMARY KEY (id),
    CONSTRAINT order_details_order_id_fkey FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT order_details_product_id_fkey FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.order_details
    OWNER to postgres;	



-- Table: public.payments

-- DROP TABLE IF EXISTS public.payments;

-- Create sequence if not exists
CREATE SEQUENCE IF NOT EXISTS payments_payment_id_seq;

-- Table: public.payments
DROP TABLE IF EXISTS public.payments;

CREATE TABLE IF NOT EXISTS public.payments (
    payment_id INTEGER NOT NULL DEFAULT nextval('payments_payment_id_seq') PRIMARY KEY,
    order_id INTEGER NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount NUMERIC(15,2) NOT NULL,
    method VARCHAR(30),
    status VARCHAR(20),
    
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id)
        REFERENCES public.orders (id) ON DELETE NO ACTION,

    CONSTRAINT payments_method_check CHECK (
        method IN ('Credit Card', 'PayPal', 'Cash', 'Bank Transfer')
    ),
    
    CONSTRAINT payments_status_check CHECK (
        status IN ('Pending', 'Completed', 'Failed')
    )
);

ALTER TABLE IF EXISTS public.payments
    OWNER TO postgres;

CREATE OR REPLACE FUNCTION create_payment(
  p_order_id INT,
  p_amount NUMERIC,
  p_method VARCHAR(30),
  p_status VARCHAR(20) DEFAULT 'Pending'
)
RETURNS TEXT AS $$
DECLARE
  exists_order INT;
BEGIN
  -- تحقق من وجود الطلب
  SELECT COUNT(*) INTO exists_order FROM orders WHERE id = p_order_id;

  IF exists_order = 0 THEN
    RETURN '❌ الطلب غير موجود';
  END IF;

  -- تحقق من أن وسيلة الدفع ضمن القيم المسموحة
  IF p_method NOT IN ('Credit Card', 'PayPal', 'Cash', 'Bank Transfer') THEN
    RETURN '❌ وسيلة الدفع غير مدعومة';
  END IF;

  -- تحقق من أن حالة الدفع ضمن القيم المسموحة
  IF p_status NOT IN ('Pending', 'Completed', 'Failed') THEN
    RETURN '❌ حالة الدفع غير صالحة';
  END IF;

  -- إدخال الدفع
  INSERT INTO payments (order_id, amount, method, status)
  VALUES (p_order_id, p_amount, p_method, p_status);

  RETURN '✅ تم إنشاء الدفع بنجاح';
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS create_payment(INT, NUMERIC, VARCHAR, VARCHAR);


select * from payments
-- الدوال المطلوبة (10 دوال)

-- 1. المنتجات اللي سعرها فوق 100
CREATE OR REPLACE FUNCTION get_expensive_products()
RETURNS TABLE(name VARCHAR, price NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT p.name, p.price
  FROM products p
  WHERE p.price > 100;
END;
$$ LANGUAGE plpgsql;


drop function get_expensive_products()

-- 2. عدد المنتجات لكل Admin مع شرط
CREATE OR REPLACE FUNCTION get_admins_with_many_products()
RETURNS TABLE(admin_id INT, product_count INT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.admin_id, COUNT(*)::INT AS product_count
  FROM products p
  WHERE p.admin_id IS NOT NULL
  GROUP BY p.admin_id
  HAVING COUNT(*) > 2;
END;
$$ LANGUAGE plpgsql;



drop function get_admins_with_many_products()


-- 3. تفاصيل الطلبات مع العملاء
CREATE OR REPLACE FUNCTION get_orders_with_users()
RETURNS TABLE(order_id INT, user_name VARCHAR, total_price NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, u.name, o.total_price
  FROM orders o
  INNER JOIN users u ON o.user_id = u.id;
END;
$$ LANGUAGE plpgsql;

drop function get_orders_with_users()

-- 4. المنتجات والمسؤولين (LEFT JOIN)
CREATE OR REPLACE FUNCTION get_products_with_admins()
RETURNS TABLE(product_name VARCHAR, admin_name VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT p.name, a.name
  FROM products p
  LEFT JOIN admins a ON p.admin_id = a.id;

END;
$$ LANGUAGE plpgsql;

drop function get_products_with_admins()

-- 5. الطلبات والمدفوعات (RIGHT JOIN)
CREATE OR REPLACE FUNCTION get_orders_with_payments()
RETURNS TABLE(order_id INT, payment_amount NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, p.amount
FROM payments p
JOIN orders o ON o.id = p.order_id;
END;
$$ LANGUAGE plpgsql;

drop function get_orders_with_payments()

-- 6. المنتجات الأعلى من المتوسط
CREATE OR REPLACE FUNCTION get_products_above_avg_price()
RETURNS TABLE(product_name VARCHAR, product_price NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT p.name, p.price
  FROM products p
  WHERE p.price > (SELECT AVG(price) FROM products);
END;
$$ LANGUAGE plpgsql;

drop function get_products_above_avg_price()


-- 7. إجمالي الإيرادات
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS NUMERIC AS $$
DECLARE
  revenue NUMERIC;
BEGIN
  SELECT SUM(total_price) INTO revenue FROM orders;
  RETURN revenue;
END;
$$ LANGUAGE plpgsql;



-- 8. عدد العملاء
CREATE OR REPLACE FUNCTION get_total_users()
RETURNS INT AS $$
DECLARE
  total INT;
BEGIN
  SELECT COUNT(*) INTO total FROM users;
  RETURN total;
END;
$$ LANGUAGE plpgsql;

drop function get_total_users()

-- 9. المتوسط العام للكمية في الطلبات
CREATE OR REPLACE FUNCTION get_avg_quantity_per_order()
RETURNS NUMERIC AS $$
DECLARE
  avg_quantity NUMERIC;
BEGIN
  SELECT AVG(quantity) INTO avg_quantity FROM order_details;
  RETURN avg_quantity;
END;
$$ LANGUAGE plpgsql;

drop function get_avg_quantity_per_order()

-- 10. المنتجات ذات المخزون القليل
CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS TABLE(name VARCHAR, stock INT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.name, p.stock
  FROM products p
  WHERE p.stock < 10;
END;
$$ LANGUAGE plpgsql;


drop function get_low_stock_products()


DROP FUNCTION IF EXISTS orders_with_users();

CREATE OR REPLACE FUNCTION orders_with_users()
RETURNS TABLE (
  order_id INT,
  order_date TIMESTAMP,
  customer_name VARCHAR,
  customer_email VARCHAR
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_date,
    u.name,
    u.email
  FROM orders o
  JOIN users u ON o.user_id = u.id;
END;
$$ LANGUAGE plpgsql;

SELECT * FROM orders_with_users();

-- ALTER TABLE products ADD COLUMN stock INT DEFAULT 0;
-- ALTER TABLE products ADD COLUMN admin_id INT;
-- ALTER TABLE products
-- ADD CONSTRAINT fk_admin
-- FOREIGN KEY (admin_id)
-- REFERENCES admins(id)
-- ON DELETE SET NULL;

 SELECT * FROM products;

 SELECT * FROM get_products_above_avg_price();
SELECT * FROM get_expensive_products();
SELECT * FROM get_admins_with_many_products();
select * from get_low_stock_products();
select * from get_total_users();
select * from get_avg_quantity_per_order();
select * from get_total_revenue();
select * from get_orders_with_payments();
select * from get_orders_with_users();
select * from get_products_with_admins();

select * from cart_items
SELECT * FROM users WHERE id = 10;

SELECT ci.*, p.name 
FROM cart_items ci 
JOIN products p ON ci.product_id = p.id 
WHERE ci.user_id = 10;


ALTER TABLE cart_items ADD CONSTRAINT unique_user_product UNIQUE (user_id, product_id);
SELECT * FROM cart_items WHERE user_id = 14;

CREATE OR REPLACE FUNCTION get_cart_items(p_user_id INT)
RETURNS TABLE (
  id INT,
  user_id INT,
  product_id INT,
  quantity INT,
  price NUMERIC,
  name TEXT,
  image TEXT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id, 
    ci.user_id, 
    ci.product_id, 
    ci.quantity, 
    ci.price, 
    p.name::TEXT,        -- <== هنا التعديل
    p.image::TEXT
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  WHERE ci.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_cart_items(INT);


SELECT *
FROM products
WHERE name = 'T-shirt H';
SELECT * FROM admins WHERE id = admin_id;

SELECT p.name AS product_name, a.name AS admin_name
FROM products p
LEFT JOIN admins a ON p.admin_id = a.id;

select * from Admins
SELECT * FROM get_cart_items(5)
SELECT id, name, admin_id FROM products WHERE name = 'T-shirt H';
SELECT id, name, admin_id FROM products;

select * from cart_items

select * from order_details




















SELECT
  routine_name,
  data_type,
  routine_type
FROM
  information_schema.routines
WHERE
  routine_schema = 'public'; -- أو schema اللي انت حاطط فيه الدوال


SELECT
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_code
FROM
  pg_proc p
JOIN
  pg_namespace n ON p.pronamespace = n.oid
WHERE
  n.nspname = 'public';  -- أو أي سكيمه انت شغال 


--  saeed ebraheem

--  add product
  
CREATE OR REPLACE FUNCTION public.add_product(
  p_name text,
  p_price numeric,
  p_image text,
  p_description text,
  p_stock integer,
  p_admin_id integer
)
RETURNS TABLE(
  id integer,
  name character varying,
  price numeric,
  image text,
  description text,
  
  created_at timestamp,
  stock integer,
  admin_id integer
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  INSERT INTO products (name, price, image, description, stock, admin_id)
  VALUES (p_name, p_price, p_image, p_description, p_stock, p_admin_id)
  RETURNING products.id, products.name, products.price, products.image,
            products.description, products.created_at, products.stock, products.admin_id;
END;
$function$;

DROP FUNCTION IF EXISTS public.add_product(
  text,
  numeric,
  text,
  text,
  integer,
  integer
);

-- end add product

-- FUNCTION: public.delete_product(integer)

-- DROP FUNCTION IF EXISTS public.delete_product(integer);

CREATE OR REPLACE FUNCTION public.delete_product(
	p_id integer)
    RETURNS TABLE(id integer) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
  RETURN QUERY DELETE FROM products
  WHERE products.id = p_id
  RETURNING products.id;
END;
$BODY$;

ALTER FUNCTION public.delete_product(integer)
    OWNER TO postgres;
	
--  end delete

-- start get all product 
-- FUNCTION: public.get_all_products()

-- DROP FUNCTION IF EXISTS public.get_all_products();

CREATE OR REPLACE FUNCTION public.get_all_products(
	)
    RETURNS TABLE(id integer, name character varying, price numeric, image text, description text) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
  RETURN QUERY 
    SELECT 
      p.id, 
      p.name, 
      p.price, 
      p.image, 
      p.description
    FROM products p
    ORDER BY p.id ASC;
END;
$BODY$;

ALTER FUNCTION public.get_all_products()
    OWNER TO postgres;
-- end get all product 

-- upadate product

-- FUNCTION: public.update_product(integer, text, numeric, text, text)

-- DROP FUNCTION IF EXISTS public.update_product(integer, text, numeric, text, text);

CREATE OR REPLACE FUNCTION public.update_product(
	p_id integer,
	p_name text,
	p_price numeric,
	p_image text,
	p_description text)
    RETURNS TABLE(id integer, name character varying, price numeric, image text, description text) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
  RETURN QUERY
  UPDATE products 
  SET
    name = p_name,
    price = p_price,
    image = p_image,
    description = p_description
WHERE products.id = p_id
  RETURNING products.id, products.name, products.price, products.image, products.description;
END;
$BODY$;

ALTER FUNCTION public.update_product(integer, text, numeric, text, text)
    OWNER TO postgres;

-- end update 

--  saeed ebraheem 
