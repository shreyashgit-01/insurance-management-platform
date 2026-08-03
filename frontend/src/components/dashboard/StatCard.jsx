const StatCard = ({ title, value, icon, color }) => {

    return (
        <div
            className="card shadow-sm border-0 h-100"
            style={{
                borderLeft: `5px solid ${color}`,
                transition: "0.3s",
            }}
        >
            <div className="card-body d-flex justify-content-between align-items-center">

                <div>

                    <small className="text-muted">
                        {title}
                    </small>

                    <h3 className="fw-bold mt-2">
                        {value}
                    </h3>

                </div>

                <div
                    style={{
                        fontSize: 38,
                        color,
                    }}
                >
                    {icon}
                </div>

            </div>
        </div>
    );

};

export default StatCard;