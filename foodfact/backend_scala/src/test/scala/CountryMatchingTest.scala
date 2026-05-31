package app

class CountryMatchingTest extends munit.FunSuite {

  test("countryMatches France variants") {
    assert(CountryUtils.countryMatches("en:france, en:european-union", "France"))
    assert(CountryUtils.countryMatches("fr, belgique", "france"))
  }

  test("countryMatches Tunisia") {
    assert(CountryUtils.countryMatches("en:tunisia, en:africa", "Tunisie"))
    assert(CountryUtils.countryMatches("tn", "tunisia"))
  }

  test("countryMatches United States") {
    assert(CountryUtils.countryMatches("en:united-states", "États-Unis"))
    assert(CountryUtils.countryMatches("us, en:united-states", "united-states"))
  }

  test("countryMatches rejects empty countries") {
    assert(!CountryUtils.countryMatches("", "France"))
    assert(!CountryUtils.countryMatches("   ", "France"))
  }

  test("countryMatches United Kingdom") {
    assert(CountryUtils.countryMatches("en:united-kingdom", "Royaume-Uni"))
  }
}

class ProductFiltersTest extends munit.FunSuite {

  private def product(
      code: String,
      grade: Option[String] = None,
      nova: Option[Int] = None
  ): Product =
    Product(
      code = code,
      product_name = Some(s"Product $code"),
      brands = None,
      categories = None,
      quantity = None,
      nutriscore_grade = grade,
      ecoscore_grade = None,
      nova_group = nova,
      ingredients_text = None,
      allergens = None,
      additives_tags = None,
      labels = None,
      countries = None,
      image_url = None,
      image_small_url = None,
      image_front_url = None,
      nutriments = None
    )

  test("nutriscoreRank orders A before E") {
    assert(ProductFilters.nutriscoreRank(Some("a")) < ProductFilters.nutriscoreRank(Some("e")))
    assert(ProductFilters.nutriscoreRank(None) == 99)
  }

  test("filter by nutriscore") {
    val products = List(
      product("1", grade = Some("a")),
      product("2", grade = Some("e")),
      product("3", grade = Some("c"))
    )
    val filtered = ProductFilters.applyFilters(
      products,
      FilterParams(nutriscores = Set("a", "c"))
    )
    assertEquals(filtered.map(_.code), List("1", "3"))
  }

  test("filter by nova group") {
    val products = List(
      product("1", nova = Some(1)),
      product("2", nova = Some(4)),
      product("3", nova = Some(2))
    )
    val filtered = ProductFilters.applyFilters(
      products,
      FilterParams(novaGroups = Set(1, 2))
    )
    assertEquals(filtered.map(_.code), List("1", "3"))
  }

  test("sort by nutriscore ascending") {
    val products = List(
      product("1", grade = Some("d")),
      product("2", grade = Some("a")),
      product("3", grade = Some("c"))
    )
    val sorted = ProductFilters.sortProducts(products, Some("nutriscore"), Some("asc"))
    assertEquals(sorted.map(_.code), List("2", "3", "1"))
  }
}
