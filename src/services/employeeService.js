import apiClient from "../api/client";

export async function getDepartments() {
  const response = await apiClient.get("/departments");
  const payload = response.data?.data ?? response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.departments ?? payload?.items ?? [];
}

export async function createDepartment(departmentPayload) {
  const response = await apiClient.post("/departments", departmentPayload);
  const payload = response.data?.data ?? response.data;
  return payload?.department ?? payload;
}

export async function getEmployees(params = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

  const response = await apiClient.get("/employees", { params: cleanParams });
  return response.data?.data ?? response.data;
}

export async function getEmployeeById(employeeId) {
  const response = await apiClient.get(`/employees/${employeeId}`);
  const payload = response.data?.data ?? response.data;
  return payload?.employee ?? payload;
}

export async function createEmployee(employeePayload) {
  const response = await apiClient.post("/employees", employeePayload);
  return response.data?.data ?? response.data;
}