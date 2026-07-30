# Todo
- Complete my app for by making it work and implimenting the backend.
- I am no longer using supabase so remove all of it and use my flask backend instead.
- I am not user vite but nextjs so remove all vite codes from it.
- Create an enviroment file for the app and configure .

## Endpoints
### Auth
- Login: /auth/login
- Logout: /auth/logout
- Refresh Token: /auth/refresh-token
- Get User: /auth/me
- After authenticating use these endpoint to verify
   - verify-user: /food-trader/verify-user

### Products Endpoints
- use this code of the endpoints
"""
from flask import jsonify, request
from flask_jwt_extended import jwt_required

from database.connection import db_connection
from middleware.authMiddleware import get_authenticated_user_id
from routes.api_envelope import envelope
from . import food_trade_api
from .utils import check_admin


@food_trade_api.route("/products", methods=["GET"])
def list_products():
    category = request.args.get("category")
    q = request.args.get("q")
    
    query = """
        SELECT p.id, p.name, p.slug, p.description, p.price_ghs, p.unit, 
               p.min_order_qty, p.stock_qty, p.image_url, p.category_id,
               c.name as category_name, c.slug as category_slug
        FROM food_trade_products p
        LEFT JOIN food_trade_categories c ON p.category_id = c.id
        WHERE p.is_active = 1
    """
    params = []
    
    if category:
        query += " AND c.slug = ?"
        params.append(category)
        
    if q and q.strip():
        query += " AND p.name LIKE ?"
        params.append(f"%{q.strip()}%")
        
    query += " ORDER BY p.name ASC"
    
    conn, cursor = db_connection()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    products = []
    for row in rows:
        prod = dict(row)
        if prod.get("category_id"):
            prod["categories"] = {
                "name": prod.pop("category_name", None),
                "slug": prod.pop("category_slug", None)
            }
        products.append(prod)
        
    return jsonify(envelope(products, "Products retrieved successfully", 200, True)), 200


@food_trade_api.route("/products/<slug>", methods=["GET"])
def get_product_by_slug(slug):
    conn, cursor = db_connection()
    cursor.execute("""
        SELECT p.id, p.name, p.slug, p.description, p.price_ghs, p.unit, 
               p.min_order_qty, p.stock_qty, p.image_url, p.category_id,
               c.name as category_name, c.slug as category_slug
        FROM food_trade_products p
        LEFT JOIN food_trade_categories c ON p.category_id = c.id
        WHERE p.slug = ? AND p.is_active = 1
    """, (slug,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return jsonify(envelope(None, "Product not found", 404, False)), 404
        
    prod = dict(row)
    if prod.get("category_id"):
        prod["categories"] = {
            "name": prod.pop("category_name", None),
            "slug": prod.pop("category_slug", None)
        }
    return jsonify(envelope(prod, "Product retrieved successfully", 200, True)), 200


@food_trade_api.route("/admin/products", methods=["GET"])
@jwt_required()
def admin_list_products():
    user_id = get_authenticated_user_id()
    if not check_admin(user_id):
        return jsonify(envelope(None, "Forbidden: admin only", 403, False)), 403
        
    conn, cursor = db_connection()
    cursor.execute("""
        SELECT id, name, slug, description, price_ghs, unit, 
               min_order_qty, stock_qty, is_active, category_id
        FROM food_trade_products ORDER BY name ASC
    """)
    rows = cursor.fetchall()
    conn.close()
    return jsonify(envelope([dict(r) for r in rows], "Admin products", 200, True)), 200


@food_trade_api.route("/admin/products", methods=["POST"])
@jwt_required()
def admin_upsert_product():
    user_id = get_authenticated_user_id()
    if not check_admin(user_id):
        return jsonify(envelope(None, "Forbidden: admin only", 403, False)), 403
        
    data = request.json
    conn, cursor = db_connection()
    
    if data.get("id"):
        # Update
        cursor.execute("""
            UPDATE food_trade_products SET
                name=?, slug=?, description=?, price_ghs=?, unit=?, 
                min_order_qty=?, stock_qty=?, is_active=?, category_id=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        """, (data.get("name"), data.get("slug"), data.get("description", ""), 
              data.get("price_ghs"), data.get("unit"), data.get("min_order_qty"), 
              data.get("stock_qty"), data.get("is_active", True), data.get("category_id"), data.get("id")))
    else:
        # Insert
        cursor.execute("""
            INSERT INTO food_trade_products (name, slug, description, price_ghs, unit, min_order_qty, stock_qty, is_active, category_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (data.get("name"), data.get("slug"), data.get("description", ""), 
              data.get("price_ghs"), data.get("unit"), data.get("min_order_qty"), 
              data.get("stock_qty"), data.get("is_active", True), data.get("category_id")))
              
    conn.commit()
    conn.close()
    return jsonify(envelope({"ok": True}, "Product upserted", 200, True)), 200


