export interface ProductsInterface {
	products?: ProductInterface[] | null;
	total: number;
	skip: number;
	limit: number;
}
export interface ProductInterface {
	id: number;
	title: string;
	description?: string;
	category?: string;
	price?: number;
	discountPercentage?: number;
	rating?: number;
	stock?: number;
	tags?: string[] | null;
	brand?: string | null;
	sku?: string;
	weight?: number;
	dimensions?: DimensionsInterface;
	warrantyInformation?: string;
	shippingInformation?: string;
	availabilityStatus?: string;
	reviews?: ReviewInterface[] | null;
	returnPolicy?: string;
	minimumOrderQuantity?: number;
	meta?: MetaInterface;
	images?: string[] | null;
	thumbnail?: string;
}
export interface DimensionsInterface {
	width: number;
	height: number;
	depth: number;
}
export interface ReviewInterface {
	rating: number;
	comment: string;
	date: string;
	reviewerName: string;
	reviewerEmail: string;
}
export interface MetaInterface {
	createdAt: string;
	updatedAt: string;
	barcode: string;
	qrCode: string;
}
