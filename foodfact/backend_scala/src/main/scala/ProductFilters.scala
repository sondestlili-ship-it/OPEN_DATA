package app

case class FilterParams(
  country: Option[String] = None,
  brand: Option[String] = None,
  minEnergy: Option[Double] = None,
  maxEnergy: Option[Double] = None,
  minSugar: Option[Double] = None,
  maxSugar: Option[Double] = None,
  minFat: Option[Double] = None,
  maxFat: Option[Double] = None,
  nutriscores: Set[String] = Set.empty,
  novaGroups: Set[Int] = Set.empty,
  sortBy: Option[String] = None,
  order: Option[String] = None
)

object ProductFilters {

  def nutriscoreRank(grade: Option[String]): Int =
    grade.map(_.toLowerCase.trim) match
      case Some("a") => 1
      case Some("b") => 2
      case Some("c") => 3
      case Some("d") => 4
      case Some("e") => 5
      case _         => 99

  def parseCsvSet(value: Option[String]): Set[String] =
    value
      .map(_.split(",").map(_.trim.toLowerCase).filter(_.nonEmpty).toSet)
      .getOrElse(Set.empty)

  def parseNovaSet(value: Option[String]): Set[Int] =
    value
      .map(_.split(",").flatMap(_.trim.toIntOption).toSet)
      .getOrElse(Set.empty)

  def applyFilters(products: List[Product], params: FilterParams): List[Product] =
    products
      .filter(p => params.country.forall(c => p.countries.exists(cs => CountryUtils.countryMatches(cs, c))))
      .filter(p => params.brand.forall(b => p.brands.exists(_.toLowerCase.contains(b.toLowerCase))))
      .filter(p => params.minEnergy.forall(min => p.nutriments.flatMap(_.energy).exists(_ >= min)))
      .filter(p => params.maxEnergy.forall(max => p.nutriments.flatMap(_.energy).exists(_ <= max)))
      .filter(p => params.minSugar.forall(min => p.nutriments.flatMap(_.sugars).exists(_ >= min)))
      .filter(p => params.maxSugar.forall(max => p.nutriments.flatMap(_.sugars).exists(_ <= max)))
      .filter(p => params.minFat.forall(min => p.nutriments.flatMap(_.fat).exists(_ >= min)))
      .filter(p => params.maxFat.forall(max => p.nutriments.flatMap(_.fat).exists(_ <= max)))
      .filter(p =>
        params.nutriscores.isEmpty ||
          p.nutriscore_grade.exists(g => params.nutriscores.contains(g.toLowerCase.trim))
      )
      .filter(p =>
        params.novaGroups.isEmpty ||
          p.nova_group.exists(n => params.novaGroups.contains(n))
      )

  def sortProducts(products: List[Product], sortBy: Option[String], order: Option[String]): List[Product] =
    (sortBy, order) match
      case (Some("energy"), Some("desc")) => products.sortBy(_.nutriments.flatMap(_.energy)).reverse
      case (Some("energy"), _)            => products.sortBy(_.nutriments.flatMap(_.energy))
      case (Some("sugars"), Some("desc")) => products.sortBy(_.nutriments.flatMap(_.sugars)).reverse
      case (Some("sugars"), _)            => products.sortBy(_.nutriments.flatMap(_.sugars))
      case (Some("fat"), Some("desc"))    => products.sortBy(_.nutriments.flatMap(_.fat)).reverse
      case (Some("fat"), _)               => products.sortBy(_.nutriments.flatMap(_.fat))
      case (Some("nutriscore"), Some("desc")) =>
        products.sortBy(p => nutriscoreRank(p.nutriscore_grade)).reverse
      case (Some("nutriscore"), _) =>
        products.sortBy(p => nutriscoreRank(p.nutriscore_grade))
      case _ => products

  def hasActiveFilters(params: FilterParams): Boolean =
    params.country.isDefined ||
      params.brand.isDefined ||
      params.minEnergy.isDefined ||
      params.maxEnergy.isDefined ||
      params.minSugar.isDefined ||
      params.maxSugar.isDefined ||
      params.minFat.isDefined ||
      params.maxFat.isDefined ||
      params.nutriscores.nonEmpty ||
      params.novaGroups.nonEmpty
}