@food_trade_api.route("/admin/products/<int:pid>", methods=["DELETE"])
@jwt_required()
def admin_delete_product(pid):
    user_id = get_authenticated_user_id()
    if not check_admin(user_id):
        return jsonify(envelope(None, "Forbidden: admin only", 403, False)), 403
        
    conn, cursor = db_connection()
    cursor.execute("DELETE FROM food_trade_products WHERE id = ?", (pid,))
    conn.commit()
    conn.close()
    return jsonify(envelope({"ok": True}, "Product deleted", 200, True)), 200
"""

### Orders Endpoints
- Use this code. they contain the endpoint
"""
import threading
from flask import jsonify, request
from flask_jwt_extended import jwt_required

from database.connection import db_connection
from middleware.authMiddleware import get_authenticated_user_id
from routes.api_envelope import envelope
from . import food_trade_api
from .utils import check_admin, update_product_stock


@food_trade_api.route("/orders", methods=["POST"])
@jwt_required()
def place_order():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify(envelope(None, "Unauthorized", 401, False)), 401
        
    data = request.json
    if not data or not data.get("items"):
        return jsonify(envelope(None, "Items are required", 400, False)), 400
        
    contact_phone = data.get("contact_phone", "")
    delivery_region = data.get("delivery_region", "")
    delivery_address = data.get("delivery_address", "")
    notes = data.get("notes", "")
    items = data.get("items", [])
    
    product_ids = [item.get("product_id") for item in items if item.get("product_id")]
    if not product_ids:
        return jsonify(envelope(None, "Invalid items", 400, False)), 400
        
    conn, cursor = db_connection()
    
    # Check products
    placeholders = ",".join(["?"] * len(product_ids))
    cursor.execute(f"SELECT id, name, price_ghs, is_active FROM food_trade_products WHERE id IN ({placeholders})", product_ids)
    products_db = cursor.fetchall()
    
    prod_map = {str(p["id"]): p for p in products_db}
    
    total = 0
    order_rows = []
    
    for item in items:
        pid = str(item.get("product_id"))
        qty = int(item.get("qty", 1))
        
        p = prod_map.get(pid)
        if not p or not p["is_active"]:
            conn.close()
            return jsonify(envelope(None, f"Product {pid} unavailable", 400, False)), 400
            
        unit_price = float(p["price_ghs"])
        line_total = unit_price * qty
        total += line_total
        
        order_rows.append({
            "product_id": p["id"],
            "product_name": p["name"],
            "qty": qty,
            "unit_price_ghs": unit_price
        })
        
    # Create order
    cursor.execute("""
        INSERT INTO food_trade_orders (user_id, contact_phone, delivery_region, delivery_address, notes, total_ghs, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    """, (user_id, contact_phone, delivery_region, delivery_address, notes, total))
    order_id = cursor.lastrowid
    
    # Create order items
    for row in order_rows:
        cursor.execute("""
            INSERT INTO food_trade_order_items (order_id, product_id, product_name, qty, unit_price_ghs)
            VALUES (?, ?, ?, ?, ?)
        """, (order_id, row["product_id"], row["product_name"], row["qty"], row["unit_price_ghs"]))
        
        # Async stock update
        threading.Thread(target=update_product_stock, args=(row["product_id"], row["qty"])).start()
        
    conn.commit()
    conn.close()
    
    return jsonify(envelope({"orderId": order_id, "total": total}, "Order placed successfully", 201, True)), 201


@food_trade_api.route("/orders/me", methods=["GET"])
@jwt_required()
def get_my_orders():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify(envelope(None, "Unauthorized", 401, False)), 401
        
    conn, cursor = db_connection()
    cursor.execute("""
        SELECT id, status, total_ghs, created_at, delivery_region 
        FROM food_trade_orders 
        WHERE user_id = ? ORDER BY created_at DESC
    """, (user_id,))
    orders_rows = cursor.fetchall()
    
    orders = []
    for ord_row in orders_rows:
        o = dict(ord_row)
        cursor.execute("SELECT id, product_name, qty, unit_price_ghs FROM food_trade_order_items WHERE order_id = ?", (o["id"],))
        o["order_items"] = [dict(i) for i in cursor.fetchall()]
        orders.append(o)
        
    conn.close()
    return jsonify(envelope(orders, "Orders retrieved successfully", 200, True)), 200


@food_trade_api.route("/admin/orders", methods=["GET"])
@jwt_required()
def admin_list_orders():
    user_id = get_authenticated_user_id()
    if not check_admin(user_id):
        return jsonify(envelope(None, "Forbidden: admin only", 403, False)), 403
        
    conn, cursor = db_connection()
    cursor.execute("""
        SELECT id, user_id, status, total_ghs, contact_phone, 
               delivery_region, delivery_address, notes, created_at
        FROM food_trade_orders ORDER BY created_at DESC
    """)
    orders_rows = cursor.fetchall()
    
    orders = []
    for ord_row in orders_rows:
        o = dict(ord_row)
        cursor.execute("SELECT id, product_name, qty, unit_price_ghs FROM food_trade_order_items WHERE order_id = ?", (o["id"],))
        o["order_items"] = [dict(i) for i in cursor.fetchall()]
        orders.append(o)
        
    conn.close()
    return jsonify(envelope(orders, "Admin orders", 200, True)), 200


@food_trade_api.route("/admin/orders/status", methods=["POST"])
@jwt_required()
def admin_update_order_status():
    user_id = get_authenticated_user_id()
    if not check_admin(user_id):
        return jsonify(envelope(None, "Forbidden: admin only", 403, False)), 403
        
    data = request.json
    order_id = data.get("id")
    status = data.get("status")
    
    if not order_id or status not in ["pending", "confirmed", "shipped", "delivered", "cancelled"]:
        return jsonify(envelope(None, "Invalid data", 400, False)), 400
        
    conn, cursor = db_connection()
    cursor.execute("UPDATE food_trade_orders SET status = ? WHERE id = ?", (status, order_id))
    conn.commit()
    conn.close()
    return jsonify(envelope({"ok": True}, "Order status updated", 200, True)), 200
"""

### Categories Endpoints
"""
from flask import jsonify, request
from flask_jwt_extended import jwt_required

from database.connection import db_connection
from middleware.authMiddleware import get_authenticated_user_id
from routes.api_envelope import envelope
from . import food_trade_api
from .utils import check_admin


@food_trade_api.route("/categories", methods=["GET"])
def list_categories():
    conn, cursor = db_connection()
    cursor.execute("SELECT id, name, slug, sort_order FROM food_trade_categories WHERE is_active = 1 ORDER BY sort_order ASC")
    rows = cursor.fetchall()
    conn.close()
    
    categories = [dict(row) for row in rows]
    return jsonify(envelope(categories, "Categories retrieved successfully", 200, True)), 200


