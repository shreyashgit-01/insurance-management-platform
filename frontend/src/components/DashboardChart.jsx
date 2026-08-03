import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function DashboardChart({ monthlyPremium }) {
  const chartData = {
    labels: monthlyPremium.map((item) => item.month),

    datasets: [
      {
        label: "Premium Collection",
        data: monthlyPremium.map((item) => item.amount),
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: "350px" }}>
      <Bar
        data={chartData}
        options={options}
      />
    </div>
  );
}

export default DashboardChart;