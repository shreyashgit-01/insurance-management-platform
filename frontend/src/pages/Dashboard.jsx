import { useEffect, useState } from "react";
import { Row, Col, Button, Spinner } from "react-bootstrap";
import {
  FaUsers,
  FaFileContract,
  FaMoneyBillWave,
  FaClock,
  FaSyncAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCreditCard,
  FaClipboardList,
} from "react-icons/fa";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import api from "../services/api";

import DashboardHeader from "../components/ui/DashboardHeader";
import StatCard from "../components/ui/StatCard";
import SectionCard from "../components/ui/SectionCard";

import DashboardChart from "../components/DashboardChart";
import PolicyPieChart from "../components/PolicyPieChart";
import RecentClaims from "../components/RecentClaims";
import RecentPayments from "../components/RecentPayments";

function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    totalCustomers: 0,

    activePolicies: 0,
    expiredPolicies: 0,
    cancelledPolicies: 0,

    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,

    totalPayments: 0,

    premiumCollected: 0,
    pendingAmount: 0,

    monthlyPremium: [],
    policyDistribution: [],

    recentClaims: [],
    recentPayments: [],
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await api.get("dashboard/");

      setDashboard(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Welcome Back 👋</h2>

          <p className="text-muted mb-0">
            Insurance Management Dashboard
          </p>
        </div>

        <Button variant="outline-primary" onClick={fetchDashboard}>
          <FaSyncAlt className="me-2" />
          Refresh
        </Button>
      </div>

      <DashboardHeader />

      {/* Summary Cards */}
      <Row className="g-4">

        <Col lg={3} md={6}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <StatCard
              title="Customers"
              value={dashboard.totalCustomers}
              icon={<FaUsers />}
              color="#6366F1"
              subtitle="Registered Customers"
            />
          </motion.div>
        </Col>

        <Col lg={3} md={6}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <StatCard
              title="Active Policies"
              value={dashboard.activePolicies}
              icon={<FaFileContract />}
              color="#10B981"
              subtitle="Running Policies"
            />
          </motion.div>
        </Col>

        <Col lg={3} md={6}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <StatCard
              title="Pending Claims"
              value={dashboard.pendingClaims}
              icon={<FaClock />}
              color="#F59E0B"
              subtitle="Need Attention"
            />
          </motion.div>
        </Col>

        <Col lg={3} md={6}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <StatCard
              title="Premium Collected"
              value={`₹${dashboard.premiumCollected.toLocaleString()}`}
              icon={<FaMoneyBillWave />}
              color="#0EA5E9"
              subtitle="Total Revenue"
            />
          </motion.div>
        </Col>

        <Col lg={3} md={6}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <StatCard
              title="Total Claims"
              value={dashboard.totalClaims}
              icon={<FaClipboardList />}
              color="#8B5CF6"
              subtitle="Claims Submitted"
            />
          </motion.div>
        </Col>

        <Col lg={3} md={6}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <StatCard
              title="Approved Claims"
              value={dashboard.approvedClaims}
              icon={<FaCheckCircle />}
              color="#22C55E"
              subtitle="Successfully Approved"
            />
          </motion.div>
        </Col>

        <Col lg={3} md={6}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <StatCard
              title="Rejected Claims"
              value={dashboard.rejectedClaims}
              icon={<FaTimesCircle />}
              color="#EF4444"
              subtitle="Rejected Requests"
            />
          </motion.div>
        </Col>

        <Col lg={3} md={6}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <StatCard
              title="Payments"
              value={dashboard.totalPayments}
              icon={<FaCreditCard />}
              color="#14B8A6"
              subtitle="Completed Payments"
            />
          </motion.div>
        </Col>

      </Row>

      {/* Charts */}
      <Row className="mt-4 g-4">
        <Col lg={8}>
          <SectionCard title="Monthly Premium Collection">
            <DashboardChart
              monthlyPremium={dashboard.monthlyPremium}
            />
          </SectionCard>
        </Col>

        <Col lg={4}>
          <SectionCard title="Policy Distribution">
            <PolicyPieChart
              policyDistribution={dashboard.policyDistribution}
            />
          </SectionCard>
        </Col>
      </Row>

      {/* Recent Claims & Payments */}
      <Row className="mt-4 g-4">
        <Col lg={6}>
          <SectionCard title="Recent Claims">
            <RecentClaims
              claims={dashboard.recentClaims}
            />
          </SectionCard>
        </Col>

        <Col lg={6}>
          <SectionCard title="Recent Payments">
            <RecentPayments
              payments={dashboard.recentPayments}
            />
          </SectionCard>
        </Col>
      </Row>
    </>
  );
}

export default Dashboard;