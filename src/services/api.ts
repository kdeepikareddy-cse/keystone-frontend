const API_BASE_URL = 'https://keystone-backend-vldl.onrender.com/api'

function getAuthHeaders() {
  const token = localStorage.getItem('token')

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getWorkOrders() {
  const response = await fetch(`${API_BASE_URL}/work-orders`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch work orders: ${response.status}`)
  }

  return response.json()
}

export async function getTechnicians() {
  const response = await fetch(`${API_BASE_URL}/technicians`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch technicians: ${response.status}`)
  }

  return response.json()
}

export async function createWorkOrder(workOrder: {
  title: string
  description: string
  priority: string
  status: string
  location: string
}) {
  const response = await fetch(`${API_BASE_URL}/work-orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(workOrder),
  })

  if (!response.ok) {
    throw new Error(`Failed to create work order: ${response.status}`)
  }

  return response.json()
}

export async function createTechnician(technician: {
  name: string
  skill: string
  status: string
  phone: string
}) {
  const response = await fetch(`${API_BASE_URL}/technicians`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(technician),
  })

  if (!response.ok) {
    throw new Error(`Failed to create technician: ${response.status}`)
  }

  return response.json()
}

export async function updateWorkOrderStatus(
  id: number,
  status: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/work-orders/${id}/status`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to update work order: ${response.status}`)
  }

  return response.json()
}

export async function assignTechnician(
  workOrderId: number,
  technicianId: number,
) {
  const response = await fetch(
    `${API_BASE_URL}/work-orders/${workOrderId}/assign/${technicianId}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to assign technician: ${response.status}`)
  }

  return response.json()
}

export async function updateTechnicianStatus(
  id: number,
  status: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/technicians/${id}/status?status=${encodeURIComponent(status)}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
    },
  )

  if (!response.ok) {
    throw new Error(
      `Failed to update technician status: ${response.status}`,
    )
  }

  return response.json()
}

export async function updateWorkOrder(
  id: number,
  workOrder: {
    title: string
    description: string
    priority: string
    status: string
    location: string
  },
) {
  const response = await fetch(
    `${API_BASE_URL}/work-orders/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(workOrder),
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to update work order: ${response.status}`)
  }

  return response.json()
}

export async function deleteWorkOrder(id: number) {
  const response = await fetch(
    `${API_BASE_URL}/work-orders/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to delete work order: ${response.status}`)
  }

  return response.text()
}

export async function deleteTechnician(id: number) {
  const response = await fetch(
    `${API_BASE_URL}/technicians/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to delete technician: ${response.status}`)
  }

  return response.text()
}