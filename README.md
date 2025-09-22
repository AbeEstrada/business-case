# Business Case

This is the architecture of a web application for displaying products, focusing on its frontend and backend components. The system is designed to be efficient by leveraging client side URL parameters for state management and an in-memory cache on the backend to reduce API calls.

```
User 
  ↓ (interaction)
Frontend → URL Params → Hooks
  ↓ (API calls)
Backend → Cache → External API
  ↓ (response)
Frontend → Components → User
```

---

## Frontend

The frontend is built with a clear separation of concerns, using custom hooks to handle data fetching and components to render the user interface. It manages application state directly through URL query parameters.

### Context

The `ProductsProvider` component is the central point for managing product related state. It reads query parameters like `q`, `category`, `sort`, `order`, and `page` from the URL, then passes these parameters to the `useProducts` hook to initiate data retrieval.

### Hooks

- `useProducts`: Fetches product lists. It first checks the in-memory cache using a key derived from the query parameters (`{q, category, page, sort, order, limit}`). If the data is not cached, it makes an API call to retrieve the products.
- `useCategories`: Fetches the list of product categories, either from a local cache or by making an API call.
- `useDebouncedSearch`: Delays the execution of a search function until a user has stopped typing. This is a performance optimization that prevents excessive server requests while a user is still entering their search query.

### Components

These components are responsible for rendering the UI and interacting with the hooks to display data.

- `ProductsList`: Renders a grid of products. It has three states: a loading state with a skeleton UI, a state for displaying the product grid, and a "no products found" state.
- `ProductCard`: Displays the details of a single product. It's primarily used within the `ProductsList` component.
- `SearchInput`: An input field that uses the `useDebouncedSearch` hook. Once the debounced value is finalized, it updates the `q` query parameter in the URL to trigger a product search.
- `CategorySelect`: Renders a dropdown list of categories, which updates the `category` URL parameter when a selection is made.
- `SortSelect`: A dropdown with predefined options that updates the `sort` URL parameter.
- `OrderSelect`: A toggle for `asc` (ascending) or `desc` (descending) order, which updates the `order` URL parameter.
- `Pagination`: Displays page numbers and navigation links. Clicking a link updates the `page` URL parameter.
- `ProductClient`: A specialized component for displaying detailed information on an individual product page.
- `BarChart`: A custom component for rendering a basic SVG bar chart. It is not currently highly customizable and is intended for limited use cases.

---

## Backend

The backend is built around a caching strategy to optimize data retrieval from an external API (DummyJSON).

### Cache Library

The `lib/cache` library is a core part of the backend. It implements an in-memory cache to store API responses, which can be extended to use a more persistent solution like Redis in the future.

- **`CACHE_DURATION`**: Data is cached for 5 minutes to ensure freshness.
- **`getProducts`**: Retrieves products from the cache or the external API.
- **`getCategories`**: Retrieves categories from the cache or the external API.
- **`getProductById`**: Retrieves a single product by ID from the cache or the external API.

### API Endpoints

The backend provides a set of API endpoints that serve the frontend's data needs, all of which use the caching library.

- `/api/categories`: Returns the list of all product categories.
- `/api/products`: Returns a paginated list of products, accepting `limit` and `page` parameters.
- `/api/products/search`: Handles complex search queries. It accepts parameters like `q`, `category`, `page`, `sort`, `order`, and `limit` to filter and sort the product list.
- `/api/product/[id]`: Returns the details for a single product based on its `id`.

### Pages

The application has two main pages, with some server side rendering for better SEO.

- `/`: The home page, which displays the main product grid. It includes the `SearchInput`, `CategorySelect`, `SortSelect`, and `OrderSelect` components. Each product on this page is rendered using the `ProductCard` component.
- `/product/[id]`: The individual product page. This page is generated on the server to include product specific metadata for SEO purposes. The detailed product information is rendered using the `ProductClient` component.
