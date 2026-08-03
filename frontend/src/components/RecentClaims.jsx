import React from "react";

const badgeColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "PENDING":
      return "warning";
    case "REJECTED":
      return "danger";
    default:
      return "secondary";
  }
};

const RecentClaims = ({ claims }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-white">
        <h5 className="mb-0">Recent Claims</h5>
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
            {claims.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-3">
                  No Claims Found
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim.id}>
                  <td>{claim.customer}</td>
                  <td>{claim.policy}</td>
                  <td>₹{claim.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge bg-${badgeColor(claim.status)}`}>
                      {claim.status}
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

export default RecentClaims;