import { Card } from "react-bootstrap";

function DashboardCard({
  title,
  value,
  icon,
  bg,
  text = "white",
}) {
  return (
    <Card
      bg={bg}
      text={text}
      className="shadow border-0 h-100"
    >
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <h6>{title}</h6>
          <h3>{value}</h3>
        </div>

        <div style={{ fontSize: "2rem" }}>
          {icon}
        </div>
      </Card.Body>
    </Card>
  );
}

export default DashboardCard;