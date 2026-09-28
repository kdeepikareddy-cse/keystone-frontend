 import { useEffect, useState } from 'react'
import { getTechnicians, getWorkOrders } from './services/api'

type WorkOrder = {
  id: number
  title: string
  description: string
  priority: string
  status: string
  location: string
}

type Technician = {
  id: number
  name: string
  skill: string
  status: string
  phone: string
}

function Reports() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReports() {
      try {
        const [orders, techs] = await Promise.all([
          getWorkOrders(),
          getTechnicians(),
        ])

        setWorkOrders(orders)
        setTechnicians(techs)
      } catch (error) {
        console.error('Failed to load reports:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  // WORK ORDER COUNTS
  const totalWorkOrders = workOrders.length

  const newOrders = workOrders.filter(
    (order) => order.status === 'NEW',
  ).length

  const inProgressOrders = workOrders.filter(
    (order) => order.status === 'IN_PROGRESS',
  ).length

  const closedOrders = workOrders.filter(
    (order) => order.status === 'CLOSED',
  ).length

  // PRIORITY COUNTS
  const highPriorityOrders = workOrders.filter(
    (order) => order.priority === 'HIGH',
  ).length

  const mediumPriorityOrders = workOrders.filter(
    (order) => order.priority === 'MEDIUM',
  ).length

  const lowPriorityOrders = workOrders.filter(
    (order) => order.priority === 'LOW',
  ).length

  // TECHNICIAN COUNTS
  const totalTechnicians = technicians.length

  const availableTechnicians = technicians.filter(
    (technician) => technician.status === 'AVAILABLE',
  ).length

  const busyTechnicians = technicians.filter(
    (technician) => technician.status === 'BUSY',
  ).length

  if (loading) {
    return <div className="loading">Loading reports...</div>
  }

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>KEYSTONE</h1>
          <p>Field Service Management Platform</p>
        </div>

        <div className="user">
          <span className="avatar">A</span>

          <div>
            <strong>Admin</strong>
            <small>Administrator</small>
          </div>
        </div>
      </header>

      <main className="dashboard">

        {/* TITLE */}
        <section className="welcome">
          <h2>Reports</h2>
          <p>Overview of field service operations.</p>
        </section>

        {/* MAIN STATISTICS */}
        <section className="stats">

          <div className="card">
            <span className="icon">WO</span>
            <div>
              <h3>Total Work Orders</h3>
              <strong>{totalWorkOrders}</strong>
              <p>All service requests</p>
            </div>
          </div>

          <div className="card">
            <span className="icon">NEW</span>
            <div>
              <h3>New Orders</h3>
              <strong>{newOrders}</strong>
              <p>Waiting for processing</p>
            </div>
          </div>

          <div className="card">
            <span className="icon">RUN</span>
            <div>
              <h3>In Progress</h3>
              <strong>{inProgressOrders}</strong>
              <p>Currently being handled</p>
            </div>
          </div>

          <div className="card">
            <span className="icon">DONE</span>
            <div>
              <h3>Closed Orders</h3>
              <strong>{closedOrders}</strong>
              <p>Completed requests</p>
            </div>
          </div>

        </section>

        {/* WORK ORDER REPORT */}
        <section className="content-grid">

          <div className="panel">

            <div className="panel-header">
              <div>
                <h2>Work Order Report</h2>
                <p>Current work order statistics</p>
              </div>
            </div>

            <div className="work-order">
              <div>
                <h3>Total Orders</h3>
                <p>All service requests</p>
              </div>

              <strong>{totalWorkOrders}</strong>
            </div>

            <div className="work-order">
              <div>
                <h3>New Orders</h3>
                <p>Waiting for processing</p>
              </div>

              <strong>{newOrders}</strong>
            </div>

            <div className="work-order">
              <div>
                <h3>In Progress</h3>
                <p>Currently being handled</p>
              </div>

              <strong>{inProgressOrders}</strong>
            </div>

            <div className="work-order">
              <div>
                <h3>Closed Orders</h3>
                <p>Completed service requests</p>
              </div>

              <strong>{closedOrders}</strong>
            </div>

          </div>

          {/* PRIORITY REPORT */}
          <div className="panel">

            <div className="panel-header">
              <div>
                <h2>Priority Report</h2>
                <p>Work orders by priority</p>
              </div>
            </div>

            <div className="work-order">
              <div>
                <h3>High Priority</h3>
                <p>Urgent work orders</p>
              </div>

              <strong>{highPriorityOrders}</strong>
            </div>

            <div className="work-order">
              <div>
                <h3>Medium Priority</h3>
                <p>Normal priority requests</p>
              </div>

              <strong>{mediumPriorityOrders}</strong>
            </div>

            <div className="work-order">
              <div>
                <h3>Low Priority</h3>
                <p>Lower priority requests</p>
              </div>

              <strong>{lowPriorityOrders}</strong>
            </div>

          </div>

        </section>

        {/* TECHNICIAN REPORT */}
        <section className="panel" style={{ marginTop: '25px' }}>

          <div className="panel-header">
            <div>
              <h2>Technician Report</h2>
              <p>Current technician availability</p>
            </div>
          </div>

          <div className="stats">

            <div className="card">
              <span className="icon">TECH</span>
              <div>
                <h3>Total Technicians</h3>
                <strong>{totalTechnicians}</strong>
                <p>Registered technicians</p>
              </div>
            </div>

            <div className="card">
              <span className="icon">OK</span>
              <div>
                <h3>Available</h3>
                <strong>{availableTechnicians}</strong>
                <p>Ready for work</p>
              </div>
            </div>

            <div className="card">
              <span className="icon">BUSY</span>
              <div>
                <h3>Busy</h3>
                <strong>{busyTechnicians}</strong>
                <p>Currently working</p>
              </div>
            </div>

          </div>

        </section>

        {/* RECENT WORK ORDERS */}
        <section className="panel" style={{ marginTop: '25px' }}>

          <div className="panel-header">
            <div>
              <h2>Recent Work Orders</h2>
              <p>Latest service requests</p>
            </div>
          </div>

          {workOrders.length === 0 ? (
            <p>No work orders available.</p>
          ) : (
            workOrders.slice(0, 10).map((order) => (
              <div
                className="work-order"
                key={order.id}
              >
                <div>
                  <h3>{order.title}</h3>

                  <p>{order.description}</p>

                  <small>
                    Location: {order.location}
                  </small>
                </div>

                <div>
                  <strong>{order.priority}</strong>

                  <p>{order.status}</p>
                </div>
              </div>
            ))
          )}

        </section>

      </main>
    </div>
  )
}

export default Reports