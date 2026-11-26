import apiClient from "../api/client";

// Creates a new asset. It will also support optional image and PDF uploads through multipart/form-data. The field names match the backend Asset API contract.

export async function createAsset(assetPayload) {
  const formData = new FormData();

  // Required fields
  formData.append("assetId", assetPayload.assetId);
  formData.append("name", assetPayload.name);
  formData.append("type", assetPayload.type);
  formData.append("condition", assetPayload.condition);

  // Optional text fields
  if (assetPayload.serialNumber?.trim()) {
    formData.append("serialNumber", assetPayload.serialNumber.trim());
  }

  if (assetPayload.description?.trim()) {
    formData.append("description", assetPayload.description.trim());
  }

  // Optional file uploads
  if (assetPayload.image) {
    formData.append("image", assetPayload.image);
  }

  if (assetPayload.file) {
    formData.append("file", assetPayload.file);
  }

  const response = await apiClient.post("/assets", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data ?? response.data;
}

export async function getAssets(params = {}) {
  const response = await apiClient.get("/assets", { params });
  const payload = response.data?.data ?? response.data;

  if (Array.isArray(payload)) return payload;

  return payload?.assets ?? payload?.items ?? payload?.records ?? [];
}

export async function assignAsset(assetId, employeeId) {
  const response = await apiClient.post(`/assets/${assetId}/assign`, {
    employeeId,
  });

  return response.data?.data ?? response.data;
}