@food_trade_api.route("/admin/categories", methods=["GET"])
@jwt_required()
def admin_list_categories():
    user_id = get_authenticated_user_id()
    if not check_admin(user_id):
        return jsonify(envelope(None, "Forbidden: admin only", 403, False)), 403
        
    conn, cursor = db_connection()
    cursor.execute("SELECT id, name, slug, sort_order FROM food_trade_categories ORDER BY sort_order ASC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify(envelope([dict(r) for r in rows], "Admin categories", 200, True)), 200

"""

### Whatsapp Endpoints
"""
from flask import jsonify, request
from flask_jwt_extended import jwt_required

from database.connection import db_connection
from middleware.authMiddleware import get_authenticated_user_id
from routes.api_envelope import envelope
from . import food_trade_api
from .utils import check_admin


@food_trade_api.route("/categories", methods=["GET"])
def list_categories():
    conn, cursor = db_connection()
    cursor.execute("SELECT id, name, slug, sort_order FROM food_trade_categories WHERE is_active = 1 ORDER BY sort_order ASC")
    rows = cursor.fetchall()
    conn.close()
    
    categories = [dict(row) for row in rows]
    return jsonify(envelope(categories, "Categories retrieved successfully", 200, True)), 200


@food_trade_api.route("/admin/categories", methods=["GET"])
@jwt_required()
def admin_list_categories():
    user_id = get_authenticated_user_id()
    if not check_admin(user_id):
        return jsonify(envelope(None, "Forbidden: admin only", 403, False)), 403
        
    conn, cursor = db_connection()
    cursor.execute("SELECT id, name, slug, sort_order FROM food_trade_categories ORDER BY sort_order ASC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify(envelope([dict(r) for r in rows], "Admin categories", 200, True)), 200
"""

### Admin Endpoints
"""
from flask import jsonify
from flask_jwt_extended import jwt_required

from middleware.authMiddleware import get_authenticated_user_id
from routes.api_envelope import envelope
from . import food_trade_api
from .utils import check_admin


@food_trade_api.route("/admin/is-admin", methods=["GET"])
@jwt_required()
def is_admin_check():
    user_id = get_authenticated_user_id()
    is_admin = check_admin(user_id) if user_id else False
    return jsonify(envelope({"isAdmin": is_admin}, "Admin status checked", 200, True)), 200

"""


##### Note
- [ ] Fix the proxy @src/proxy.ts: it is supposed to control page routing like if the user is in the dashboard and logged in he wont be able to go to the loggin page and vise versa. Pushing the user to not-found page if there is no page like that in the system.
- [ ] Fix the apiclient @src/lib/apiClient.ts: make sure all the zustand stores and the use of cookies aare all implimented. and fix the vite import to nextjs imports.
- [ ] Use the api client @src/lib/apiClient.ts to call the backend
- [ ] When consuming the backend, it should first be called in the @src/api then use react-query to cache the data in the @src/query. Example: @src/api/products.ts which should call the backend and then use react-query to cache the data in the @src/query/products.ts
- [ ] when calling a protected route and the user is not logged in send the back to the login page also if the user is logged in and his token has expired go back and get a new access token from the refresh-token endpoints maning if there is no token in the cookies send the user back to the login page.
- [ ] Make sure the calling of endpoints are not done twice.
- [ ] This app is a shop like app so it will have both normal user endpoints and admin endpoints so in @src/proxy.ts when checking routes, check if the user is admin or not.
- [ ] When consuming always check the response of the backend to know what is needed.
- [ ] Dont use middleware, use nextjs new proxy middleware (@src/proxy.ts)


## Folder Structure

```
src/
├── api/
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── expenses.ts
│   ├── categories.ts
│   ├── budget.ts
│   └── reports.ts
│
├── query/
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── expenses.ts
│   ├── categories.ts
│   ├── budget.ts
│   └── reports.ts
```

# Backend Data Models

The following database models already exist on the backend.

**Do not create, modify, or generate database tables or migrations.**

These models are provided only so the frontend knows the structure of the data returned by the API.

---

## User

The User model already exists.

Use it where referenced by other models.

Do not modify it.

---

## User Roles

The User Roles model references the User model using `user_id`.

### Fields

- id (UUID)
- user_id
- role
- created_at
- updated_at


# Frontend Notes

These models are the source of truth for the frontend.

When building pages, forms, tables, filters, and details pages if those pages or modals are not built yet:

- Assume these are the fields returned by the backend.
- Always inspect the backend response before consuming it.
- Never assume additional fields exist.
- Do not generate IDs, timestamps, expense numbers, or other server-generated values.
- Treat nullable fields (such as `email`, `phone`, and `left_date`) accordingly.