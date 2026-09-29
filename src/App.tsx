 import { useEffect, useState, type FormEvent } from 'react'
import Login from './Login'
import Reports from './Reports'
import './App.css'

import {
  getTechnicians,
  getWorkOrders,
  createWorkOrder,
  createTechnician,
  updateWorkOrderStatus,
  assignTechnician,
  updateTechnicianStatus,
  deleteWorkOrder,
  deleteTechnician,
  updateWorkOrder,
} from './services/api'

type Technician = {
  id: number
  name: string
  skill: string
  status: string
  phone: string
}

type WorkOrder = {
  id: number
  title: string
  description: string
  priority: string
  status: string
  location: string
  createdAt: string
  technician?: Technician
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('token'),
  )

  const [showReports, setShowReports] = useState(false)

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false)
  const [showTechnicianForm, setShowTechnicianForm] = useState(false)

  // Work Order form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [location, setLocation] = useState('')
  const [creatingWorkOrder, setCreatingWorkOrder] = useState(false)
  const [editingWorkOrder, setEditingWorkOrder] =
  useState<WorkOrder | null>(null)

  // Technician form
  const [technicianName, setTechnicianName] = useState('')
  const [technicianSkill, setTechnicianSkill] = useState('')
  const [technicianPhone, setTechnicianPhone] = useState('')
  const [technicianStatus, setTechnicianStatus] = useState('AVAILABLE')
  const [creatingTechnician, setCreatingTechnician] = useState(false)

  const userRole = localStorage.getItem('role') || 'CUSTOMER'

  function handleLogin() {
    setIsLoggedIn(true)
    setLoading(true)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('role')

    setIsLoggedIn(false)
    setShowReports(false)
    setWorkOrders([])
    setTechnicians([])
  }

  async function loadDashboard() {
    try {
      setError('')

      const role = localStorage.getItem('role') || 'CUSTOMER'

      // TECHNICIAN
      if (role === 'TECHNICIAN') {
        const email = localStorage.getItem('email')

        const [orders, techs] = await Promise.all([
          getWorkOrders(),
          getTechnicians(),
        ])

     const username = email?.split('@')[0]?.toLowerCase()

const technician = techs.find(
  (tech: Technician) => {
    const techName = tech.name?.toLowerCase().trim()
    const firstName = techName?.split(' ')[0]

    return (
      techName === username ||
      techName?.replace(/\s+/g, '') === username ||
      firstName === username
    )
  },
)

        if (technician) {
          const technicianOrders = orders.filter(
            (order: WorkOrder) =>
              order.technician?.id === technician.id,
          )

          setWorkOrders(technicianOrders)
          setTechnicians([technician])
        } else {
          setWorkOrders([])
          setTechnicians([])
        }

        return
      }

      // CUSTOMER
      if (role === 'CUSTOMER') {
        const orders = await getWorkOrders()

        setWorkOrders(orders)
        setTechnicians([])

        return
      }

      // ADMIN / DISPATCHER
      const [orders, techs] = await Promise.all([
        getWorkOrders(),
        getTechnicians(),
      ])

      setWorkOrders(orders)
      setTechnicians(techs)
    } catch (err) {
      console.error('Dashboard loading error:', err)
      setError(
        'Unable to connect to the Keystone backend.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboard()
    } else {
      setLoading(false)
    }
  }, [isLoggedIn])

  async function handleStatusChange(
    id: number,
    status: string,
  ) {
    try {
      await updateWorkOrderStatus(id, status)
      await loadDashboard()
    } catch (err) {
      console.error(err)
      alert('Failed to update work order status.')
    }
  }


  async function handleTechnicianStatusChange(
    id: number,
    status: string,
  ) {
    try {
      await updateTechnicianStatus(id, status)
      await loadDashboard()
    } catch (err) {
      console.error(err)
      alert('Failed to update technician status.')
    }
  }
  async function handleDeleteTechnician(id: number) {
  try {
    await deleteTechnician(id)
    await loadDashboard()
  } catch (err) {
    console.error(err)
    alert('Failed to delete technician.')
  }
}
async function handleEditWorkOrder(
  id: number,
  workOrder: {
    title: string
    description: string
    priority: string
    status: string
    location: string
  },
) {
  try {
    await updateWorkOrder(id, workOrder)

    setEditingWorkOrder(null)
    setShowWorkOrderForm(false)

    await loadDashboard()
  } catch (err) {
    console.error(err)
    alert('Failed to update work order.')
  }
}

  async function handleAssignTechnician(
    workOrderId: number,
    technicianId: number,
  ) {
    try {
      await assignTechnician(
        workOrderId,
        technicianId,
      )

      await loadDashboard()
    } catch (err) {
      console.error(err)
      alert('Failed to assign technician.')
    }
  }
  async function handleDeleteWorkOrder(id: number) {
  try {
    const confirmed = window.confirm(
      'Are you sure you want to delete this work order?',
    )

    if (!confirmed) {
      return
    }

    await deleteWorkOrder(id)
    await loadDashboard()
  } catch (err) {
    console.error(err)
    alert('Failed to delete work order.')
  }
}

  async function handleCreateWorkOrder(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim()
    ) {
      alert('Please fill in all fields.')
      return
    }

    try {
      setCreatingWorkOrder(true)

      await createWorkOrder({
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'NEW',
        location: location.trim(),
      })

      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setLocation('')
      setShowWorkOrderForm(false)

      await loadDashboard()
    } catch (err) {
      console.error(err)
      alert('Failed to create work order.')
    } finally {
      setCreatingWorkOrder(false)
    }
  }

  async function handleCreateTechnician(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !technicianName.trim() ||
      !technicianSkill.trim() ||
      !technicianPhone.trim()
    ) {
      alert('Please fill in all fields.')
      return
    }

    try {
      setCreatingTechnician(true)

      await createTechnician({
        name: technicianName.trim(),
        skill: technicianSkill.trim(),
        phone: technicianPhone.trim(),
        status: technicianStatus,
      })

      setTechnicianName('')
      setTechnicianSkill('')
      setTechnicianPhone('')
      setTechnicianStatus('AVAILABLE')
      setShowTechnicianForm(false)

      await loadDashboard()
    } catch (err) {
      console.error(err)
      alert('Failed to create technician.')
    } finally {
      setCreatingTechnician(false)
    }
  }

  const availableTechnicians = technicians.filter(
    (technician) =>
      technician.status === 'AVAILABLE',
  ).length

  const busyTechnicians = technicians.filter(
    (technician) =>
      technician.status === 'BUSY',
  ).length

  const recentWorkOrders = [...workOrders]
    .reverse()
    .slice(0, 5)

  const recentTechnicians = technicians

  // LOGIN
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  // REPORTS
  if (showReports) {
    return (
      <div>
        <button
          onClick={() => setShowReports(false)}
          style={{
            margin: '20px',
            padding: '10px 18px',
            border: 'none',
            borderRadius: '7px',
            background: '#2563eb',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ← Back to Dashboard
        </button>

        <Reports />
      </div>
    )
  }

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>KEYSTONE</h1>
          <p>Field Service Management Platform</p>
        </div>

        <div
          className="user"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span className="avatar">
            A
          </span>

          <div>
            <strong>
              {userRole === 'TECHNICIAN'
                ? 'Technician'
                : userRole === 'CUSTOMER'
                  ? 'Customer'
                  : 'Admin'}
            </strong>

            <small>
              {localStorage.getItem('email') ||
                'Administrator'}
            </small>
          </div>

          <button
            onClick={handleLogout}
            style={{
              marginLeft: '15px',
              padding: '8px 14px',
              border: 'none',
              borderRadius: '7px',
              background: '#dc2626',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <main className="dashboard">

        <section className="welcome">
          <h2>Dashboard</h2>
          <p>
            Manage your field service operations
            from one place.
          </p>
        </section>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* STATS */}
        <section className="stats">

          <div className="card">
            <span className="icon">WO</span>

            <div>
              <h3>Work Orders</h3>
              <strong>
                {workOrders.length}
              </strong>
              <p>Total work orders</p>
            </div>
          </div>

          <div className="card">
            <span className="icon">TECH</span>

            <div>
              <h3>Technicians</h3>
              <strong>
                {technicians.length}
              </strong>
              <p>Registered technicians</p>
            </div>
          </div>

          <div className="card">
            <span className="icon">OK</span>

            <div>
              <h3>Available</h3>
              <strong>
                {availableTechnicians}
              </strong>
              <p>Available technicians</p>
            </div>
          </div>

          <div className="card">
            <span className="icon">BUSY</span>

            <div>
              <h3>Busy</h3>
              <strong>
                {busyTechnicians}
              </strong>
              <p>Busy technicians</p>
            </div>
          </div>

        </section>

        {/* CREATE WORK ORDER */}
        {showWorkOrderForm && (
          <section
            className="panel"
            style={{ marginTop: '25px' }}
          >
            <div className="panel-header">

              <div>
                <h2>{editingWorkOrder ? 'Edit Work Order' : 'Create Work Order'}</h2>
                <p>
                  Enter the service request details
                </p>
              </div>

              <button
                onClick={() =>
                  setShowWorkOrderForm(false)
                }
              >
                Cancel
              </button>

            </div>

            <form
              onSubmit={(event) => {
  event.preventDefault()

  if (editingWorkOrder) {
    handleEditWorkOrder(editingWorkOrder.id, {
      title,
      description,
      priority,
      status: editingWorkOrder.status,
      location,
    })
  } else {
    handleCreateWorkOrder(event)
  }
}}
            >

              <div style={{ marginTop: '20px' }}>
                <label>Title</label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Example: AC Repair"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <label>Description</label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Describe the service required"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <label>Priority</label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value,
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                  }}
                >
                  <option value="LOW">
                    LOW
                  </option>

                  <option value="MEDIUM">
                    MEDIUM
                  </option>

                  <option value="HIGH">
                    HIGH
                  </option>
                </select>
              </div>

              <div style={{ marginTop: '15px' }}>
                <label>Location</label>

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Building A"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={creatingWorkOrder}
                style={{
                  marginTop: '20px',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '7px',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
              {creatingWorkOrder
  ? (editingWorkOrder ? 'Updating...' : 'Creating...')
  : (editingWorkOrder ? 'Update Work Order' : 'Create Work Order')}
              </button>

            </form>
          </section>
        )}

        {/* CREATE TECHNICIAN */}
        {showTechnicianForm && (
          <section
            className="panel"
            style={{ marginTop: '25px' }}
          >

            <div className="panel-header">

              <div>
                <h2>Add Technician</h2>
                <p>
                  Enter technician details
                </p>
              </div>

              <button
                onClick={() =>
                  setShowTechnicianForm(false)
                }
              >
                Cancel
              </button>

            </div>

            <form
              onSubmit={handleCreateTechnician}
            >

              <div style={{ marginTop: '20px' }}>
                <label>Name</label>

                <input
                  type="text"
                  value={technicianName}
                  onChange={(event) =>
                    setTechnicianName(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Ravi Kumar"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <label>Skill</label>

                <input
                  type="text"
                  value={technicianSkill}
                  onChange={(event) =>
                    setTechnicianSkill(
                      event.target.value,
                    )
                  }
                  placeholder="Example: HVAC"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <label>Phone</label>

                <input
                  type="tel"
                  value={technicianPhone}
                  onChange={(event) =>
                    setTechnicianPhone(
                      event.target.value,
                    )
                  }
                  placeholder="Example: 9876543210"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <label>Status</label>

                <select
                  value={technicianStatus}
                  onChange={(event) =>
                    setTechnicianStatus(
                      event.target.value,
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '6px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                  }}
                >
                  <option value="AVAILABLE">
                    AVAILABLE
                  </option>

                  <option value="BUSY">
                    BUSY
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creatingTechnician}
                style={{
                  marginTop: '20px',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '7px',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {creatingTechnician
                  ? 'Adding...'
                  : 'Add Technician'}
              </button>

            </form>
          </section>
        )}

        {/* CONTENT */}
        {loading ? (
          <div className="loading">
            Loading dashboard...
          </div>
        ) : (
          <section className="content-grid">
        {/* DASHBOARD ANALYTICS */}
        <section
          className="content-grid"
          style={{ marginTop: '25px' }}
        >

          {/* WORK ORDER STATUS */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Work Order Status</h2>
                <p>Current service request progress</p>
              </div>
            </div>

            <div className="work-order">
              <div>
                <h3>New</h3>
                <p>Waiting for processing</p>
              </div>

              <strong>
                {
                  workOrders.filter(
                    (order) => order.status === 'NEW',
                  ).length
                }
              </strong>
            </div>

            <div className="work-order">
              <div>
                <h3>In Progress</h3>
                <p>Currently being handled</p>
              </div>

              <strong>
                {
                  workOrders.filter(
                    (order) =>
                      order.status === 'IN_PROGRESS',
                  ).length
                }
              </strong>
            </div>

            <div className="work-order">
              <div>
                <h3>Closed</h3>
                <p>Completed service requests</p>
              </div>

              <strong>
                {
                  workOrders.filter(
                    (order) => order.status === 'CLOSED',
                  ).length
                }
              </strong>
            </div>
          </div>

          {/* PRIORITY BREAKDOWN */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Priority Breakdown</h2>
                <p>Work orders by priority</p>
              </div>
            </div>

            <div className="work-order">
              <div>
                <h3>High Priority</h3>
                <p>Urgent work orders</p>
              </div>

              <strong>
                {
                  workOrders.filter(
                    (order) => order.priority === 'HIGH',
                  ).length
                }
              </strong>
            </div>

            <div className="work-order">
              <div>
                <h3>Medium Priority</h3>
                <p>Normal priority requests</p>
              </div>

              <strong>
                {
                  workOrders.filter(
                    (order) => order.priority === 'MEDIUM',
                  ).length
                }
              </strong>
            </div>

            <div className="work-order">
              <div>
                <h3>Low Priority</h3>
                <p>Lower priority requests</p>
              </div>

              <strong>
                {
                  workOrders.filter(
                    (order) => order.priority === 'LOW',
                  ).length
                }
              </strong>
            </div>
          </div>

        </section>

            {/* WORK ORDERS */}
            <div className="panel">

              <div className="panel-header">
                <div>
                  <h2>Recent Work Orders</h2>
                  <p>
                    Latest service requests
                  </p>
                </div>
              </div>

              {recentWorkOrders.length === 0 ? (
                <p className="empty">
                  No work orders found.
                </p>
              ) : (
                recentWorkOrders.map(
                  (workOrder) => (
                    <div
                      className="work-order"
                      key={workOrder.id}
                    >

                      <div>
                        <h3>
                          {workOrder.title}
                        </h3>

                        <p>
                          {workOrder.description}
                        </p>

                        <small>
                          {workOrder.location}
                        </small>

                        {/* ASSIGN TECHNICIAN */}
                        {/* ASSIGN TECHNICIAN */}
{userRole !== 'CUSTOMER' &&
  userRole !== 'TECHNICIAN' && (
    <div
      style={{
        marginTop: '14px',
        padding: '12px',
        borderRadius: '8px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          marginBottom: '6px',
        }}
      >
        Currently assigned
      </div>

      <div
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#0f172a',
          marginBottom: '10px',
        }}
      >
        {workOrder.technician
          ? workOrder.technician.name
          : 'No technician assigned'}
      </div>

      <div
        style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          marginBottom: '6px',
        }}
      >
        Change technician
      </div>

      <select
        value={workOrder.technician?.id ?? ''}
        onChange={(event) => {
          const technicianId = Number(event.target.value)

          if (technicianId) {
            handleAssignTechnician(
              workOrder.id,
              technicianId,
            )
          }
        }}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: '7px',
          border: '1px solid #cbd5e1',
          background: 'white',
          color: '#0f172a',
          fontSize: '13px',
        }}
      >
        <option value="">
          Select technician
        </option>

        {technicians
          .filter(
            (technician) =>
              technician.status === 'AVAILABLE' &&
              technician.id !== workOrder.technician?.id,
          )
          .map((technician) => (
            <option
              key={technician.id}
              value={technician.id}
            >
              {technician.name} — {technician.skill}
            </option>
          ))}
      </select>
    </div>
  )}
                      </div>
{userRole === 'ADMIN' && (
  <div>
    <button
      onClick={() => {
        setEditingWorkOrder(workOrder)
        setTitle(workOrder.title)
        setDescription(workOrder.description)
        setPriority(workOrder.priority)
        setLocation(workOrder.location)
        setShowWorkOrderForm(true)
      }}
      style={{
        marginTop: '10px',
        marginRight: '8px',
        padding: '7px 12px',
        borderRadius: '7px',
        border: 'none',
        background: '#2563eb',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      Edit
    </button>

    <button
      onClick={() =>
        handleDeleteWorkOrder(workOrder.id)
      }
      style={{
        marginTop: '10px',
        padding: '7px 12px',
        borderRadius: '7px',
        border: 'none',
        background: '#dc2626',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      Delete
    </button>
  </div>
)}
{userRole === 'TECHNICIAN' && (
  <div
    style={{
      marginTop: '12px',
      padding: '12px',
      borderRadius: '8px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
    }}
  >
    <div
      style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
        marginBottom: '8px',
      }}
    >
      Work Order Actions
    </div>

    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      {workOrder.status !== 'IN PROGRESS' &&
        workOrder.status !== 'CLOSED' && (
          <button
            onClick={() =>
              handleStatusChange(
                workOrder.id,
                'IN PROGRESS',
              )
            }
            style={{
              padding: '7px 12px',
              borderRadius: '7px',
              border: 'none',
              background: '#2563eb',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Start Work
          </button>
        )}

      {workOrder.status === 'IN PROGRESS' && (
        <button
          onClick={() =>
            handleStatusChange(
              workOrder.id,
              'CLOSED',
            )
          }
          style={{
            padding: '7px 12px',
            borderRadius: '7px',
            border: 'none',
            background: '#16a34a',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Mark Closed
        </button>
      )}

      <span
        style={{
          padding: '7px 12px',
          borderRadius: '7px',
          background: '#e2e8f0',
          color: '#334155',
          fontSize: '13px',
          fontWeight: '600',
        }}
      >
        Status: {workOrder.status}
      </span>
    </div>
  </div>
)}
                      <div className="order-info">

                        <span className="priority">
                          {workOrder.priority}
                        </span>

                        {userRole === 'ADMIN' || userRole === 'TECHNICIAN' ? (
                          <select
                            value={workOrder.status}
                            onChange={(event) =>
                              handleStatusChange(
                                workOrder.id,
                                event.target.value,
                              )
                            }
                            style={{
                              padding: '5px 10px',
                              borderRadius: '20px',
                              border: 'none',
                              background: '#dbeafe',
                              color: '#1d4ed8',
                              fontSize: '11px',
                              fontWeight: 'bold',
                            }}
                          >

                            <option value="NEW">
                              NEW
                            </option>

                          <option value="IN_PROGRESS">
                            IN PROGRESS
                          </option>

                          <option value="CLOSED">
                            CLOSED
                          </option>

                        </select>
                        ) : (
                          <span
                            style={{
                              padding: '5px 10px',
                              borderRadius: '20px',
                              background: '#dbeafe',
                              color: '#1d4ed8',
                              fontSize: '11px',
                              fontWeight: 'bold',
                            }}
                          >
                            {workOrder.status === 'IN_PROGRESS'
                              ? 'IN PROGRESS'
                              : workOrder.status}
                          </span>
                        )}

                      </div>

                    </div>
                  ),
                )
              )}

            </div>

            {/* TECHNICIANS */}
            <div className="panel">

              <div className="panel-header">
                <div>
                  <h2>Technicians</h2>
                  <p>
                    Current technician status
                  </p>
                </div>
              </div>

              {recentTechnicians.length === 0 ? (
                <p className="empty">
                  No technicians found.
                </p>
              ) : (
                recentTechnicians.map(
                  (technician) => (
                    <div
                      className="technician"
                      key={technician.id}
                    >

                      <div className="tech-avatar">
                        {technician.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="tech-details">
                        <h3>
                          {technician.name}
                        </h3>

                        <p>
                          {technician.skill}
                        </p>
                      </div>

                     <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }}
>
  <span
    style={{
      padding: '6px 10px',
      borderRadius: '20px',
      background:
        technician.status === 'AVAILABLE'
          ? '#dcfce7'
          : '#fee2e2',
      color:
        technician.status === 'AVAILABLE'
          ? '#166534'
          : '#991b1b',
      fontSize: '11px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
    }}
  >
    {technician.status === 'AVAILABLE'
      ? '🟢 AVAILABLE'
      : '🔴 BUSY'}
  </span>

  <select
    value={technician.status}
    onChange={(event) =>
      handleTechnicianStatusChange(
        technician.id,
        event.target.value,
      )
    }
    style={{
      padding: '6px 8px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      background: 'white',
      fontSize: '11px',
      cursor: 'pointer',
    }}
  >
    <option value="AVAILABLE">
      Available
    </option>

    <option value="BUSY">
      Busy
    </option>
  </select>
</div>
                      {userRole !== 'CUSTOMER' &&
  userRole !== 'TECHNICIAN' && (
    <button
      onClick={() => {
        if (
          window.confirm(
            `Delete technician ${technician.name}?`,
          )
        ) {
          handleDeleteTechnician(technician.id)
        }
      }}
      style={{
        marginLeft: '10px',
        padding: '6px 10px',
        borderRadius: '6px',
        border: 'none',
        background: '#fee2e2',
        color: '#991b1b',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
      }}
    >
      Delete
    </button>
  )}

                    </div>
                  ),
                )
              )}

            </div>

          </section>
        )}

        {/* QUICK ACTIONS */}
        <section className="quick-actions">

          <h2>Quick Actions</h2>

          <div className="actions">

            {/* CREATE WORK ORDER */}
            <button
              className="action"
              onClick={() => {
                setShowWorkOrderForm(true)
                setShowTechnicianForm(false)
              }}
            >
              <span>➕</span>
              Create Work Order
            </button>

            {/* ADD TECHNICIAN */}
            {userRole !== 'CUSTOMER' &&
              userRole !== 'TECHNICIAN' && (
                <button
                  className="action"
                  onClick={() => {
                    setShowTechnicianForm(
                      true,
                    )
                    setShowWorkOrderForm(
                      false,
                    )
                  }}
                >
                  <span>👨‍🔧</span>
                  Add Technician
                </button>
              )}

           {/* REPORTS */}
{userRole === 'ADMIN' && (
  <button
    className="action"
    onClick={() =>
      setShowReports(true)
    }
  >
    <span>📊</span>
    View Reports
  </button>
)}

          </div>

        </section>

      </main>
    </div>
  )
}

export default App

