import React from "react";

const badgeColor = (status) => {
  switch (status) {
    case "PAID":
      return "success";
    case "PENDING":
      return "warning";
    case "FAILED":
      return "danger";
    default:
      return "secondary";
  }
};

const RecentPayments = ({ payments }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-white">
        <h5 className="mb-0">Recent Payments</h5>
      </div>

      <div className="card-body p-0">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Customer</th>
              <th>Policy</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-3">
                  No Payments Found
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.customer}</td>
                  <td>{payment.policy}</td>
                  <td>₹{payment.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge bg-${badgeColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentPayments;