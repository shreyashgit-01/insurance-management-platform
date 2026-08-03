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

function PaymentsChart({ data }) {
  const chartData = {
    labels: data.map((item) => item.month),

    datasets: [
      {
        label: "Payments",

        data: data.map((item) => item.total),
      },
    ],
  };

  return <Bar data={chartData} />;
}

export default PaymentsChart;