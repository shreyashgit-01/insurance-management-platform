import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function PolicyPieChart({ policyDistribution = [] }) {
  const data = {
    labels: policyDistribution.map((item) => item.type),
    datasets: [
      {
        data: policyDistribution.map((item) => item.count),
        backgroundColor: [
          "#6366F1",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#06B6D4",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ height: "320px" }}>
      <Pie data={data} />
    </div>
  );
}

export default PolicyPieChart;