package app

object CountryUtils {

  val countryVariants: Map[String, Set[String]] = Map(
    "france"       -> Set("france", "fr", "en:france", "fr:france", "en:fr", "fr:fr"),
    "belgique"     -> Set("belgique", "belgium", "be", "en:belgium", "fr:belgique", "en:be", "fr:be"),
    "belgium"      -> Set("belgique", "belgium", "be", "en:belgium", "fr:belgique", "en:be", "fr:be"),
    "suisse"       -> Set("suisse", "switzerland", "ch", "en:switzerland", "fr:suisse", "en:ch", "fr:ch"),
    "switzerland"  -> Set("suisse", "switzerland", "ch", "en:switzerland", "fr:suisse", "en:ch", "fr:ch"),
    "canada"       -> Set("canada", "ca", "en:canada", "fr:canada", "en:ca", "fr:ca"),
    "espagne"      -> Set("espagne", "spain", "es", "en:spain", "fr:espagne", "en:es", "fr:es"),
    "spain"        -> Set("espagne", "spain", "es", "en:spain", "fr:espagne", "en:es", "fr:es"),
    "italie"       -> Set("italie", "italy", "it", "en:italy", "fr:italie", "en:it", "fr:it"),
    "italy"        -> Set("italie", "italy", "it", "en:italy", "fr:italie", "en:it", "fr:it"),
    "allemagne"    -> Set("allemagne", "germany", "de", "en:germany", "fr:allemagne", "en:de", "fr:de"),
    "germany"      -> Set("allemagne", "germany", "de", "en:germany", "fr:allemagne", "en:de", "fr:de"),
    "maroc"        -> Set("maroc", "morocco", "ma", "en:morocco", "fr:maroc", "en:ma", "fr:ma"),
    "morocco"      -> Set("maroc", "morocco", "ma", "en:morocco", "fr:maroc", "en:ma", "fr:ma"),
    "tunisie"      -> Set("tunisie", "tunisia", "tn", "en:tunisia", "fr:tunisie", "en:tn", "fr:tn"),
    "tunisia"      -> Set("tunisie", "tunisia", "tn", "en:tunisia", "fr:tunisie", "en:tn", "fr:tn"),
    "algerie"      -> Set("algerie", "algeria", "dz", "en:algeria", "fr:algerie", "en:dz", "fr:dz"),
    "algérie"      -> Set("algerie", "algeria", "dz", "en:algeria", "fr:algerie", "en:dz", "fr:dz"),
    "algeria"      -> Set("algerie", "algeria", "dz", "en:algeria", "fr:algerie", "en:dz", "fr:dz"),
    "etats-unis"   -> Set("etats-unis", "united-states", "united states", "usa", "us", "en:united-states", "en:us", "fr:etats-unis"),
    "états-unis"   -> Set("etats-unis", "united-states", "united states", "usa", "us", "en:united-states", "en:us", "fr:etats-unis"),
    "united-states"-> Set("etats-unis", "united-states", "united states", "usa", "us", "en:united-states", "en:us", "fr:etats-unis"),
    "royaume-uni"  -> Set("royaume-uni", "united-kingdom", "united kingdom", "uk", "gb", "en:united-kingdom", "en:gb", "fr:royaume-uni"),
    "united-kingdom" -> Set("royaume-uni", "united-kingdom", "united kingdom", "uk", "gb", "en:united-kingdom", "en:gb", "fr:royaume-uni")
  )

  def normalizeCountry(country: String): Set[String] = {
    val lower = country.toLowerCase.trim
    countryVariants.getOrElse(lower, Set(lower, s"en:$lower", s"fr:$lower"))
  }

  def countryMatches(countriesStr: String, searchCountry: String): Boolean = {
    if countriesStr.trim.isEmpty then return false

    val searchVariants = normalizeCountry(searchCountry)
    val countryParts =
      countriesStr.toLowerCase
        .split(Array(',', ';', '|', '\n', ' '))
        .map(_.trim.replaceAll("^(en|fr):", ""))
        .filter(_.nonEmpty)

    countryParts.exists(part =>
      searchVariants.exists(variant =>
        part == variant.replaceAll("^(en|fr):", "")
      )
    )
  }
}
