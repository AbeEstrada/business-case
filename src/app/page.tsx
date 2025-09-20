import { Suspense } from "react";
import ProductsList from "@/components/ProductsList";
import { ProductsProvider } from "@/context/Products";
import SearchInput from "@/components/SearchInput";
import { CategorySelect } from "@/components/CategoriesSelect";
import { SortSelect } from "@/components/SortSelect";
import { OrderSelect } from "@/components/OrderSelect";

export default function Home() {
	return (
		<Suspense>
			<ProductsProvider>
				<main className="max-w-5xl mx-auto">
					<header className="flex flex-col md:flex-row items-center gap-4 m-4">
						<SearchInput />
						<div className="flex flex-col gap-4 min-[480px]:flex-row">
							<CategorySelect />
							<SortSelect />
							<OrderSelect />
						</div>
					</header>
					<ProductsList />
				</main>
			</ProductsProvider>
		</Suspense>
	);
}
