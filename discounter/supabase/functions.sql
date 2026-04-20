-- Atomic stock decrement (prevents overselling)
create or replace function decrement_stock(product_id uuid, qty integer)
returns void
language plpgsql
security definer
as $$
begin
  update products
  set stock_qty = stock_qty - qty
  where id = product_id and stock_qty >= qty;

  if not found then
    raise exception 'Insufficient stock for product %', product_id;
  end if;
end;
$$;
