export function getApiErrorMessage(
  err,
  fallback = "Something went wrong. Please try again.",
) {
  const apiError = err?.response?.data?.error;
  const details = apiError?.details;

  if (Array.isArray(details) && details.length > 0) {
    const firstDetail = details[0];
    const field = Array.isArray(firstDetail?.path)
      ? firstDetail.path.join(".")
      : "";

    if (field && firstDetail?.message) {
      return `${field}: ${firstDetail.message}`;
    }
    if (firstDetail?.message) {
      return firstDetail.message;
    }
  }

  return apiError?.message || err?.response?.data?.message || fallback;
}