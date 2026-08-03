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

const PremiumChart = ({ data }) => {

    const chartData = {
        labels: data.map(item => item.month),
        datasets: [
            {
                label: "Premium Collection",
                data: data.map(item => item.amount),
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
    };

    return (
        <div style={{ height: "350px" }}>
            <Bar
                data={chartData}
                options={options}
            />
        </div>
    );
};

export default PremiumChart;