"""
Drop-in Flask routes for product images (Cloudinary URLs from frontend).

The frontend uploads images to Cloudinary and sends JSON:
{
  "name": "...",
  "slug": "...",
  "image_url": "https://res.cloudinary.com/.../first.jpg",
  "images": [
    "https://res.cloudinary.com/.../first.jpg",
    "https://res.cloudinary.com/.../second.jpg"
  ]
}

1. Run the SQL below once on your database.
2. Replace your admin product POST handler with the JSON version below.
"""

# --- SQL ------------------------------------------------------------------
PRODUCT_IMAGES_SQL = """
CREATE TABLE IF NOT EXISTS food_trade_product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES food_trade_products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_food_trade_product_images_product_id
    ON food_trade_product_images(product_id);
"""

# --- Flask routes ---------------------------------------------------------
"""
from flask import jsonify, request
from flask_jwt_extended import jwt_required

from database.connection import db_connection
from middleware.authMiddleware import get_authenticated_user_id
from routes.api_envelope import envelope
from . import food_trade_api
from .utils import check_admin


def _replace_product_images(cursor, product_id, image_urls):
    cursor.execute(
        "DELETE FROM food_trade_product_images WHERE product_id = ?",
        (product_id,),
    )

    for index, image_url in enumerate(image_urls):
        if not image_url:
            continue
        cursor.execute(
            '''
            INSERT INTO food_trade_product_images (product_id, image_url, sort_order)
            VALUES (?, ?, ?)
            ''',
            (product_id, image_url, index),
        )

    primary_image = image_urls[0] if image_urls else None
    cursor.execute(
        '''
        UPDATE food_trade_products
        SET image_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        ''',
        (primary_image, product_id),
    )


@food_trade_api.route("/product/images/<int:product_id>", methods=["GET"])
def get_product_images(product_id):
    conn, cursor = db_connection()
    cursor.execute(
        '''
        SELECT id, product_id, image_url, sort_order, created_at
        FROM food_trade_product_images
        WHERE product_id = ?
        ORDER BY sort_order ASC, id ASC
        ''',
        (product_id,),
    )
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(envelope(rows, "Product images retrieved successfully", 200, True)), 200


@food_trade_api.route("/admin/products", methods=["POST"])
@jwt_required()
def admin_upsert_product():
    user_id = get_authenticated_user_id()
    if not check_admin(user_id):
        return jsonify(envelope(None, "Forbidden: admin only", 403, False)), 403

    payload = request.json or {}
    product_id = payload.get("id")
    image_urls = payload.get("images") or []

    if not image_urls and payload.get("image_url"):
        image_urls = [payload.get("image_url")]

    conn, cursor = db_connection()

    if product_id:
        cursor.execute(
            '''
            UPDATE food_trade_products SET
                name = ?, slug = ?, description = ?, price_ghs = ?, unit = ?,
                min_order_qty = ?, stock_qty = ?, is_active = ?, category_id = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            ''',
            (
                payload.get("name"),
                payload.get("slug"),
                payload.get("description", ""),
                payload.get("price_ghs"),
                payload.get("unit"),
                payload.get("min_order_qty"),
                payload.get("stock_qty"),
                payload.get("is_active", True),
                payload.get("category_id"),
                product_id,
            ),
        )
    else:
        cursor.execute(
            '''
            INSERT INTO food_trade_products (
                name, slug, description, price_ghs, unit,
                min_order_qty, stock_qty, is_active, category_id, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                payload.get("name"),
                payload.get("slug"),
                payload.get("description", ""),
                payload.get("price_ghs"),
                payload.get("unit"),
                payload.get("min_order_qty"),
                payload.get("stock_qty"),
                payload.get("is_active", True),
                payload.get("category_id"),
                image_urls[0] if image_urls else None,
            ),
        )
        product_id = cursor.lastrowid

    if image_urls:
        _replace_product_images(cursor, product_id, image_urls)

    conn.commit()
    conn.close()
    return jsonify(envelope({"id": product_id}, "Product upserted", 200, True)), 200


@food_trade_api.route("/admin/products/<int:pid>", methods=["DELETE"])
@jwt_required()
def admin_delete_product(pid):
    user_id = get_authenticated_user_id()
    if not check_admin(user_id):
        return jsonify(envelope(None, "Forbidden: admin only", 403, False)), 403

    conn, cursor = db_connection()
    cursor.execute("DELETE FROM food_trade_product_images WHERE product_id = ?", (pid,))
    cursor.execute("DELETE FROM food_trade_products WHERE id = ?", (pid,))
    conn.commit()
    conn.close()
    return jsonify(envelope({"ok": True}, "Product deleted", 200, True)), 200
"""
