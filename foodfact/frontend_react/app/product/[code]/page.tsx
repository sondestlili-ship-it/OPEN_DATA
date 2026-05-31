import ProductClient from "./ProductClient";

export default async function ProductPage({ params }: any) {
  const { code } = await params;   // ← obligatoire maintenant !

  return <ProductClient code={code} />;
}
