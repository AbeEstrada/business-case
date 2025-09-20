import ProductsList from "@/components/ProductsList";
import { ProductsProvider } from "@/context/Products";
import SearchInput from "@/components/SearchInput";
import { CategorySelect } from "@/components/CategoriesSelect";

export default function Home() {
	return (
		<ProductsProvider>
			<main className="max-w-5xl mx-auto">
				<header className="flex items-center gap-4 m-4">
					<SearchInput />
					<CategorySelect />
				</header>
				<ProductsList />
			</main>
		</ProductsProvider>
	);
}
