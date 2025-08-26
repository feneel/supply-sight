# SupplySight — Notes

## Assumptions
- Mock API is in-memory; mutations update only local state (lost on restart).
- `transferStock` simply deducts from the selected product, no warehouse-to-warehouse logic.
- Trend data is synthetic and deterministic (seeded variation each day).

## Trade-offs
- Used server-side pagination for realism.
- Chose `refetchQueries` after mutations (simpler & correct) instead of optimistic cache updates.
- Kept styling minimal with Tailwind; focused on UX clarity and business rules.
- No GraphQL Codegen to keep setup lighter.

## Improvements (if more time)
- Add sorting and column resizing to the table.
- Warehouse-to-warehouse stock transfers.
- Optimistic Apollo cache updates (skip refetch).
- GraphQL Codegen for typed hooks.
- Playwright end-to-end tests and accessibility passes (focus trap for Drawer).
