import apiClient from "../api/client";

export async function getTodayAttendance() {
  const response = await apiClient.get("/attendance/me/today");
  return response.data?.data ?? response.data;
}

export async function clockIn() {
  const response = await apiClient.post("/attendance/clock-in");
  return response.data?.data ?? response.data;
}

export async function clockOut() {
  const response = await apiClient.patch("/attendance/clock-out");
  return response.data?.data ?? response.data;
}

export async function getMyAttendanceHistory(params = {}) {
  const response = await apiClient.get("/attendance/me", { params });
  const payload = response.data?.data ?? response.data;

  if (Array.isArray(payload)) return payload;

  return (
    payload?.records ??
    payload?.attendance ??
    payload?.history ??
    payload?.items ??
    []
  );
}