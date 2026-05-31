package app

sealed trait ApiError extends Exception {
  def message: String
  override def getMessage: String = message
}

final case class OffTimeoutException(message: String) extends ApiError
final case class OffUpstreamException(message: String) extends ApiError
final case class BadRequestException(message: String) extends ApiError
