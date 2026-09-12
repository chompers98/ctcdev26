# Write-up

## 1. What did you build for Part B, and why that?

Three connected pieces on top of the existing schema: duplicate-restaurant prevention (`409` on a repeated name + address), a visits and spending API (log, list, and delete visits, plus a per-restaurant spending summary), and a budget-aware recommendation endpoint that suggests the highest-rated restaurant Brennen has visited and can still afford. I also added a light UI: an add-restaurant form on the home page, a restaurant detail page with visit history and logging, and a "Where should I eat?" page for the recommendation.

The app is named Feeding Brennen and is supposed to track spending, but `visits`, its types, and its row mapper already existed in the codebase with no API or UI behind them. That gap between what the app claims to do and what it actually does felt like the real thing to build, and the recommendation gives the spending data an actual use.

## 2. What did you decide, and what did you rule out?

"Liked" reuses the restaurant's existing `rating` field (`>= 4`) rather than a second per-visit rating column, since a rating already existed. The recommendation only considers restaurants Brennen has already visited, using each one's own average spend as its cost estimate, instead of guessing at cost for places with no visit history. Duplicate prevention is a database unique index rather than an application-level check before insert, since check-then-insert has a race condition and the index is atomic. Visit deletion lives at a flat `/api/visits/:id` rather than nested under its restaurant, since a visit's own id is already enough to find it.

Ruled out: editing a logged visit (delete and re-log covers a mistake without doubling the CRUD surface), and recommending unvisited restaurants (estimating their cost would mean guessing from other restaurants in the same cuisine, too speculative given how little data is seeded).

Tradeoff I'm least sure about: limiting recommendations to visited restaurants means it can never surface something new.

## 3. Where did you cut corners?

Visit history has no pagination. Restaurants and visits can be created and deleted but not edited. The recommendation returns one suggestion, no ranked alternatives. The UI has no loading states, every action waits on the network response before refreshing.

With another day, I'd add editing for restaurants and visits, and reconsider whether the recommendation should weigh liked cuisines more broadly instead of only restaurants Brennen has personally logged.

---

## Part B: routes

| Method and path | What it does | Success | Errors |
| --- | --- | --- | --- |
| `POST /api/restaurants` (extended) | Also enforces name + address uniqueness | `201` as before | `409` if a restaurant with the same name and address already exists |
| `GET /api/restaurants/:id/visits` | Lists a restaurant's visits, most recent first | `200` + array | `404` if the restaurant doesn't exist |
| `POST /api/restaurants/:id/visits` | Logs a new visit for a restaurant | `201` + created visit | `404` if the restaurant doesn't exist, `400` on an invalid body |
| `DELETE /api/visits/:id` | Removes a logged visit | `204` | `404` if the visit doesn't exist |
| `GET /api/restaurants/:id/summary` | Visit count and spend totals for a restaurant | `200` + summary object | `404` if the restaurant doesn't exist |
| `GET /api/recommendations?budget=` | Suggests the highest-rated visited restaurant within budget | `200` + result object | `400` if `budget` is missing or not a positive number |

**`POST /api/restaurants/:id/visits`**

```jsonc
// request
{ "date": "2026-01-15", "amountSpent": 35.50, "notes": "Great burger" }

// 201 response
{ "id": 6, "restaurantId": 1, "date": "2026-01-15", "amountSpent": 35.5, "notes": "Great burger", "createdAt": "2026-01-15T00:00:00.000Z" }
```

**`GET /api/restaurants/:id/summary`**

```jsonc
// 200 response
{ "visitCount": 2, "totalSpent": 57.5, "averageSpent": 28.75, "lastVisitedAt": "2026-02-01" }
```

**`GET /api/recommendations?budget=40`**

```jsonc
// 200 response, a match
{ "restaurant": { "id": 1, "name": "The Rusty Spoon", "cuisine": "American", "address": "12 Main St", "rating": 4.5, "createdAt": "2026-01-01T00:00:00.000Z" }, "estimatedCost": 28.75, "reason": "Highest-rated liked restaurant within budget" }

// 200 response, no match
{ "restaurant": null, "estimatedCost": null, "reason": "No liked restaurant fits within a $5 budget" }
```

## Schema changes

Added `client/db/migrations/002_add_restaurant_uniqueness.sql`, a unique index on `restaurants (LOWER(name), LOWER(address))` so two restaurants can't share the same name and address. No new tables. `visits` already existed in `001_create_tables.sql` and was previously unused by any route.

## How I verified this

**Part A** - the contract table in CHALLENGE.md, every row including the error cases:

```bash
curl -i http://localhost:3000/api/restaurants          # 200 + array
curl -i http://localhost:3000/api/restaurants/99999    # 404
curl -i http://localhost:3000/api/restaurants/abc      # 404
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Out Of Range","rating":6}'              # 400
```

**Part B** - the equivalent cases for what I built:

```bash
# Duplicate prevention
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"The Rusty Spoon","cuisine":"American","address":"12 Main St","rating":4.5}'  # 201 the first time, 409 the second

# Visits
curl -i -X POST http://localhost:3000/api/restaurants/1/visits \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-01-15","amountSpent":35.50,"notes":"Great burger"}'                     # 201
curl -i http://localhost:3000/api/restaurants/1/visits                                       # 200 + array
curl -i -X POST http://localhost:3000/api/restaurants/99999/visits \
  -H 'Content-Type: application/json' -d '{"date":"2026-01-15"}'                            # 404
curl -i -X POST http://localhost:3000/api/restaurants/1/visits \
  -H 'Content-Type: application/json' -d '{"amountSpent":10}'                               # 400, missing date
curl -i -X DELETE http://localhost:3000/api/visits/1                                         # 204, then 404 on a second call

# Summary
curl -i http://localhost:3000/api/restaurants/1/summary                                      # 200
curl -i http://localhost:3000/api/restaurants/99999/summary                                  # 404

# Recommendations
curl -i "http://localhost:3000/api/recommendations?budget=100"                               # 200, a match
curl -i "http://localhost:3000/api/recommendations?budget=1"                                 # 200, restaurant: null
curl -i http://localhost:3000/api/recommendations                                            # 400, missing budget
curl -i "http://localhost:3000/api/recommendations?budget=abc"                               # 400, invalid budget
```

Also clicked through the UI: added a restaurant from the home page, opened its detail page, logged and deleted a visit and watched the summary update, and used the "Where should I eat?" page with a few different budgets.

## Known issues / what I'd do next

The recommendation's cost estimate only looks at visits with a recorded `amountSpent`. A restaurant that's liked but has only visits with no recorded spend won't be recommendable, since there's nothing to compare against the budget. There's no automated test suite, everything above was checked by hand with curl and the browser. Given more time, I'd also add a way to edit a restaurant or a visit instead of only creating and deleting them.
