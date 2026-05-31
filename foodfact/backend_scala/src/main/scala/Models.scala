package app

import io.circe._
import io.circe.generic.semiauto._

case class Nutriments(
  energy: Option[Double],
  sugars: Option[Double],
  salt: Option[Double],
  fat: Option[Double],
  proteins: Option[Double],
  fiber: Option[Double]
)

object Nutriments {
  given Decoder[Nutriments] = new Decoder[Nutriments] {
    def apply(c: HCursor): Decoder.Result[Nutriments] =
      for {
        energy   <- c.downField("energy-kcal_100g").as[Option[Double]]
        sugars   <- c.downField("sugars_100g").as[Option[Double]]
        salt     <- c.downField("salt_100g").as[Option[Double]]
        fat      <- c.downField("fat_100g").as[Option[Double]]
        proteins <- c.downField("proteins_100g").as[Option[Double]]
        fiber    <- c.downField("fiber_100g").as[Option[Double]]
      } yield Nutriments(energy, sugars, salt, fat, proteins, fiber)
  }
  given Encoder[Nutriments] = deriveEncoder
}

case class Product(
  code: String,
  product_name: Option[String],
  brands: Option[String],
  categories: Option[String],
  quantity: Option[String],
  nutriscore_grade: Option[String],
  ecoscore_grade: Option[String],
  nova_group: Option[Int],
  ingredients_text: Option[String],
  allergens: Option[String],
  additives_tags: Option[List[String]],
  labels: Option[String],
  countries: Option[String],
  image_url: Option[String],
  image_small_url: Option[String],
  image_front_url: Option[String],
  nutriments: Option[Nutriments]
)

object Product {
  given Decoder[Product] = deriveDecoder
  given Encoder[Product] = deriveEncoder
}

case class ProductResponse(
  code: String,
  product: Option[Product]
)

object ProductResponse {
  given Decoder[ProductResponse] = deriveDecoder
  given Encoder[ProductResponse] = deriveEncoder
}

/** Raw response from OpenFoodFacts search API */
case class OffSearchResponse(
  count: Int,
  products: List[Product]
)

object OffSearchResponse {
  given Decoder[OffSearchResponse] = new Decoder[OffSearchResponse] {
    def apply(c: HCursor): Decoder.Result[OffSearchResponse] =
      for {
        products <- c.downField("products").as[List[Product]]
        count    <- c.downField("count").as[Option[Int]]
      } yield OffSearchResponse(count.getOrElse(products.length), products)
  }
  given Encoder[OffSearchResponse] = deriveEncoder
}

/** API response returned to the frontend */
case class ApiSearchResponse(
  count: Int,
  totalFromOff: Int,
  page: Int,
  pageSize: Int,
  products: List[Product]
)

object ApiSearchResponse {
  given Encoder[ApiSearchResponse] = deriveEncoder
}
